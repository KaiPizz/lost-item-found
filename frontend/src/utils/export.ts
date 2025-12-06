import type { StandardRecord, CanonicalField } from "../types";

/**
 * Escapes a CSV value by wrapping it in quotes if necessary
 */
function escapeCsvValue(value: string | undefined | null): string {
  const str = value ?? "";

  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Builds a CSV string from records using schema-defined column order
 */
export function buildCsv(
  records: StandardRecord[],
  schema: CanonicalField[]
): string {
  // Header row: use schema field names
  const headers = schema.map((field) => field.name);
  const headerRow = headers.map(escapeCsvValue).join(",");

  // Data rows
  const dataRows = records.map((record) => {
    return schema
      .map((field) => {
        const value = record[field.name as keyof StandardRecord] as
          | string
          | undefined;
        return escapeCsvValue(value);
      })
      .join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Builds a JSON string from records
 */
export function buildJson(records: StandardRecord[]): string {
  return JSON.stringify(records, null, 2);
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  // Create a Blob with the content
  const blob = new Blob([content], { type: mimeType });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a hidden anchor element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  URL.revokeObjectURL(url);
}

