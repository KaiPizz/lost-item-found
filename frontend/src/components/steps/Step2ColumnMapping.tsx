import { useEffect } from "react";
import type { CanonicalField, Mapping } from "../../types";
import { formatFieldDescription } from "../../utils/mapping";

interface Step2Props {
  onComplete: (completed: boolean) => void;
  schema: CanonicalField[];
  schemaLoading: boolean;
  schemaError: string | null;
  csvHeaders: string[];
  mapping: Mapping;
  onChangeMapping: (mapping: Mapping) => void;
  isPerfectMapping: boolean;
}

export function Step2ColumnMapping({
  onComplete,
  schema,
  schemaLoading,
  schemaError,
  csvHeaders,
  mapping,
  onChangeMapping,
  isPerfectMapping,
}: Step2Props) {
  // Check for missing required fields
  const missingRequired = schema.filter(
    (field) => field.required && !mapping[field.name]
  );

  const isStepComplete = missingRequired.length === 0;

  // Update completion status whenever mapping or missingRequired changes
  useEffect(() => {
    onComplete(isStepComplete);
  }, [isStepComplete, onComplete]);

  const handleMappingChange = (fieldName: string, csvHeader: string) => {
    const updatedMapping: Mapping = {
      ...mapping,
      [fieldName]: csvHeader || null,
    };
    onChangeMapping(updatedMapping);
  };

  // Show loading state with spinner
  if (schemaLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Mapowanie kolumn
          </h2>
          <p className="text-slate-600">
            Przypisz kolumny z Twojego pliku do pól standardowego schematu
            danych.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-slate-600">Ładowanie schematu danych...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if schema failed to load
  if (schemaError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Mapowanie kolumn
          </h2>
          <p className="text-slate-600">
            Przypisz kolumny z Twojego pliku do pól standardowego schematu
            danych.
          </p>
        </div>
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <svg
            className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-red-800">
            <strong>Błąd:</strong> {schemaError}
          </div>
        </div>
      </div>
    );
  }

  // If no schema loaded (shouldn't happen if loading finished without error)
  if (schema.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Mapowanie kolumn
          </h2>
          <p className="text-slate-600">
            Przypisz kolumny z Twojego pliku do pól standardowego schematu
            danych.
          </p>
        </div>
        <div className="text-slate-500 text-center py-8">
          Schemat danych nie jest dostępny.
        </div>
      </div>
    );
  }

  if (csvHeaders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Mapowanie kolumn
          </h2>
          <p className="text-slate-600">
            Przypisz kolumny z Twojego pliku do pól standardowego schematu
            danych.
          </p>
        </div>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <svg
            className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-amber-800">
            Najpierw wgraj plik CSV w poprzednim kroku.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          Mapowanie kolumn
        </h2>
        <p className="text-slate-600">
          Przypisz kolumny z Twojego pliku do pól standardowego schematu danych.
          Dzięki temu wszystkie urzędy będą publikować dane w jednolitym
          formacie.
        </p>
      </div>

      {/* Perfect mapping info box */}
      {isPerfectMapping && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <svg
            className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-emerald-800">
            <strong>Rozpoznaliśmy standardowy szablon danych.</strong> Wszystkie
            wymagane pola zostały dopasowane automatycznie. Możesz przejść dalej
            lub w razie potrzeby zmienić przypisania.
          </div>
        </div>
      )}

      {/* General info box */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <svg
          className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0"
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
        <div className="text-sm text-blue-800">
          Jeśli korzystasz z naszego szablonu CSV, większość pól powinna być już
          dopasowana automatycznie. Jeśli dane pochodzą z innego systemu,
          dopasuj ręcznie, co oznacza każda kolumna.
        </div>
      </div>

      {/* Warning for missing required fields */}
      {missingRequired.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <svg
            className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-amber-800">
            <strong>Uwaga:</strong> Następujące pola wymagane nie mają
            przypisanej kolumny:{" "}
            <span className="font-medium">
              {missingRequired.map((f) => f.label).join(", ")}
            </span>
            . Przypisz kolumny do tych pól, aby kontynuować.
          </div>
        </div>
      )}

      {/* Mapping table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
          <div>Pole w schemacie danych</div>
          <div>Kolumna z Twojego pliku</div>
        </div>

        <div className="divide-y divide-slate-100">
          {schema.map((field) => {
            const currentValue = mapping[field.name] || "";
            const description = formatFieldDescription(field);
            return (
              <div
                key={field.name}
                className={`grid grid-cols-2 gap-4 p-4 items-center ${
                  field.required && !mapping[field.name] ? "bg-amber-50" : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium text-slate-800">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{description}</div>
                </div>
                <select
                  value={currentValue}
                  onChange={(e) =>
                    handleMappingChange(field.name, e.target.value)
                  }
                  className={`border rounded-lg px-3 py-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer ${
                    field.required && !mapping[field.name]
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-300"
                  }`}
                >
                  <option value="">(brak)</option>
                  {csvHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      <div className="text-sm text-slate-500">
        <strong className="text-slate-600">Wskazówka:</strong> Pola oznaczone
        gwiazdką (*) są wymagane. Jeśli pole nie pasuje do żadnej kolumny,
        pozostaw "(brak)" - ale pamiętaj, że pola wymagane muszą mieć przypisaną
        kolumnę.
      </div>
    </div>
  );
}
