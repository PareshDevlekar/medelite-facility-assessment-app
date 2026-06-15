import axios from 'axios';
import type { CMSFacility } from '../types';

// Use local backend proxy to avoid CORS issues
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetch facility data from backend API proxy
 * The proxy handles CMS API calls server-side to avoid CORS restrictions
 */
export const fetchFacilityFromCMS = async (ccn: string): Promise<CMSFacility> => {
  try {
    const response = await axios.get(`${API_BASE}/api/facility/${ccn}`, {
      timeout: 5000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`No facility found with CCN: ${ccn}`, { cause: error });
      }
      throw new Error(`Failed to fetch facility data: ${error.message}`, { cause: error });
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
