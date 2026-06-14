import jsPDF from 'jspdf';
import { FacilityData } from '../types';

const BRAND_COLOR = '#1e40af';
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#f3f4f6';

export const generatePDF = async (facilityData: FacilityData): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;

  // Header with branding
  doc.setFillColor(30, 64, 175); // BRAND_COLOR
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INFINITE — Managed by MEDELITE', 15, 12);

  doc.setFontSize(14);
  doc.text('FACILITY ASSESSMENT SNAPSHOT', 15, 20);

  doc.setFontSize(10);
  doc.text(facilityData.state || '', pageWidth - 15, 12, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 35;

  // Facility Information Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACILITY INFORMATION', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Facility details in two columns
  const col1X = 15;
  const col2X = 105;
  const lineHeight = 6;

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Name of Facility:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.customName || facilityData.legalName, col1X + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Location:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${facilityData.address}, ${facilityData.city}, ${facilityData.state} ${facilityData.zip}`, col1X + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('EMR:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.emr || 'N/A', col1X + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Census Capacity:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.censusCapacity.toString(), col1X + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Current Census:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.currentCensus?.toString() || 'N/A', col1X + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Type of Patient:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.patientType || 'N/A', col1X + 35, yPosition);
  yPosition += 10;

  // Star Ratings Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CMS STAR RATINGS', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const ratingLineHeight = 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Overall Star Rating:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.overallRating ? `${facilityData.overallRating}/5` : 'N/A', col1X + 35, yPosition);
  yPosition += ratingLineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Health Inspection:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.healthInspectionRating ? `${facilityData.healthInspectionRating}/5` : 'N/A', col1X + 35, yPosition);
  yPosition += ratingLineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Staffing:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.staffingRating ? `${facilityData.staffingRating}/5` : 'N/A', col1X + 35, yPosition);
  yPosition += ratingLineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Quality of Resident Care:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.qualityCareRating ? `${facilityData.qualityCareRating}/5` : 'N/A', col1X + 35, yPosition);
  yPosition += 10;

  // Operational Details Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OPERATIONAL DETAILS', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Previous Coverage from Medelite:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.previousCoverage ? (facilityData.previousCoverage === 'yes' ? 'Yes' : 'No') : 'N/A', col1X + 35, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Previous Provider Performance:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.previousPerformance || 'N/A', col1X + 35, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Medical Coverage:', col1X, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityData.medicalCoverage || 'N/A', col1X + 35, yPosition);
  yPosition += 10;

  // Medicare Link Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Medicare Care Compare Profile:', 15, yPosition);
  yPosition += 6;

  doc.setTextColor(0, 100, 200);
  doc.setFont('helvetica', 'normal');
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`;
  doc.textWithLink(medicareUrl, 15, yPosition, { pageNumber: 1 });

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
