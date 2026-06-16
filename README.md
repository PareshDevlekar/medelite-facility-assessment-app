# INFINITE - Facility Assessment Report Generator

A React/TypeScript web application for generating facility assessment snapshots by combining CMS nursing home data with Medelite operational inputs.

The app searches a facility by CMS Certification Number (CCN), pulls public CMS Provider Data through a server-side API proxy, displays a report-ready facility summary with performance charts, and exports the report as PDF or Word.

Production app:

[https://facility-assessment-app.vercel.app](https://facility-assessment-app.vercel.app)

## Features

- **CCN facility lookup**: Search by 6-digit CMS Certification Number.
- **Server-side CMS proxy**: Keeps CMS Provider Data requests off the browser to avoid CORS, redirect, and query-size issues.
- **CMS star ratings**: Pulls Overall, Health Inspection, Staffing, and Quality Measure ratings.
- **Performance metrics dashboard**: Displays STR/LT hospitalization and ED metrics as responsive KPI cards and Recharts bar charts.
- **State and national benchmarks**: Compares facility metrics against CMS state and national averages.
- **Manual operational inputs**: EMR, current census, patient type, previous Medelite coverage, previous provider performance, and medical coverage.
- **Facility name override**: Optional custom name for internal report display.
- **Advanced error handling**: Typed lookup errors, partial CMS data warnings, input boundary validation, and an app-level error boundary.
- **PDF export**: Generates a branded, print-ready PDF with pagination for longer report content.
- **Word export**: Generates an editable `.docx` report.
- **Medicare Care Compare link**: Includes a direct profile link for the searched facility.

## Data Sources

CMS data is fetched server-side from CMS Provider Data APIs.

Local development uses `server.cjs`.
Vercel production uses serverless functions under `api/`.

| Purpose | CMS Dataset | ID |
| --- | --- | --- |
| Nursing home provider info, beds, star ratings | Provider Information | `4pq5-n9py` |
| Facility-level hospitalization/ED measures | Medicare Claims Quality Measures | `ijh5-nb2v` |
| State and national comparison averages | State US Averages | `xcdc-v8bm` |

Hospitalization/ED mappings:

| Measure | CMS Code / Field | App Field |
| --- | --- | --- |
| Short-stay rehospitalization | `521` | STR hospitalization |
| Short-stay outpatient ED visit | `522` | STR ED visit |
| Long-stay hospitalizations per 1,000 resident days | `551` | LT hospitalization |
| Long-stay outpatient ED visits per 1,000 resident days | `552` | LT ED visit |

Short-stay values are displayed as percentages. Long-stay values are displayed as rates per 1,000 long-stay resident days.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Charts**: Recharts
- **Local Backend Proxy**: Express
- **Production API**: Vercel Serverless Functions
- **State Management**: Zustand
- **HTTP Client**: Axios
- **PDF Generation**: jsPDF
- **Word Generation**: docx
- **Styling**: CSS
- **Deployment**: Vercel

## Project Structure

```text
facility-assessment-app/
├── api/
│   ├── facility/
│   │   └── [ccn].js              # Vercel facility lookup API
│   └── health.js                 # Vercel health check
├── server.cjs                    # Local CMS API proxy
├── src/
│   ├── components/
│   │   ├── CCNInput.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FacilityPreview.tsx
│   │   ├── HospitalizationMetrics.tsx
│   │   └── ManualInputsForm.tsx
│   ├── services/
│   │   ├── cmsApi.ts
│   │   ├── pdfGenerator.ts
│   │   └── wordGenerator.ts
│   ├── store/
│   │   └── facilityStore.ts
│   ├── styles/
│   │   └── components.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── vercel.json
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Locally

Start the CMS proxy in one terminal:

```bash
npm run server
```

Start the Vite app in another terminal:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The frontend defaults to:

- Development: `http://localhost:3001`
- Production: same-origin Vercel API routes, for example `/api/facility/686123`

To point the frontend at a different proxy URL, set:

```bash
VITE_API_URL=http://your-api-host
```

## Usage

1. Enter a 6-digit CCN, for example `686123`.
2. Click **Search Facility**.
3. Review CMS facility information, ratings, KPI cards, and hospitalization/ED charts.
4. Enter operational details.
5. Review the facility summary.
6. Click **Download PDF** or **Download Word**.

## Available Scripts

```bash
npm run dev      # Start frontend dev server
npm run server   # Start local CMS proxy on 127.0.0.1:3001
npm run build    # Type-check and build production assets
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Deployment

The app is deployed on Vercel:

[https://facility-assessment-app.vercel.app](https://facility-assessment-app.vercel.app)

Vercel config lives in `vercel.json`.

Production API routes:

- `GET /api/health`
- `GET /api/facility/:ccn`

Manual production deploy:

```bash
npx vercel --prod --yes
```

The Vercel CLI may need authentication first:

```bash
npx vercel login
```

## Testing

Sample facility:

- **CCN**: `686123`
- **Facility**: Kendall Lakes Healthcare and Rehab Center
- **State**: FL
- **Medicare Profile**: [https://www.medicare.gov/care-compare/details/nursing-home/686123](https://www.medicare.gov/care-compare/details/nursing-home/686123)

Manual test checklist:

- [ ] `npm run server` starts the local backend proxy.
- [ ] `npm run dev` starts the frontend.
- [ ] Valid CCN returns facility data.
- [ ] Invalid CCN shows a useful error.
- [ ] CMS star ratings populate.
- [ ] Hospitalization/ED metric cards and charts populate.
- [ ] Operational inputs display in preview.
- [ ] Current Census validation blocks negative values and values above certified capacity.
- [ ] Custom facility name overrides the official CMS name in exports.
- [ ] PDF export downloads and paginates long content correctly.
- [ ] Word export downloads as an editable `.docx`.
- [ ] Medicare Care Compare link points to the correct CCN.
- [ ] Production `/api/health` returns `{"status":"ok"}`.

Automated checks:

```bash
npm run build
npm run lint
```

## Error Handling

The app handles several boundary cases:

- Invalid CCN format before lookup.
- Facility not found.
- CMS lookup timeout.
- Local proxy unavailable during development.
- Vercel API/network failure in production.
- Malformed or incomplete CMS responses.
- Partial data warnings when fallback CMS sources are used or metrics are temporarily unavailable.
- Current Census values outside valid bounds.
- Unexpected render errors through `ErrorBoundary`.

## Branding Guidelines

- Use **INFINITE - Managed by MEDELITE** in generated report headers.
- Keep facility name in the report body, not as the platform brand.
- Use the official CMS facility name unless a custom override is provided.

## Known Limitations

- No authentication or user accounts.
- No saved report history.
- Operational details are not persisted after refresh.
- The local proxy currently runs on a fixed port: `3001`.
- Download behavior depends on browser settings.
- Automatic Git-based Vercel deploys may require manually connecting the GitHub repository in the Vercel dashboard.

## Troubleshooting

### Facility search fails locally

- Confirm the backend proxy is running with `npm run server`.
- Confirm the frontend is pointing to the right proxy URL.
- Verify the CCN is exactly 6 digits.
- Try the sample CCN `686123`.

### Facility search fails on Vercel

- Check [https://facility-assessment-app.vercel.app/api/health](https://facility-assessment-app.vercel.app/api/health).
- Confirm the deployment includes the `api/facility/[ccn].js` serverless function.
- Retry the sample CCN `686123`.

### CMS ratings or hospitalization metrics are missing

- Confirm the facility exists in the CMS nursing home Provider Data datasets.
- Some facilities may have footnotes or suppressed CMS measures.
- Check local backend logs or Vercel function logs for CMS API warnings.

### PDF or Word does not download

- Check browser download permissions.
- Try a different browser.
- Confirm popup/download blocking is not preventing the file save.

### Port already in use

If `3001` is already in use, stop the existing process or update `server.cjs` and `VITE_API_URL` to use another port.
