import { useRef, useState } from "react";
import type { ParsedCSVData } from "../../types";

interface Step1Props {
  onComplete: (completed: boolean) => void;
  onDataParsed: (data: ParsedCSVData, fileName: string) => void;
}

export function Step1DataSource({ onComplete, onDataParsed }: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://lost-item-found-backend.onrender.com/api/parse-csv",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Błąd podczas przetwarzania pliku");
      }

      setParsedData(data);
      setFileName(file.name);
      onDataParsed(data, file.name);
      onComplete(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd"
      );
      onComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setParsedData(null);
    setFileName(null);
    setError(null);
    onComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Źródło danych i wgrywanie pliku
        </h2>
        <p className="text-slate-600">
          Wybierz plik CSV z danymi o znalezionych przedmiotach. Pierwszy wiersz
          powinien zawierać nazwy kolumn.
        </p>
      </div>

      {/* Error message */}
      {error && (
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
            <strong>Błąd:</strong> {error}
          </div>
        </div>
      )}

      {/* File upload area */}
      {!parsedData && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isLoading
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-300 hover:border-emerald-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-10 w-10 text-emerald-500 mb-4"
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
              <p className="text-emerald-600 font-medium">
                Przetwarzanie pliku...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-slate-600 mb-2">
                Przeciągnij i upuść plik tutaj
              </p>
              <p className="text-slate-400 text-sm mb-4">lub</p>
              <button
                onClick={handleButtonClick}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Wybierz plik z dysku
              </button>
            </>
          )}
        </div>
      )}

      {/* Success: show parsed data preview */}
      {parsedData && fileName && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-emerald-800">{fileName}</div>
                <div className="text-sm text-emerald-600">
                  {parsedData.totalRows} wierszy, {parsedData.headers.length}{" "}
                  kolumn
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-emerald-700 hover:text-emerald-900 text-sm font-medium"
            >
              Zmień plik
            </button>
          </div>

          {/* Headers */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">
              Znalezione kolumny:
            </h3>
            <div className="flex flex-wrap gap-2">
              {parsedData.headers.map((header, index) => (
                <span
                  key={index}
                  className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full border border-slate-200"
                >
                  {header}
                </span>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">
              Podgląd danych (pierwsze {Math.min(5, parsedData.rows.length)} z{" "}
              {parsedData.totalRows} wierszy):
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {parsedData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left font-medium text-slate-600 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.rows.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50">
                        {parsedData.headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-2 text-slate-700 whitespace-nowrap"
                          >
                            {row[header] || (
                              <span className="text-slate-400 italic">
                                (puste)
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              Dane wyglądają poprawnie? Kliknij „Dalej", aby przejść do
              mapowania kolumn do standardowego schematu.
            </div>
          </div>
        </div>
      )}

      {/* Help info - only show when no data parsed yet */}
      {!parsedData && !isLoading && (
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-medium text-slate-700 mb-2">
            Wymagania dla pliku CSV:
          </h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Pierwszy wiersz musi zawierać nazwy kolumn</li>
            <li>• Wartości rozdzielone przecinkami</li>
            <li>• Kodowanie UTF-8</li>
          </ul>
        </div>
      )}

      {/* Template download section - only show when no data parsed yet */}
      {!parsedData && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
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
            Szablon CSV
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Nie masz jeszcze pliku? Pobierz oficjalny szablon i uzupełnij go
            danymi z Twojego biura.
          </p>
          <a
            href="/templates/odnalezione_zguby_template.csv"
            download="odnalezione_zguby_template.csv"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Pobierz szablon CSV
          </a>
          <p className="text-xs text-blue-600 mt-2">
            Ten szablon zawiera poprawną strukturę danych zgodną z krajowym
            standardem. Jego użycie pozwala całkowicie pominąć ręczne mapowanie
            kolumn.
          </p>
        </div>
      )}
    </div>
  );
}
