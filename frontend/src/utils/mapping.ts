import type { CanonicalField, Mapping } from "../types";

/**
 * Checks if a mapping is "perfect" - all required fields mapped and using standard template
 */
export function isPerfectMapping(
  schema: CanonicalField[],
  mapping: Mapping,
  csvHeaders: string[]
): boolean {
  // Check 1: Every required field has a non-null mapping
  const allRequiredMapped = schema.every(
    (field) => !field.required || mapping[field.name] !== null
  );

  if (!allRequiredMapped) {
    return false;
  }

  // Check 2: All mapped values are unique CSV headers (no duplicates)
  const mappedValues = Object.values(mapping).filter(
    (v): v is string => v !== null
  );
  const uniqueMappedValues = new Set(mappedValues);
  if (mappedValues.length !== uniqueMappedValues.size) {
    return false;
  }

  // Check 3: All mapped headers exist in csvHeaders
  const allMappedHeadersExist = mappedValues.every((header) =>
    csvHeaders.includes(header)
  );

  if (!allMappedHeadersExist) {
    return false;
  }

  // Check 4: For each field, the mapped header matches field.name or normalized field.label
  // This detects the "standard CSV template" case
  let perfectMatches = 0;
  for (const field of schema) {
    const mappedHeader = mapping[field.name];
    if (mappedHeader) {
      const headerLower = mappedHeader.toLowerCase().trim();
      const fieldNameLower = field.name.toLowerCase();
      const fieldLabelNormalized = field.label
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "");

      if (
        headerLower === fieldNameLower ||
        headerLower === fieldLabelNormalized ||
        headerLower.includes(fieldNameLower) ||
        fieldLabelNormalized.includes(headerLower)
      ) {
        perfectMatches++;
      }
    }
  }

  // Consider it perfect if at least 80% of mapped fields match perfectly
  const mappedFieldsCount = mappedValues.length;
  return mappedFieldsCount > 0 && perfectMatches / mappedFieldsCount >= 0.8;
}

/**
 * Formats field description for display
 */
export function formatFieldDescription(field: CanonicalField): string {
  const parts: string[] = [];

  // Type
  let typeLabel = field.type;
  if (field.type === "enum") {
    typeLabel = "enum";
  } else if (field.type === "date") {
    typeLabel = "data";
  } else if (field.type === "string") {
    typeLabel = "tekst";
  }

  parts.push(`Typ: ${typeLabel}`);

  // Required flag
  if (field.required) {
    parts.push("wymagane");
  } else {
    parts.push("pole opcjonalne");
  }

  // Examples or format hint
  if (field.type === "date") {
    parts.push("Oczekiwany format: YYYY-MM-DD");
  } else if (field.type === "enum" && field.examples && field.examples.length > 0) {
    const examplesStr =
      field.examples.length > 3
        ? `${field.examples.slice(0, 3).join(", ")}, …`
        : field.examples.join(", ");
    parts.push(`Przykłady: ${examplesStr}`);
  }

  return parts.join(". ") + ".";
}

/**
 * Mapping profile stored in localStorage
 */
export interface MappingProfile {
  schemaVersion: string;
  mapping: Mapping;
  csvHeaders: string[];
}

const MAPPING_PROFILE_KEY = "lostItemsMappingProfile";
const CURRENT_SCHEMA_VERSION = "v1";

/**
 * Save mapping profile to localStorage
 */
export function saveMappingProfile(
  mapping: Mapping,
  csvHeaders: string[]
): void {
  const profile: MappingProfile = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    mapping,
    csvHeaders,
  };
  try {
    localStorage.setItem(MAPPING_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("Failed to save mapping profile:", error);
  }
}

/**
 * Load mapping profile from localStorage
 */
export function loadMappingProfile(): MappingProfile | null {
  try {
    const saved = localStorage.getItem(MAPPING_PROFILE_KEY);
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved) as MappingProfile;
    return parsed;
  } catch (error) {
    console.warn("Failed to load mapping profile:", error);
    return null;
  }
}

/**
 * Check if a saved mapping profile can be applied to current CSV headers
 */
export function canApplyMappingProfile(
  profile: MappingProfile,
  currentCsvHeaders: string[]
): boolean {
  // Basic sanity check: same schemaVersion
  if (profile.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return false;
  }

  // Check if all mapped columns exist in current CSV headers
  const mappedHeaders = Object.values(profile.mapping).filter(
    (v): v is string => v !== null
  );

  return mappedHeaders.every((header) => currentCsvHeaders.includes(header));
}

