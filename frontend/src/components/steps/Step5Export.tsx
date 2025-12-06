import { useState, useEffect } from "react";
import type { StandardRecord, CanonicalField } from "../../types";
import { buildCsv, buildJson, downloadFile } from "../../utils/export";

interface Step5Props {
  onComplete: (completed: boolean) => void;
  records: StandardRecord[];
  schema: CanonicalField[];
}

export function Step5Export({ onComplete, records, schema }: Step5Props) {
  const [exportedFormat, setExportedFormat] = useState<"csv" | "json" | null>(
    null
  );

  // Mark step as complete when entering (it's the last step)
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  const handleExportCsv = () => {
    const csv = buildCsv(records, schema);
    downloadFile(csv, "odnalezione_zguby.csv", "text/csv;charset=utf-8");
    setExportedFormat("csv");
  };

  const handleExportJson = () => {
    const json = buildJson(records);
    downloadFile(json, "odnalezione_zguby.json", "application/json;charset=utf-8");
    setExportedFormat("json");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Eksport danych
        </h2>
        <p className="text-slate-600">
          Twoje dane zostały przetworzone i zweryfikowane. Możesz teraz pobrać
          pliki w formatach gotowych do publikacji w portalu dane.gov.pl.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-800">Podsumowanie danych</div>
            <div className="text-sm text-slate-600">
              Liczba rekordów: <strong>{records.length}</strong>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Kolumny zgodne ze schematem ({schema.length} pól)
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleExportCsv}
          className={`border-2 rounded-lg p-6 text-left transition-all ${
            exportedFormat === "csv"
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                exportedFormat === "csv" ? "bg-emerald-500" : "bg-slate-400"
              }`}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Pobierz CSV</div>
              <div className="text-xs text-slate-500">Format tabelaryczny</div>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Standardowy format CSV, łatwy do otwarcia w Excelu i innych arkuszach
            kalkulacyjnych.
          </p>
          {exportedFormat === "csv" && (
            <div className="mt-3 flex items-center gap-1 text-emerald-600 text-sm">
              <svg
                className="h-4 w-4"
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
              Pobrano
            </div>
          )}
        </button>

        <button
          onClick={handleExportJson}
          className={`border-2 rounded-lg p-6 text-left transition-all ${
            exportedFormat === "json"
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                exportedFormat === "json" ? "bg-emerald-500" : "bg-blue-500"
              }`}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Pobierz JSON</div>
              <div className="text-xs text-blue-600">Zalecany dla API</div>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Format JSON zgodny ze standardami otwartych danych. Idealny do
            integracji z innymi systemami.
          </p>
          {exportedFormat === "json" && (
            <div className="mt-3 flex items-center gap-1 text-emerald-600 text-sm">
              <svg
                className="h-4 w-4"
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
              Pobrano
            </div>
          )}
        </button>
      </div>

      {/* Instructions */}
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
          <strong>Jak opublikować dane w dane.gov.pl?</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Zaloguj się do panelu administracyjnego dane.gov.pl</li>
            <li>Utwórz nowe źródło danych lub edytuj istniejące</li>
            <li>Dodaj zasób i wgraj pobrany plik CSV lub JSON</li>
            <li>Uzupełnij opis, licencję i opublikuj zestaw danych</li>
          </ol>
        </div>
      </div>

      {/* Link to dane.gov.pl */}
      <div className="flex justify-center">
        <a
          href="https://dane.gov.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Przejdź do dane.gov.pl
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
