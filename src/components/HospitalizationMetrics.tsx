import React from 'react';
import { useFacilityStore } from '../store/facilityStore';
import '../styles/components.css';

export const HospitalizationMetrics: React.FC = () => {
  const { facilityData } = useFacilityStore();

  if (!facilityData) {
    return null;
  }

  const hasMetrics = 
    facilityData.strHospitalization !== undefined ||
    facilityData.ltHospitalization !== undefined ||
    facilityData.strEDVisit !== undefined ||
    facilityData.ltEDVisit !== undefined;

  if (!hasMetrics) {
    return null;
  }

  const formatNumber = (value: number) => value.toFixed(1);
  const formatPercent = (value?: number) => value !== undefined ? `${formatNumber(value)}%` : 'N/A';
  const formatPerThousand = (value?: number) => value !== undefined ? formatNumber(value) : 'N/A';

  return (
    <div className="metrics-container">
      <div className="metrics-card">
        <h3>Hospitalization & ED Visit Metrics</h3>
        
        <div className="metrics-grid">
          {/* Short-Stay (STR) Section */}
          <div className="metrics-section">
            <h4>Short-Stay Residents (STR)</h4>
            
            <div className="metric-group">
              <span className="metric-label">Rehospitalization Rate:</span>
              <div className="metric-values">
                <div className="metric-item">
                  <span className="value-label">Facility:</span>
                  <span className="value">{formatPercent(facilityData.strHospitalization)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">National Avg:</span>
                  <span className="value">{formatPercent(facilityData.strHospitalizationNationalAvg)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">State Avg:</span>
                  <span className="value">{formatPercent(facilityData.strHospitalizationStateAvg)}</span>
                </div>
              </div>
            </div>

            <div className="metric-group">
              <span className="metric-label">ED Visit Rate:</span>
              <div className="metric-values">
                <div className="metric-item">
                  <span className="value-label">Facility:</span>
                  <span className="value">{formatPercent(facilityData.strEDVisit)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">National Avg:</span>
                  <span className="value">{formatPercent(facilityData.strEDVisitNationalAvg)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">State Avg:</span>
                  <span className="value">{formatPercent(facilityData.strEDVisitStateAvg)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Long-Stay (LT) Section */}
          <div className="metrics-section">
            <h4>Long-Stay Residents (LT)</h4>
            
            <div className="metric-group">
              <span className="metric-label">Hospitalizations per 1,000 Resident Days:</span>
              <div className="metric-values">
                <div className="metric-item">
                  <span className="value-label">Facility:</span>
                  <span className="value">{formatPerThousand(facilityData.ltHospitalization)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">National Avg:</span>
                  <span className="value">{formatPerThousand(facilityData.ltHospitalizationNationalAvg)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">State Avg:</span>
                  <span className="value">{formatPerThousand(facilityData.ltHospitalizationStateAvg)}</span>
                </div>
              </div>
            </div>

            <div className="metric-group">
              <span className="metric-label">ED Visits per 1,000 Resident Days:</span>
              <div className="metric-values">
                <div className="metric-item">
                  <span className="value-label">Facility:</span>
                  <span className="value">{formatPerThousand(facilityData.ltEDVisit)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">National Avg:</span>
                  <span className="value">{formatPerThousand(facilityData.ltEDVisitNationalAvg)}</span>
                </div>
                <div className="metric-item">
                  <span className="value-label">State Avg:</span>
                  <span className="value">{formatPerThousand(facilityData.ltEDVisitStateAvg)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-info">
          <p>
            <strong>Note:</strong> Lower hospitalization and ED visit rates generally indicate better quality care. 
            Short-stay measures are percentages; long-stay measures are rates per 1,000 resident days.
          </p>
        </div>
      </div>
    </div>
  );
};
