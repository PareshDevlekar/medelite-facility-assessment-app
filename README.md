# INFINITE - Facility Assessment Report Generator

A lightweight web application for generating facility assessment reports by combining public CMS data with manual operational inputs.

## Features

### MVP (Core Features)
- **Dynamic CCN Lookup**: Input a CMS Certification Number to fetch facility data
- **CMS API Integration**: Automatically fetches location, star ratings, and metadata from CMS Provider Data Catalog
- **Facility Name Override**: Supports custom facility names for internal use
- **Manual Operational Inputs**: EMR system, census, patient type, coverage, performance metrics
- **PDF Export**: Download polished, print-ready PDF reports with INFINITE branding
- **Medicare Hyperlink**: Direct link to Medicare Care Compare profile in generated reports

### Data Collected
- **From CMS API**: Facility name, address, census capacity, star ratings (Overall, Health Inspection, Staffing, Quality Care)
- **Manual Input**: EMR, current census, patient type, previous Medelite coverage, performance metrics, medical coverage

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **PDF Generation**: jsPDF
- **HTTP Client**: Axios
- **Styling**: CSS3

## Project Structure

```
src/
├── components/          # React components
│   ├── CCNInput.tsx     # Facility search form
│   ├── ManualInputsForm.tsx  # Operational data inputs
│   └── FacilityPreview.tsx   # Report preview & export
├── services/            # API integration & utilities
│   ├── cmsApi.ts        # CMS API service
│   └── pdfGenerator.ts  # PDF generation service
├── store/               # State management
│   └── facilityStore.ts # Zustand store
├── styles/              # CSS stylesheets
│   └── components.css   # Component styles
├── types/               # TypeScript type definitions
│   └── index.ts         # Interface definitions
├── App.tsx              # Main app component
├── App.css              # App layout styles
├── index.css            # Global styles
└── main.tsx             # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The dev server runs on `http://localhost:5173` with HMR (Hot Module Replacement).

```bash
npm run dev
```

## Usage

1. **Search for a Facility**:
   - Enter a 6-digit CMS Certification Number (CCN)
   - Click "Search Facility"
   - Application fetches data from CMS API

2. **Review CMS Data**:
   - Confirm facility name, location, and star ratings
   - Optionally override facility name for internal use

3. **Enter Operational Details**:
   - Fill in EMR system, current census, patient type
   - Specify previous Medelite coverage and performance
   - Add medical coverage information

4. **Generate Report**:
   - Review facility summary in preview
   - Click "Download PDF" to generate and download report
   - PDF includes INFINITE branding and Medicare hyperlink

## API Integration

### CMS Provider Data Catalog API
- **Endpoint**: `https://data.cms.gov/api/3/action/datastore_search_sql`
- **Dataset**: `4pf6-v853` (Provider of Services)
- **Fields Used**: CCN, Provider Name, Address, Star Ratings, Certified Beds

### Rate Limiting
- CMS API allows reasonable usage rates
- Implement retry logic if needed
- Current implementation uses 10-second timeout

## Branding Guidelines

- **Platform Name**: "INFINITE — Managed by MEDELITE" (hardcoded in header)
- **Header Display**: Facility Assessment Snapshot + State abbreviation
- **Report Body**: Facility name field displays custom name (if provided) or official legal name
- **Critical**: Do NOT replace "INFINITE" branding with facility name

## Testing

### Sample Data
- **CCN**: 686123
- **Facility**: Kendall Lakes Healthcare and Rehab Center, FL
- **Medicare Profile**: https://www.medicare.gov/care-compare/details/nursing-home/686123

### Manual Testing Checklist
- [ ] CCN search returns correct facility data
- [ ] Invalid CCN shows error message
- [ ] Custom facility name overrides API name in report
- [ ] All operational fields save and display correctly
- [ ] PDF downloads with correct formatting
- [ ] Medicare hyperlink is clickable in PDF
- [ ] INFINITE branding appears correctly on header and PDF

## Deployment

### Build for Production
```bash
npm run build
```

Output is in `dist/` directory.

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables
Currently no environment variables required. If deploying with a backend proxy for CMS API:
- `VITE_API_BASE_URL`: Backend API base URL

## Future Enhancements (Bonus Features)

- [ ] 12 Hospitalization/ED Metrics (STR & LT with state/national averages)
- [ ] Word (.docx) export
- [ ] Charts and data visualizations
- [ ] Advanced error handling and edge cases
- [ ] Facility search history
- [ ] Batch processing multiple facilities
- [ ] Report templates

## Known Limitations

- CCN validation is basic (6-digit format only)
- No authentication/authorization
- No data persistence (localStorage could be added)
- CMS API calls are direct from browser (CORS may require backend proxy in production)

## Troubleshooting

### "No facility found with CCN"
- Verify CCN is correct and exists in CMS database
- Check internet connection
- Try again in a few moments (API may be rate-limited)

### PDF not downloading
- Check browser download settings
- Clear browser cache
- Try a different browser

### CMS API errors
- Verify CCN format (6 digits)
- Check network connectivity
- Review CMS API status page
