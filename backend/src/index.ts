import express from "express";
import cors from "cors";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join } from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS for frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lost-item-found-frontend.vercel.app"
    ],
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Load schema on startup
let schema: CanonicalField[] = [];
try {
  // Path from backend/src to spec/ (works with both tsx and compiled code)
  // When running with tsx: __dirname = backend/src, so ../../spec works
  // When compiled: __dirname = backend/dist, so ../../spec also works
  const schemaPath = join(__dirname, "../../spec/lost_items_schema.json");
  const schemaContent = readFileSync(schemaPath, "utf-8");
  schema = JSON.parse(schemaContent) as CanonicalField[];
  console.log(`✅ Loaded schema with ${schema.length} fields`);
} catch (error) {
  console.error("❌ Failed to load schema:", error);
}

// TypeScript type for schema fields
export type CanonicalField = {
  name: string;
  label: string;
  required: boolean;
  type: string;
  examples?: string[];
};

app.get("/", (_req, res) => {
  res.json({
    message: "Odnalezione Zguby API",
    version: "0.0.1",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Schema endpoint
app.get("/api/schema", (_req, res) => {
  res.json(schema);
});

// CSV parsing endpoint
app.post("/api/parse-csv", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Nie przesłano pliku" });
      return;
    }

    // Parse CSV from buffer
    const csvContent = req.file.buffer.toString("utf-8");

    const records: string[][] = parse(csvContent, {
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      res.status(400).json({ error: "Plik CSV jest pusty" });
      return;
    }

    // First row = headers
    const headers = records[0];
    const dataRows = records.slice(1);

    // Convert rows to objects
    const allRows = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });

    // Return all rows - frontend will show preview of first 5 in Step 1
    // but process all rows for validation and export
    res.json({
      headers,
      rows: allRows,
      totalRows: allRows.length,
    });
  } catch (error) {
    console.error("CSV parsing error:", error);
    res.status(400).json({
      error: "Nie udało się przetworzyć pliku CSV. Sprawdź format pliku.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});