import { useState, useEffect, useMemo } from "react";
import { Step1DataSource } from "./steps/Step1DataSource";
import { Step2ColumnMapping } from "./steps/Step2ColumnMapping";
import { Step3Validation } from "./steps/Step3Validation";
import { Step4Preview } from "./steps/Step4Preview";
import { Step5Export } from "./steps/Step5Export";
import type {
  WizardData,
  ParsedCSVData,
  CanonicalField,
  Mapping,
  StandardRecord,
  ValidationError,
} from "../types";
import {
  transformAndValidate,
  validateRecords,
  isValueChanged,
} from "../utils/validation";
import {
  isPerfectMapping,
  saveMappingProfile,
  loadMappingProfile,
  canApplyMappingProfile,
} from "../utils/mapping";

const STEPS = [
  { id: 1, title: "Źródło danych" },
  { id: 2, title: "Mapowanie kolumn" },
  { id: 3, title: "Walidacja" },
  { id: 4, title: "Podgląd" },
  { id: 5, title: "Eksport" },
];

// Build default mapping by trying to match CSV headers to schema fields
function buildDefaultMapping(
  csvHeaders: string[],
  schema: CanonicalField[]
): Mapping {
  const mapping: Mapping = {};

  for (const field of schema) {
    const fieldNameLower = field.name.toLowerCase();
    const fieldLabelLower = field.label.toLowerCase();

    // Try to find a matching CSV header
    let matched = false;

    // First: exact match on field name
    for (const header of csvHeaders) {
      const headerLower = header.toLowerCase();
      if (headerLower === fieldNameLower) {
        mapping[field.name] = header;
        matched = true;
        break;
      }
    }

    // Second: partial match on field name
    if (!matched) {
      for (const header of csvHeaders) {
        const headerLower = header.toLowerCase();
        if (
          headerLower.includes(fieldNameLower) ||
          fieldNameLower.includes(headerLower)
        ) {
          mapping[field.name] = header;
          matched = true;
          break;
        }
      }
    }

    // Third: try matching on label
    if (!matched) {
      const labelWords = fieldLabelLower.split(/\s+/);
      for (const header of csvHeaders) {
        const headerLower = header.toLowerCase();
        // Check if any word from label appears in header
        if (labelWords.some((word) => headerLower.includes(word))) {
          mapping[field.name] = header;
          matched = true;
          break;
        }
      }
    }

    // If no match found, set to null
    if (!matched) {
      mapping[field.name] = null;
    }
  }

  return mapping;
}

export function LostItemsWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );
  const [_wizardData, setWizardData] = useState<WizardData>({
    csvData: null,
    fileName: null,
  });

  // New state for schema and mapping
  const [schema, setSchema] = useState<CanonicalField[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<Array<Record<string, string>>>([]);
  const [mapping, setMapping] = useState<Mapping>({});

  // Validation state
  const [standardRecords, setStandardRecords] = useState<StandardRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Load schema on mount
  useEffect(() => {
    fetch("http://localhost:3000/api/schema")
      .then((res) => res.json())
      .then((data: CanonicalField[]) => {
        setSchema(data);
      })
      .catch((err) => {
        console.error("Failed to load schema:", err);
      });
  }, []);

  const handleStepComplete = (step: number, completed: boolean) => {
    setCompletedSteps((prev) => ({ ...prev, [step]: completed }));
  };

  const handleDataParsed = (data: ParsedCSVData, fileName: string) => {
    setWizardData((prev) => ({
      ...prev,
      csvData: data,
      fileName,
    }));

    // Store headers and all rows
    setCsvHeaders(data.headers);
    setAllRows(data.rows);

    // Try to load saved mapping profile first
    const savedProfile = loadMappingProfile();
    if (
      savedProfile &&
      canApplyMappingProfile(savedProfile, data.headers) &&
      schema.length > 0
    ) {
      // Apply saved mapping if it's compatible
      setMapping(savedProfile.mapping);
    } else if (schema.length > 0) {
      // Build default mapping when we have both schema and headers
      const defaultMapping = buildDefaultMapping(data.headers, schema);
      setMapping(defaultMapping);
    }
  };

  // Rebuild mapping when schema loads (if we already have CSV data)
  useEffect(() => {
    if (
      schema.length > 0 &&
      csvHeaders.length > 0 &&
      Object.keys(mapping).length === 0
    ) {
      // Try to load saved mapping profile first
      const savedProfile = loadMappingProfile();
      if (savedProfile && canApplyMappingProfile(savedProfile, csvHeaders)) {
        setMapping(savedProfile.mapping);
      } else {
        const defaultMapping = buildDefaultMapping(csvHeaders, schema);
        setMapping(defaultMapping);
      }
    }
  }, [schema, csvHeaders]);

  const handleMappingChange = (updatedMapping: Mapping) => {
    setMapping(updatedMapping);
  };

  // Compute perfect mapping status
  const perfectMappingStatus = useMemo(() => {
    if (
      schema.length === 0 ||
      csvHeaders.length === 0 ||
      Object.keys(mapping).length === 0
    ) {
      return false;
    }
    return isPerfectMapping(schema, mapping, csvHeaders);
  }, [schema, csvHeaders, mapping]);

  // Save mapping profile when Step 2 is completed and user moves to Step 3
  useEffect(() => {
    if (
      currentStep === 3 &&
      completedSteps[2] === true &&
      csvHeaders.length > 0 &&
      Object.keys(mapping).length > 0
    ) {
      // Save the mapping profile for future use
      saveMappingProfile(mapping, csvHeaders);
    }
  }, [currentStep, completedSteps, mapping, csvHeaders]);

  // Transform and validate when entering Step 3 (or when mapping/allRows change)
  useEffect(() => {
    if (
      currentStep === 3 &&
      allRows.length > 0 &&
      schema.length > 0 &&
      Object.keys(mapping).length > 0
    ) {
      const result = transformAndValidate(allRows, mapping, schema);
      setStandardRecords(result.records);
      setValidationErrors(result.errors);
    }
  }, [currentStep, allRows, mapping, schema]);

  // Handle error fixes - only update if value actually changed
  const handleFixError = (
    rowIndex: number,
    field: string,
    newValue: string
  ) => {
    // Get the old value from the record
    const record = standardRecords[rowIndex];
    const oldValue = record ? (record as unknown as Record<string, string>)[field] || "" : "";

    // Check if value actually changed - if not, do nothing
    if (!isValueChanged(oldValue, newValue)) {
      // Value unchanged - do NOT update anything, error remains
      return;
    }

    // Value has changed - proceed with updates

    // Update the source CSV row first (so fixes persist)
    const csvColumn = mapping[field];
    if (csvColumn && allRows[rowIndex]) {
      const updatedAllRows = [...allRows];
      updatedAllRows[rowIndex] = {
        ...updatedAllRows[rowIndex],
        [csvColumn]: newValue,
      };
      setAllRows(updatedAllRows);
    }

    // Update the StandardRecord directly
    const updatedRecords = [...standardRecords];
    const recordToUpdate = updatedRecords[rowIndex] as unknown as Record<string, string>;
    recordToUpdate[field] = newValue;

    // Re-validate the updated records
    const newErrors = validateRecords(updatedRecords, schema);

    // Update both records and errors
    setStandardRecords(updatedRecords);
    setValidationErrors(newErrors);
  };

  // Step 3 completion is derived from validation errors
  useEffect(() => {
    if (currentStep === 3) {
      handleStepComplete(3, validationErrors.length === 0);
    }
  }, [currentStep, validationErrors.length]);

  const canGoNext = completedSteps[currentStep] === true;
  const canGoPrev = currentStep > 1;
  const isLastStep = currentStep === 5;

  const goNext = () => {
    if (canGoNext && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (canGoPrev) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1DataSource
            onComplete={(c) => handleStepComplete(1, c)}
            onDataParsed={handleDataParsed}
          />
        );
      case 2:
        return (
          <Step2ColumnMapping
            onComplete={(c) => handleStepComplete(2, c)}
            schema={schema}
            csvHeaders={csvHeaders}
            mapping={mapping}
            onChangeMapping={handleMappingChange}
            isPerfectMapping={perfectMappingStatus}
          />
        );
      case 3:
        return (
          <Step3Validation
            records={standardRecords}
            errors={validationErrors}
            schema={schema}
            onFixError={handleFixError}
          />
        );
      case 4:
        return (
          <Step4Preview
            onComplete={(c) => handleStepComplete(4, c)}
            records={standardRecords}
            schema={schema}
          />
        );
      case 5:
        return (
          <Step5Export
            onComplete={(c) => handleStepComplete(5, c)}
            records={standardRecords}
            schema={schema}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Single card containing everything */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Header inside card */}
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Odnalezione Zguby
                </h1>
                <p className="text-sm text-slate-500">
                  Kreator publikacji danych
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-emerald-600">
                  Krok {currentStep} z 5
                </div>
                <div className="text-xs text-slate-500">
                  {STEPS[currentStep - 1].title}
                </div>
              </div>
            </div>
          </div>

          {/* Progress stepper */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                        step.id < currentStep
                          ? "bg-emerald-500 text-white"
                          : step.id === currentStep
                          ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        step.id <= currentStep
                          ? "text-slate-700 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded ${
                        step.id < currentStep
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="px-6 py-6">{renderStep()}</div>

          {/* Navigation inside card */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={!canGoPrev}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  canGoPrev
                    ? "text-slate-700 hover:bg-slate-200"
                    : "text-slate-300 cursor-not-allowed"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Wstecz
              </button>

              <div className="text-sm text-slate-500">
                {!canGoNext && !isLastStep && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Ukończ bieżący krok, aby kontynuować
                  </span>
                )}
              </div>

              {!isLastStep ? (
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    canGoNext
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Dalej
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <div className="text-emerald-600 font-medium">
                  ✓ Kreator ukończony
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
