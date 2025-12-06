import { useState } from "react";
import type {
  ValidationError,
  CanonicalField,
  StandardRecord,
} from "../../types";

interface Step3Props {
  records: StandardRecord[];
  errors: ValidationError[];
  schema: CanonicalField[];
  onFixError: (rowIndex: number, field: string, newValue: string) => void;
}

export function Step3Validation({
  records,
  errors,
  schema,
  onFixError,
}: Step3Props) {
  // Local state only for UI editing - NOT for tracking what's "fixed"
  const [editingError, setEditingError] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Get field label from schema
  const getFieldLabel = (fieldName: string): string => {
    const field = schema.find((f) => f.name === fieldName);
    return field?.label || fieldName;
  };

  // Get field info for enum fields
  const getFieldInfo = (fieldName: string): CanonicalField | undefined => {
    return schema.find((f) => f.name === fieldName);
  };

  const handleStartEdit = (error: ValidationError) => {
    const errorKey = `${error.rowIndex}-${error.field}`;
    setEditingError(errorKey);
    setEditValue(error.currentValue || "");
  };

  const handleSaveEdit = (error: ValidationError) => {
    // Call parent to fix the error - parent will re-validate and update errors array
    // Do NOT assume the field is fixed - let the parent re-validation determine that
    onFixError(error.rowIndex, error.field, editValue);
    // Close edit mode regardless of whether the fix was valid
    setEditingError(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingError(null);
    setEditValue("");
  };

  const totalRecords = records.length;
  // Remaining errors count comes ONLY from the errors prop - not from any local state
  const remainingErrors = errors.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Walidacja i poprawki
        </h2>
        <p className="text-slate-600">
          System sprawdził dane pod kątem błędów i niezgodności ze schematem.
          Poniżej znajdziesz listę problemów do poprawienia.
        </p>
      </div>

      {/* Summary - values computed ONLY from props */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-800">
              {totalRecords}
            </span>
            <span className="text-slate-500">rekordów łącznie</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width:
                  remainingErrors === 0
                    ? "100%"
                    : `${Math.max(
                        5,
                        ((totalRecords - remainingErrors) / totalRecords) * 100
                      )}%`,
              }}
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Do poprawienia</div>
          <div
            className={`text-xl font-bold ${
              remainingErrors === 0 ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {remainingErrors}
          </div>
        </div>
      </div>

      {/* No errors - step can be completed */}
      {errors.length === 0 ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <svg
            className="h-6 w-6 text-emerald-500"
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
          <div className="text-emerald-800">
            <strong>Nie znaleziono błędów</strong> – możesz przejść dalej.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-medium text-slate-700">Znalezione problemy:</h3>
          {errors.map((error, index) => {
            const errorKey = `${error.rowIndex}-${error.field}`;
            const isEditing = editingError === errorKey;
            const fieldInfo = getFieldInfo(error.field);
            const fieldLabel = getFieldLabel(error.field);

            return (
              <div
                key={`${error.rowIndex}-${error.field}-${index}`}
                className="border rounded-lg p-4 bg-white border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                        Wiersz {error.rowIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {fieldLabel}
                      </span>
                    </div>
                    <p className="text-sm text-red-600 mb-2">{error.message}</p>
                    {isEditing ? (
                      <div className="space-y-2">
                        {fieldInfo?.type === "enum" && fieldInfo.examples ? (
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">Wybierz wartość</option>
                            {fieldInfo.examples.map((example) => (
                              <option key={example} value={example}>
                                {example}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Wprowadź poprawną wartość"
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(error)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
                          >
                            Zapisz
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium px-3 py-1.5 rounded transition-colors"
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Aktualna wartość:{" "}
                        <code className="bg-slate-100 px-1 rounded">
                          {error.currentValue || "(puste)"}
                        </code>
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(error)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium px-3 py-1.5 rounded transition-colors"
                      >
                        Popraw
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
