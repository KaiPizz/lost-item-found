// Shared types for the wizard

export interface ParsedCSVData {
  headers: string[];
  rows: Array<Record<string, string>>;
  totalRows: number;
}

// Canonical schema field type
export interface CanonicalField {
  name: string;
  label: string;
  required: boolean;
  type: string;
  examples?: string[];
}

// Mapping: key = schema field name, value = CSV column name or null
export type Mapping = Record<string, string | null>;

// Standard record matching the canonical schema
export interface StandardRecord {
  id: string;
  item_category: string;
  item_description: string;
  found_date: string;
  found_location_name: string;
  municipality_name: string;
  storage_place?: string;
  status: string;
  claim_deadline?: string;
  contact_channel?: string;
}

// Validation error
export interface ValidationError {
  rowIndex: number;
  field: string; // schema field name
  message: string;
  currentValue: string | null;
}
