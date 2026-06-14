import React, { useState } from 'react';
import { fetchFacilityFromCMS, isValidCCN } from '../services/cmsApi';
import { useFacilityStore } from '../store/facilityStore';
import '../styles/components.css';

export const CCNInput: React.FC = () => {
  const [ccn, setCCN] = useState('');
  const { setLoading, setError, setCMSData, facilityData, setFacilityData } = useFacilityStore();
  const loading = useFacilityStore((state) => state.loading);
  const error = useFacilityStore((state) => state.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ccn.trim()) {
      setError('Please enter a CCN');
      return;
    }

    if (!isValidCCN(ccn)) {
      setError('Invalid CCN format. CCN must be 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFacilityFromCMS(ccn);
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
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch facility data';
      setError(errorMessage);
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
              placeholder="e.g., 686123"
              value={ccn}
              onChange={(e) => setCCN(e.target.value)}
              disabled={loading}
              className="ccn-input"
              maxLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

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
