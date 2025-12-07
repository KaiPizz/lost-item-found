# Odnalezione Zguby – Kreator Publikacji Danych

**HackNation 2025** – National Hackathon, Bydgoszcz

> A 5-step wizard that helps Polish municipal offices transform their messy "lost & found" registers into unified, validated datasets ready for publication on [dane.gov.pl](https://dane.gov.pl).

---

## Problem

Polish municipalities maintain "lost & found" registers (pol. _biura rzeczy znalezionych_) in diverse formats — Excel spreadsheets, exports from internal systems, or hand-typed CSVs. The reality is chaotic:

- **Column names differ** — one office uses `data_znalezienia`, another `kiedy_znaleziono`
- **Date formats vary** — `2024-01-15`, `15.01.2024`, `15/01/24`
- **Categories are inconsistent** — `Dokumenty`, `dokument`, `DOKUMENT`
- **Required fields are missing** — partial data, empty cells, legacy cruft

When these files are uploaded to **dane.gov.pl** (Poland's open data portal), machines expect consistent, standardized data. This gap creates friction: smaller offices lack technical resources to clean their data, so they either publish nothing or upload messy files that degrade data quality for everyone.

---

## Solution

**Odnalezione Zguby** provides a guided 5-step wizard designed for non-technical municipal clerks. No coding, no manual CSV surgery — just drag, map, fix, preview, and export.

The tool:

1. **Accepts arbitrary CSV exports** — whatever format your office uses
2. **Maps columns to a canonical schema** — smart auto-detection + manual override
3. **Validates every record** — required fields, date formats, enum values
4. **Allows inline fixes** — edit invalid values directly in the browser
5. **Exports clean data** — CSV or JSON, schema-compliant, ready for dane.gov.pl

---

## Key Features

- **Schema-driven column mapping** — canonical "lost item" schema in `/spec/lost_items_schema.json`
- **Auto-mapping for "ideal" CSVs** — if your CSV uses standard column names, mapping is automatic
- **Manual mapping for legacy CSVs** — drag & drop or select from dropdown for non-standard exports
- **Validation rules**:
  - Required fields must not be empty
  - Dates in acceptable formats (ISO 8601, `YYYY-MM-DD`)
  - Enum fields validated against allowed values (`status`, `item_category`)
- **Inline editing** — fix invalid values directly in the validation table
- **Real-time re-validation** — errors clear immediately after valid edits
- **Clean preview** — review standardized records before export
- **CSV & JSON export** — using canonical schema field order
- **Mapping profile persistence** — mappings saved in `localStorage` for repeat uploads

---

## Architecture

```text
lost-item-found/
├── frontend/               # React + TypeScript wizard (steps 1–5)
│   ├── src/
│   │   ├── components/     # Wizard UI components
│   │   │   ├── LostItemsWizard.tsx
│   │   │   └── steps/      # Step1–Step5 components
│   │   ├── utils/          # Validation, mapping, export logic
│   │   └── types.ts        # Shared TypeScript types
│   └── ...
├── backend/                # Node + Express API server
│   └── src/
│       └── index.ts        # Schema endpoint + CSV parsing
└── spec/
    └── lost_items_schema.json  # Canonical schema for lost items
```

| Layer        | Tech Stack                                 | Purpose                              |
| ------------ | ------------------------------------------ | ------------------------------------ |
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS | 5-step wizard UI, validation, export |
| **Backend**  | Node.js + Express + TypeScript             | Serves schema, parses uploaded CSVs  |
| **Spec**     | JSON Schema                                | Defines canonical data structure     |

---

## Data Flow (End-to-End)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   CSV File    ──►   Step 1    ──►   Step 2    ──►   Step 3    ──►   Step 4  │
│   (messy)         Upload &        Column          Validation      Preview   │
│                   Parse           Mapping         & Fixes                   │
│                                                                             │
│                                                       │                     │
│                                                       ▼                     │
│                                                   Step 5                    │
│                                                   Export                    │
│                                                   CSV/JSON                  │
│                                                   (clean)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Breakdown

| Step              | What Happens                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **1. Upload**     | User uploads CSV → backend parses → frontend receives `headers`, `sampleRows`, `totalRows`                                     |
| **2. Mapping**    | Frontend fetches schema → user maps CSV headers to canonical fields → required fields enforced                                 |
| **3. Validation** | Rows transformed to `StandardRecord` → validated: required fields, date formats, enum values → errors shown inline with fix UI |
| **4. Preview**    | Clean `StandardRecord[]` displayed in final format after all fixes                                                             |
| **5. Export**     | Generate CSV or JSON using canonical schema field order → download                                                             |

---

## Canonical Schema

The schema (`/spec/lost_items_schema.json`) defines 10 fields for lost items:

| Field                 | Label (PL)             | Type   | Required |
| --------------------- | ---------------------- | ------ | -------- |
| `id`                  | ID rekordu             | string | ✅       |
| `item_category`       | Kategoria przedmiotu   | enum   | ✅       |
| `item_description`    | Opis przedmiotu        | string | ✅       |
| `found_date`          | Data znalezienia       | date   | ✅       |
| `found_location_name` | Miejsce znalezienia    | string | ✅       |
| `municipality_name`   | Nazwa jednostki        | string | ✅       |
| `storage_place`       | Miejsce przechowywania | string | ❌       |
| `status`              | Status przedmiotu      | enum   | ✅       |
| `claim_deadline`      | Termin odbioru         | date   | ❌       |
| `contact_channel`     | Kanał kontaktu         | string | ❌       |

**Enum values:**

- `item_category`: `dokument`, `elektronika`, `odzież`, `klucze`, `inne`
- `status`: `przechowywany`, `wydany właścicielowi`, `zlikwidowany`

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-team/lost-item-found.git
cd lost-item-found

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1: Start backend (port 3000)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Test Data

Sample CSV files are available in the app (Step 1):

| File          | Description                                    |
| ------------- | ---------------------------------------------- |
| `Szablon CSV` | Official template — auto-maps perfectly        |
| `Błędny CSV`  | Contains validation errors — for testing fixes |

---

## Team

Built with ❤️ at **HackNation 2025**, Bydgoszcz

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## Linki HackNation

| Co        | Link                                         |
| --------- | -------------------------------------------- |
| **Demo**  | https://lost-item-found-frontend.vercel.app/ |
| **Wideo** | _(do uzupełnienia)_                          |

---

<p align="center">
  <strong>dane.gov.pl · HackNation 2025 · Bydgoszcz</strong>
</p>
