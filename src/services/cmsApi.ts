import axios from 'axios';
import type { CMSFacility } from '../types';

const CMS_API_BASE = 'https://data.cms.gov/api/3/action/datastore_search_sql';

/**
 * Fetch facility data from CMS Provider Data Catalog API
 * Uses the SQL search endpoint to query by CMS Certification Number (CCN)
 */
export const fetchFacilityFromCMS = async (ccn: string): Promise<CMSFacility> => {
  try {
    // Query the CMS Provider of Services database for nursing homes
    const query = `SELECT * FROM "4pf6-v853" WHERE "CMS Certification Number (CCN)" = '${ccn}' LIMIT 1`;
    
    const response = await axios.get(CMS_API_BASE, {
      params: {
        sql: query,
      },
      timeout: 10000,
    });

    if (response.data.result.records && response.data.result.records.length > 0) {
      const record = response.data.result.records[0];
      
      return {
        ccn: record['CMS Certification Number (CCN)'] || ccn,
        name: record['Provider Name'] || 'Unknown Facility',
        address: record['Street Address'] || '',
        city: record['City'] || '',
        state: record['State'] || '',
        zip: record['ZIP Code'] || '',
        certified_beds: parseInt(record['Number of Certified Beds']) || 0,
        overall_rating: parseFloat(record['Overall Rating']) || undefined,
        health_inspection_rating: parseFloat(record['Health Inspection Rating']) || undefined,
        staffing_rating: parseFloat(record['Staffing Rating']) || undefined,
        quality_of_care_rating: parseFloat(record['Quality of Care Rating']) || undefined,
      };
    } else {
      throw new Error(`No facility found with CCN: ${ccn}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch facility data: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Validate CCN format (typically 6 digits)
 */
export const isValidCCN = (ccn: string): boolean => {
  return /^\d{6}$/.test(ccn.trim());
};
