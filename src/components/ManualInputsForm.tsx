import React from 'react';
import { useFacilityStore } from '../store/facilityStore';
import type { FacilityData } from '../types';
import '../styles/components.css';

export const ManualInputsForm: React.FC = () => {
  const { facilityData, updateManualInput } = useFacilityStore();

  if (!facilityData) {
    return null;
  }

  const handleChange = <K extends keyof FacilityData>(field: K, value: FacilityData[K]) => {
    updateManualInput(field, value);
  };

  const handleNumberChange = (field: keyof FacilityData, value: string) => {
    const numericValue = value === '' ? undefined : Number(value);
    handleChange(field, Number.isFinite(numericValue) ? numericValue : undefined);
  };

  return (
    <div className="manual-inputs-container">
      <div className="form-card">
        <h2>Operational Details</h2>
        <p className="subtitle">Enter additional operational information</p>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="emr">EMR System</label>
            <input
              id="emr"
              type="text"
              placeholder="e.g., PCC, MatrixCare"
              value={facilityData.emr || ''}
              onChange={(e) => handleChange('emr', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentCensus">Current Census</label>
            <input
              id="currentCensus"
              type="number"
              placeholder="e.g., 112"
              value={facilityData.currentCensus || ''}
              onChange={(e) => handleNumberChange('currentCensus', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="patientType">Type of Patient</label>
            <input
              id="patientType"
              type="text"
              placeholder="e.g., Long-term, Short-term"
              value={facilityData.patientType || ''}
              onChange={(e) => handleChange('patientType', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="facilityName">Custom Facility Name (Optional)</label>
            <input
              id="facilityName"
              type="text"
              placeholder="Leave blank to use official name"
              value={facilityData.customName || ''}
              onChange={(e) => handleChange('customName', e.target.value || undefined)}
              className="form-input"
            />
            <small>This will override the official facility name in the report</small>
          </div>

          <div className="form-group">
            <label htmlFor="previousCoverage">Previous Coverage from Medelite</label>
            <select
              id="previousCoverage"
              value={facilityData.previousCoverage || ''}
              onChange={(e) => handleChange('previousCoverage', e.target.value === 'yes' || e.target.value === 'no' ? e.target.value : undefined)}
              className="form-input"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="previousPerformance">Previous Provider Performance</label>
            <input
              id="previousPerformance"
              type="text"
              placeholder="e.g., About 30 patients/day"
              value={facilityData.previousPerformance || ''}
              onChange={(e) => handleChange('previousPerformance', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="medicalCoverage">Medical Coverage</label>
            <input
              id="medicalCoverage"
              type="text"
              placeholder="e.g., Optometry, PCP, Podiatry"
              value={facilityData.medicalCoverage || ''}
              onChange={(e) => handleChange('medicalCoverage', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
