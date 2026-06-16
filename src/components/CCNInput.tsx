import React, { useState } from 'react';
import { FacilityLookupError, fetchFacilityFromCMS, isValidCCN } from '../services/cmsApi';
import { useFacilityStore } from '../store/facilityStore';
import '../styles/components.css';

export const CCNInput: React.FC = () => {
  const [ccn, setCCN] = useState('');
  const { setLoading, setError, setCMSData, facilityData, setFacilityData } = useFacilityStore();
  const loading = useFacilityStore((state) => state.loading);
  const error = useFacilityStore((state) => state.error);

  const normalizeCCN = (value: string) => value.replace(/\D/g, '').slice(0, 6);

  const handleCCNChange = (value: string) => {
    setCCN(normalizeCCN(value));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCCN = normalizeCCN(ccn);

    if (!normalizedCCN) {
      setError('Please enter a CCN');
      return;
    }

    if (!isValidCCN(normalizedCCN)) {
      setError('Invalid CCN format. CCN must be 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFacilityFromCMS(normalizedCCN);
      setCMSData(data);

      // Initialize facility data with CMS data
      setFacilityData({
        ccn: data.ccn,
        legalName: data.name,
        customName: undefined,
        address: data.address,
        state: data.state,
        city: data.city,
        zip: data.zip,
        censusCapacity: data.certified_beds,
        overallRating: data.overall_rating,
        healthInspectionRating: data.health_inspection_rating,
        staffingRating: data.staffing_rating,
        qualityCareRating: data.quality_of_care_rating,
        strHospitalization: data.strHospitalization,
        strHospitalizationNationalAvg: data.strHospitalizationNationalAvg,
        strHospitalizationStateAvg: data.strHospitalizationStateAvg,
        strEDVisit: data.strEDVisit,
        strEDVisitNationalAvg: data.strEDVisitNationalAvg,
        strEDVisitStateAvg: data.strEDVisitStateAvg,
        ltHospitalization: data.ltHospitalization,
        ltHospitalizationNationalAvg: data.ltHospitalizationNationalAvg,
        ltHospitalizationStateAvg: data.ltHospitalizationStateAvg,
        ltEDVisit: data.ltEDVisit,
        ltEDVisitNationalAvg: data.ltEDVisitNationalAvg,
        ltEDVisitStateAvg: data.ltEDVisitStateAvg,
      });
    } catch (err) {
      if (err instanceof FacilityLookupError) {
        setError(err.message);
      } else {
        setError('Failed to fetch facility data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ccn-input-container">
      <div className="ccn-input-card">
        <h2>Facility Search</h2>
        <p className="subtitle">Enter a CMS Certification Number (CCN) to retrieve facility information</p>

        <form onSubmit={handleSubmit} className="ccn-form">
          <div className="form-group">
            <label htmlFor="ccn">CMS Certification Number (CCN)</label>
            <input
              id="ccn"
              type="text"
              inputMode="numeric"
              placeholder="e.g., 686123"
              value={ccn}
              onChange={(e) => handleCCNChange(e.target.value)}
              disabled={loading}
              className="ccn-input"
              maxLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'ccn-error' : undefined}
            />
          </div>

          {error && (
            <div id="ccn-error" className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="search-button"
          >
            {loading ? 'Searching...' : 'Search Facility'}
          </button>
        </form>

        {!facilityData && (
          <div className="info-box">
            <p>
              <strong>Sample CCN:</strong> 686123 (Kendall Lakes Healthcare and Rehab Center, FL)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
