import { useEffect, useMemo } from "react";
import type { StandardRecord, CanonicalField } from "../../types";

interface Step4Props {
  onComplete: (completed: boolean) => void;
  records: StandardRecord[];
  schema: CanonicalField[];
}

export function Step4Preview({ onComplete, records, schema }: Step4Props) {
  // Auto-complete this step since it's just a preview
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  // Compute summary statistics from real data
  const stats = useMemo(() => {
    const totalRecords = records.length;

    // Get distinct categories (item_category field)
    const categories = new Set(
      records.map((r) => r.item_category).filter(Boolean)
    );
    const distinctCategories = categories.size;

    // Get distinct locations (found_location_name field)
    const locations = new Set(
      records.map((r) => r.found_location_name).filter(Boolean)
    );
    const distinctLocations = locations.size;

    return {
      totalRecords,
      distinctCategories,
      distinctLocations,
    };
  }, [records]);

  // Get preview rows (first 5)
  const previewRows = records.slice(0, 5);

  // If no records yet, show placeholder
  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Podgląd i podsumowanie
          </h2>
          <p className="text-slate-600">
            Brak danych do podglądu. Wróć do poprzednich kroków i wgraj plik
            CSV.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Podgląd i podsumowanie
        </h2>
        <p className="text-slate-600">
          Sprawdź jak będą wyglądać Twoje dane po przetworzeniu. Poniżej widzisz
          próbkę pierwszych rekordów.
        </p>
      </div>

      {/* Summary boxes with real data */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">
            {stats.totalRecords}
          </div>
          <div className="text-sm text-emerald-700">Rekordów łącznie</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.distinctCategories}
          </div>
          <div className="text-sm text-blue-700">Kategorii</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.distinctLocations}
          </div>
          <div className="text-sm text-purple-700">Lokalizacji</div>
        </div>
      </div>

      {/* Dynamic table based on schema */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {schema.map((field) => (
                  <th
                    key={field.name}
                    className="px-4 py-3 text-left font-medium text-slate-600 whitespace-nowrap"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50">
                  {schema.map((field) => {
                    const value =
                      row[field.name as keyof StandardRecord] as string;
                    const isCategory = field.name === "item_category";
                    const isStatus = field.name === "status";

                    return (
                      <td
                        key={field.name}
                        className="px-4 py-3 text-slate-700 whitespace-nowrap"
                      >
                        {isCategory || isStatus ? (
                          value ? (
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                              {value}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">
                              (puste)
                            </span>
                          )
                        ) : value ? (
                          value
                        ) : (
                          <span className="text-slate-400 italic">(puste)</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-2 text-sm text-slate-500 border-t border-slate-200">
          Wyświetlono {previewRows.length} z {stats.totalRecords} rekordów
        </div>
      </div>

      {/* Info box */}
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
          <strong>Wszystko wygląda dobrze?</strong> Przejdź do następnego kroku,
          aby wyeksportować dane w formacie zgodnym z dane.gov.pl.
        </div>
      </div>
    </div>
  );
}
