import React from 'react';
import { useFacilityStore } from '../store/facilityStore';
import { generatePDF } from '../services/pdfGenerator';
import { generateWordDocument } from '../services/wordGenerator';
import { HospitalizationMetrics } from './HospitalizationMetrics';
import '../styles/components.css';

export const FacilityPreview: React.FC = () => {
  const { cmsData, facilityData } = useFacilityStore();
  const [exporting, setExporting] = React.useState<'pdf' | 'word' | null>(null);

  if (!facilityData) {
    return null;
  }

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await generatePDF(facilityData);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportWord = async () => {
    setExporting('word');
    try {
      await generateWordDocument(facilityData);
    } catch (error) {
      console.error('Failed to generate Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const displayName = facilityData.customName || facilityData.legalName;
  const hasInvalidCurrentCensus =
    facilityData.currentCensus !== undefined &&
    (facilityData.currentCensus < 0 || facilityData.currentCensus > facilityData.censusCapacity);
  const exportDisabled = exporting !== null || hasInvalidCurrentCensus;

  return (
    <div className="preview-container">
      <div className="preview-card">
        <div className="preview-header">
          <h2>Facility Summary</h2>
          <div className="export-actions">
            <button
              onClick={handleExportPDF}
              disabled={exportDisabled}
              className="export-button"
            >
              {exporting === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={handleExportWord}
              disabled={exportDisabled}
              className="export-button secondary"
            >
              {exporting === 'word' ? 'Generating Word...' : 'Download Word'}
            </button>
          </div>
        </div>
        {hasInvalidCurrentCensus && (
          <div className="warning-message" role="alert">
            Fix Current Census before exporting. It must be between 0 and {facilityData.censusCapacity}.
          </div>
        )}
        {cmsData?.dataWarnings?.map((warning) => (
          <div className="warning-message" role="status" key={warning}>
            {warning}
          </div>
        ))}

        <div className="preview-content">
          <div className="preview-section">
            <h3>Facility Information</h3>
            <div className="preview-field">
              <span className="label">Name of Facility:</span>
              <span className="value">{displayName}</span>
            </div>
            <div className="preview-field">
              <span className="label">Location:</span>
              <span className="value">{facilityData.address}, {facilityData.city}, {facilityData.state} {facilityData.zip}</span>
            </div>
            <div className="preview-field">
              <span className="label">Census Capacity:</span>
              <span className="value">{facilityData.censusCapacity}</span>
            </div>
          </div>

          <div className="preview-section">
            <h3>CMS Star Ratings</h3>
            <div className="rating-grid">
              <div className="rating-item">
                <span className="label">Overall</span>
                <span className="rating">{facilityData.overallRating ? `${facilityData.overallRating}/5` : 'N/A'}</span>
              </div>
              <div className="rating-item">
                <span className="label">Health Inspection</span>
                <span className="rating">{facilityData.healthInspectionRating ? `${facilityData.healthInspectionRating}/5` : 'N/A'}</span>
              </div>
              <div className="rating-item">
                <span className="label">Staffing</span>
                <span className="rating">{facilityData.staffingRating ? `${facilityData.staffingRating}/5` : 'N/A'}</span>
              </div>
              <div className="rating-item">
                <span className="label">Quality of Care</span>
                <span className="rating">{facilityData.qualityCareRating ? `${facilityData.qualityCareRating}/5` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h3>Operational Details</h3>
            <div className="preview-field">
              <span className="label">EMR:</span>
              <span className="value">{facilityData.emr || 'Not specified'}</span>
            </div>
            <div className="preview-field">
              <span className="label">Current Census:</span>
              <span className="value">{facilityData.currentCensus || 'Not specified'}</span>
            </div>
            <div className="preview-field">
              <span className="label">Type of Patient:</span>
              <span className="value">{facilityData.patientType || 'Not specified'}</span>
            </div>
            <div className="preview-field">
              <span className="label">Previous Coverage from Medelite:</span>
              <span className="value">{facilityData.previousCoverage ? (facilityData.previousCoverage === 'yes' ? 'Yes' : 'No') : 'Not specified'}</span>
            </div>
            <div className="preview-field">
              <span className="label">Previous Provider Performance:</span>
              <span className="value">{facilityData.previousPerformance || 'Not specified'}</span>
            </div>
            <div className="preview-field">
              <span className="label">Medical Coverage:</span>
              <span className="value">{facilityData.medicalCoverage || 'Not specified'}</span>
            </div>
          </div>

          <HospitalizationMetrics />

          <div className="preview-section">
            <h3>Medicare Profile</h3>
            <a
              href={`https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="medicare-link"
            >
              View on Medicare Care Compare →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
