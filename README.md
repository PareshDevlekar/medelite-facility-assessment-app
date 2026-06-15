# INFINITE - Facility Assessment Report Generator

A React/TypeScript web application for generating facility assessment snapshots by combining CMS nursing home data with Medelite operational inputs.

The app searches a facility by CMS Certification Number (CCN), pulls public CMS Provider Data through a local backend proxy, displays the facility summary, and exports the report as PDF or Word.

## Features

- **CCN facility lookup**: Search by 6-digit CMS Certification Number.
- **Backend CMS proxy**: Server-side CMS requests avoid browser CORS issues and CMS GET-query limitations.
- **CMS star ratings**: Pulls Overall, Health Inspection, Staffing, and Quality Measure ratings.
- **Hospitalization/ED metrics**: Pulls the full STR/LT hospitalization and ED metric set with state and national averages.
- **Manual operational inputs**: EMR, current census, patient type, previous Medelite coverage, previous provider performance, and medical coverage.
- **Facility name override**: Optional custom name for internal report display.
- **PDF export**: Generates a branded, print-ready PDF.
- **Word export**: Generates an editable `.docx` report.
- **Medicare Care Compare link**: Includes a direct profile link for the searched facility.

## Data Sources

CMS data is fetched by `server.cjs` from CMS Provider Data APIs.

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
- **Backend Proxy**: Express
- **State Management**: Zustand
- **HTTP Client**: Axios
- **PDF Generation**: jsPDF
- **Word Generation**: docx
- **Styling**: CSS

## Project Structure

```text
facility-assessment-app/
├── server.cjs                    # Local CMS API proxy
├── src/
│   ├── components/
│   │   ├── CCNInput.tsx
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

The frontend defaults to the backend proxy at:

```text
http://localhost:3001
```

To point the frontend at a different proxy URL, set:

```bash
VITE_API_URL=http://your-api-host
```

## Usage

1. Enter a 6-digit CCN, for example `686123`.
2. Click **Search Facility**.
3. Review CMS facility information, ratings, and hospitalization/ED metrics.
4. Enter operational details.
5. Review the facility summary.
6. Click **Download PDF** or **Download Word**.

## Available Scripts

```bash
npm run dev      # Start frontend dev server
npm run server   # Start CMS proxy on 127.0.0.1:3001
npm run build    # Type-check and build production assets
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Testing

Sample facility:

- **CCN**: `686123`
- **Facility**: Kendall Lakes Healthcare and Rehab Center
- **State**: FL
- **Medicare Profile**: https://www.medicare.gov/care-compare/details/nursing-home/686123

Manual test checklist:

- [ ] `npm run server` starts the backend proxy.
- [ ] `npm run dev` starts the frontend.
- [ ] Valid CCN returns facility data.
- [ ] Invalid CCN shows an error.
- [ ] CMS star ratings populate.
- [ ] Hospitalization/ED metrics populate.
- [ ] Operational inputs display in preview.
- [ ] Custom facility name overrides the official CMS name in exports.
- [ ] PDF export downloads and is formatted correctly.
- [ ] Word export downloads as an editable `.docx`.
- [ ] Medicare Care Compare link points to the correct CCN.

Automated checks:

```bash
npm run build
npm run lint
```

## Deployment Notes

The frontend needs access to a backend proxy. CMS Provider Data requests should stay server-side because direct browser calls can run into CORS, redirect, and query-size limitations.

For production:

1. Deploy the frontend build from `dist/`.
2. Deploy `server.cjs` or an equivalent API proxy.
3. Set `VITE_API_URL` to the deployed proxy URL before building the frontend.

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

## Troubleshooting

### Facility search fails

- Confirm the backend proxy is running with `npm run server`.
- Confirm the frontend is pointing to the right proxy URL.
- Verify the CCN is exactly 6 digits.
- Try the sample CCN `686123`.

### CMS ratings or hospitalization metrics are missing

- Confirm the facility exists in the CMS nursing home Provider Data datasets.
- Some facilities may have footnotes or suppressed CMS measures.
- Check the backend terminal for CMS API warnings.

### PDF or Word does not download

- Check browser download permissions.
- Try a different browser.
- Confirm popup/download blocking is not preventing the file save.

### Port already in use

If `3001` is already in use, stop the existing process or update `server.cjs` and `VITE_API_URL` to use another port.
