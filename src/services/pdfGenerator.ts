import jsPDF from 'jspdf';
import type { FacilityData } from '../types';

export const generatePDF = async (facilityData: FacilityData): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  const labelWidth = 62;
  const valueX = marginX + labelWidth;
  const valueWidth = contentWidth - labelWidth;
  const lineHeight = 6;
  let yPosition = 35;

  const formatRating = (rating?: number) => rating ? `${rating}/5` : 'N/A';
  const formatNumber = (value: number) => value.toFixed(1);
  const formatPercent = (value?: number) => value !== undefined ? `${formatNumber(value)}%` : 'N/A';
  const formatPerThousand = (value?: number) => value !== undefined ? formatNumber(value) : 'N/A';
  const hasHospitalizationMetrics =
    facilityData.strHospitalization !== undefined ||
    facilityData.ltHospitalization !== undefined ||
    facilityData.strEDVisit !== undefined ||
    facilityData.ltEDVisit !== undefined;

  const addSectionTitle = (title: string) => {
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX, yPosition);
    yPosition += 8;
  };

  const addRow = (label: string, value: string | number | undefined) => {
    const displayValue = value === undefined || value === '' ? 'N/A' : String(value);
    const wrappedValue = doc.splitTextToSize(displayValue, valueWidth);
    const rowHeight = Math.max(lineHeight, wrappedValue.length * lineHeight);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(label, marginX, yPosition);

    doc.setFont('helvetica', 'normal');
    doc.text(wrappedValue, valueX, yPosition);

    yPosition += rowHeight;
  };

  // Title in header
  doc.setFillColor(31, 43, 68);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INFINITE — Managed by MEDELITE', marginX, 12);

  doc.setFontSize(14);
  doc.text('FACILITY ASSESSMENT SNAPSHOT', marginX, 20);

  doc.setFontSize(10);
  doc.text(facilityData.state || '', pageWidth - marginX, 12, { align: 'right' });

  addSectionTitle('FACILITY INFORMATION');
  addRow('Name of Facility:', facilityData.customName || facilityData.legalName);
  addRow('Location:', `${facilityData.address}, ${facilityData.city}, ${facilityData.state} ${facilityData.zip}`);
  addRow('EMR:', facilityData.emr);
  addRow('Census Capacity:', facilityData.censusCapacity);
  addRow('Current Census:', facilityData.currentCensus);
  addRow('Type of Patient:', facilityData.patientType);

  addSectionTitle('CMS STAR RATINGS');
  addRow('Overall Star Rating:', formatRating(facilityData.overallRating));
  addRow('Health Inspection:', formatRating(facilityData.healthInspectionRating));
  addRow('Staffing:', formatRating(facilityData.staffingRating));
  addRow('Quality of Resident Care:', formatRating(facilityData.qualityCareRating));

  addSectionTitle('OPERATIONAL DETAILS');
  addRow('Previous Coverage from Medelite:', facilityData.previousCoverage ? (facilityData.previousCoverage === 'yes' ? 'Yes' : 'No') : 'N/A');
  addRow('Previous Provider Performance:', facilityData.previousPerformance);
  addRow('Medical Coverage:', facilityData.medicalCoverage);

  if (hasHospitalizationMetrics) {
    addSectionTitle('HOSPITALIZATION & ED VISIT METRICS');
    addRow('STR Rehospitalization:', `Facility ${formatPercent(facilityData.strHospitalization)} | National ${formatPercent(facilityData.strHospitalizationNationalAvg)} | State ${formatPercent(facilityData.strHospitalizationStateAvg)}`);
    addRow('STR ED Visits:', `Facility ${formatPercent(facilityData.strEDVisit)} | National ${formatPercent(facilityData.strEDVisitNationalAvg)} | State ${formatPercent(facilityData.strEDVisitStateAvg)}`);
    addRow('LT Hospitalizations / 1,000 Days:', `Facility ${formatPerThousand(facilityData.ltHospitalization)} | National ${formatPerThousand(facilityData.ltHospitalizationNationalAvg)} | State ${formatPerThousand(facilityData.ltHospitalizationStateAvg)}`);
    addRow('LT ED Visits / 1,000 Days:', `Facility ${formatPerThousand(facilityData.ltEDVisit)} | National ${formatPerThousand(facilityData.ltEDVisitNationalAvg)} | State ${formatPerThousand(facilityData.ltEDVisitStateAvg)}`);
  }

  // Medicare Link Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  yPosition += 6;
  doc.text('Medicare Care Compare Profile:', marginX, yPosition);
  yPosition += 6;

  doc.setTextColor(0, 100, 200);
  doc.setFont('helvetica', 'normal');
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`;
  const wrappedUrl = doc.splitTextToSize(medicareUrl, contentWidth);
  doc.textWithLink(wrappedUrl[0], marginX, yPosition, { url: medicareUrl });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} | Powered by INFINITE Health Technology Platform`,
    15,
    pageHeight - 10
  );

  // Download PDF
  doc.save(`facility-assessment-${facilityData.ccn}.pdf`);
};
