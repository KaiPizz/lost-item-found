import type {
  StandardRecord,
  ValidationError,
  Mapping,
  CanonicalField,
} from "../types";

/**
 * Checks if a value has actually changed (trimmed comparison)
 */
export function isValueChanged(
  oldValue: string | null | undefined,
  newValue: string
): boolean {
  const oldTrimmed = (oldValue || "").trim();
  const newTrimmed = newValue.trim();
  return oldTrimmed !== newTrimmed;
}

/**
 * Validates a date string (accepts ISO format or yyyy-mm-dd)
 */
function isValidDate(dateString: string): boolean {
  if (!dateString || dateString.trim() === "") return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates if a value matches an enum (case-insensitive)
 */
function isValidEnum(value: string, examples: string[]): boolean {
  if (!value || value.trim() === "") return false;
  const valueLower = value.toLowerCase().trim();
  return examples.some((example) => example.toLowerCase() === valueLower);
}

/**
 * Validates a single record against the schema
 */
function validateRecord(
  record: StandardRecord,
  rowIndex: number,
  schema: CanonicalField[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of schema) {
    const value = record[field.name as keyof StandardRecord] as
      | string
      | undefined;
    const valueStr = value || "";
    const isEmpty = valueStr.trim() === "";

    // Check required fields
    if (field.required && isEmpty) {
      errors.push({
        rowIndex,
        field: field.name,
        message: `Pole wymagane "${field.label}" jest puste`,
        currentValue: null,
      });
      continue; // Skip other validations if empty and required
    }

    // Skip validation for empty optional fields
    if (isEmpty) {
      continue;
    }

    // Validate date fields
    if (field.type === "date") {
      if (!isValidDate(valueStr)) {
        errors.push({
          rowIndex,
          field: field.name,
          message: `Nieprawidłowy format daty dla pola "${field.label}". Oczekiwany format: YYYY-MM-DD`,
          currentValue: valueStr,
        });
      }
    }

    // Validate enum fields
    if (field.type === "enum" && field.examples && field.examples.length > 0) {
      if (!isValidEnum(valueStr, field.examples)) {
        errors.push({
          rowIndex,
          field: field.name,
          message: `Nieprawidłowa wartość dla pola "${field.label}". Dozwolone wartości: ${field.examples.join(", ")}`,
          currentValue: valueStr,
        });
      }
    }
  }

  return errors;
}

/**
 * Transforms CSV rows to StandardRecord format and validates them
 */
export function transformAndValidate(
  sampleRows: Array<Record<string, string>>,
  mapping: Mapping,
  schema: CanonicalField[]
): {
  records: StandardRecord[];
  errors: ValidationError[];
} {
  const records: StandardRecord[] = [];
  const errors: ValidationError[] = [];

  for (let rowIndex = 0; rowIndex < sampleRows.length; rowIndex++) {
    const row = sampleRows[rowIndex];
    const record: Partial<StandardRecord> = {};

    // Transform: map CSV columns to schema fields
    for (const field of schema) {
      const csvColumn = mapping[field.name];
      if (csvColumn && row[csvColumn] !== undefined) {
        const value = row[csvColumn] || "";
        (record as Record<string, string | undefined>)[field.name] = value;
      } else {
        // No mapping or empty - set to empty string for required, undefined for optional
        if (field.required) {
          (record as Record<string, string>)[field.name] = "";
        }
      }
    }

    // Type assertion - we'll validate below
    const standardRecord = record as StandardRecord;

    // Validate the record
    const recordErrors = validateRecord(standardRecord, rowIndex, schema);
    errors.push(...recordErrors);

    records.push(standardRecord);
  }

  return { records, errors };
}

/**
 * Validates already-transformed records (used after fixing errors)
 */
export function validateRecords(
  records: StandardRecord[],
  schema: CanonicalField[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (let rowIndex = 0; rowIndex < records.length; rowIndex++) {
    const recordErrors = validateRecord(records[rowIndex], rowIndex, schema);
    errors.push(...recordErrors);
  }

  return errors;
}
