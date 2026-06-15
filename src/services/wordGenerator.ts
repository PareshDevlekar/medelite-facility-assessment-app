import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { FacilityData } from '../types';

const formatRating = (rating?: number) => rating ? `${rating}/5` : 'N/A';
const formatNumber = (value: number) => value.toFixed(1);
const formatPercent = (value?: number) => value !== undefined ? `${formatNumber(value)}%` : 'N/A';
const formatPerThousand = (value?: number) => value !== undefined ? formatNumber(value) : 'N/A';
const displayValue = (value: string | number | undefined) => value === undefined || value === '' ? 'N/A' : String(value);

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
  left: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
  insideVertical: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
};

const text = (content: string, options: { bold?: boolean; color?: string; size?: number } = {}) =>
  new TextRun({
    text: content,
    bold: options.bold,
    color: options.color ?? '111827',
    size: options.size ?? 22,
  });

const sectionHeading = (content: string) =>
  new Paragraph({
    text: content,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
  });

const paragraph = (content: string, options: { bold?: boolean; color?: string; size?: number } = {}) =>
  new Paragraph({
    children: [text(content, options)],
    spacing: { after: 80 },
  });

const makeCell = (content: string, isLabel = false) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [text(content, { bold: isLabel, color: isLabel ? '374151' : '4B5563' })],
      }),
    ],
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
  });

const makeTable = (rows: Array<[string, string | number | undefined]>) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [3600, 5600],
    borders: tableBorders,
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          makeCell(label, true),
          makeCell(displayValue(value)),
        ],
      })
    ),
  });

const hasHospitalizationMetrics = (facilityData: FacilityData) =>
  facilityData.strHospitalization !== undefined ||
  facilityData.ltHospitalization !== undefined ||
  facilityData.strEDVisit !== undefined ||
  facilityData.ltEDVisit !== undefined;

const createDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const generateWordDocument = async (facilityData: FacilityData): Promise<void> => {
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`;
  const displayName = facilityData.customName || facilityData.legalName;

  const children = [
    new Paragraph({
      children: [text('INFINITE - Managed by MEDELITE', { bold: true, color: '1F2B44', size: 32 })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [text('FACILITY ASSESSMENT SNAPSHOT', { bold: true, color: '1F2B44', size: 26 })],
      spacing: { after: 240 },
    }),

    sectionHeading('FACILITY INFORMATION'),
    makeTable([
      ['Name of Facility:', displayName],
      ['Location:', `${facilityData.address}, ${facilityData.city}, ${facilityData.state} ${facilityData.zip}`],
      ['EMR:', facilityData.emr],
      ['Census Capacity:', facilityData.censusCapacity],
      ['Current Census:', facilityData.currentCensus],
      ['Type of Patient:', facilityData.patientType],
    ]),

    sectionHeading('CMS STAR RATINGS'),
    makeTable([
      ['Overall Star Rating:', formatRating(facilityData.overallRating)],
      ['Health Inspection:', formatRating(facilityData.healthInspectionRating)],
      ['Staffing:', formatRating(facilityData.staffingRating)],
      ['Quality of Resident Care:', formatRating(facilityData.qualityCareRating)],
    ]),

    sectionHeading('OPERATIONAL DETAILS'),
    makeTable([
      ['Previous Coverage from Medelite:', facilityData.previousCoverage ? (facilityData.previousCoverage === 'yes' ? 'Yes' : 'No') : 'N/A'],
      ['Previous Provider Performance:', facilityData.previousPerformance],
      ['Medical Coverage:', facilityData.medicalCoverage],
    ]),
  ];

  if (hasHospitalizationMetrics(facilityData)) {
    children.push(
      sectionHeading('HOSPITALIZATION & ED VISIT METRICS'),
      makeTable([
        ['STR Rehospitalization:', `Facility ${formatPercent(facilityData.strHospitalization)} | National ${formatPercent(facilityData.strHospitalizationNationalAvg)} | State ${formatPercent(facilityData.strHospitalizationStateAvg)}`],
        ['STR ED Visits:', `Facility ${formatPercent(facilityData.strEDVisit)} | National ${formatPercent(facilityData.strEDVisitNationalAvg)} | State ${formatPercent(facilityData.strEDVisitStateAvg)}`],
        ['LT Hospitalizations / 1,000 Days:', `Facility ${formatPerThousand(facilityData.ltHospitalization)} | National ${formatPerThousand(facilityData.ltHospitalizationNationalAvg)} | State ${formatPerThousand(facilityData.ltHospitalizationStateAvg)}`],
        ['LT ED Visits / 1,000 Days:', `Facility ${formatPerThousand(facilityData.ltEDVisit)} | National ${formatPerThousand(facilityData.ltEDVisitNationalAvg)} | State ${formatPerThousand(facilityData.ltEDVisitStateAvg)}`],
      ])
    );
  }

  children.push(
    sectionHeading('MEDICARE CARE COMPARE PROFILE'),
    new Paragraph({
      children: [
        new ExternalHyperlink({
          link: medicareUrl,
          children: [text(medicareUrl, { color: '0563C1' })],
        }),
      ],
      spacing: { after: 240 },
    }),
    paragraph(`Generated on ${new Date().toLocaleDateString()} | Powered by INFINITE Health Technology Platform`, {
      color: '6B7280',
      size: 18,
    })
  );

  const doc = new Document({
    creator: 'INFINITE Health Technology Platform',
    title: `Facility Assessment Snapshot - ${displayName}`,
    description: 'Facility assessment snapshot generated from CMS nursing home data.',
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  createDownload(blob, `facility-assessment-${facilityData.ccn}.docx`);
};
