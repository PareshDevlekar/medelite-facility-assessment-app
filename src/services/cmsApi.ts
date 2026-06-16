import axios from 'axios';
import type { CMSFacility } from '../types';

// Use local backend proxy to avoid CORS issues
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 8000;

export type FacilityLookupErrorCode =
  | 'INVALID_CCN'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'SERVER'
  | 'BAD_DATA'
  | 'UNKNOWN';

export class FacilityLookupError extends Error {
  code: FacilityLookupErrorCode;

  constructor(code: FacilityLookupErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FacilityLookupError';
    this.code = code;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasTextField = (record: Record<string, unknown>, field: string) =>
  typeof record[field] === 'string' && record[field].trim().length > 0;

const validateFacilityResponse = (data: unknown, ccn: string): CMSFacility => {
  if (!isRecord(data)) {
    throw new FacilityLookupError('BAD_DATA', 'CMS returned an unreadable facility response.');
  }

  const requiredFields = ['ccn', 'name', 'address', 'city', 'state', 'zip'];
  const missingFields = requiredFields.filter((field) => !hasTextField(data, field));

  if (missingFields.length > 0 || typeof data.certified_beds !== 'number') {
    throw new FacilityLookupError(
      'BAD_DATA',
      `CMS returned incomplete facility data for CCN ${ccn}. Please try again later.`,
    );
  }

  return {
    ...(data as unknown as CMSFacility),
    ccn: String(data.ccn),
    name: String(data.name),
    address: String(data.address),
    city: String(data.city),
    state: String(data.state),
    zip: String(data.zip),
    certified_beds: data.certified_beds,
  };
};

/**
 * Fetch facility data from backend API proxy
 * The proxy handles CMS API calls server-side to avoid CORS restrictions
 */
export const fetchFacilityFromCMS = async (ccn: string): Promise<CMSFacility> => {
  const normalizedCCN = ccn.trim();

  if (!isValidCCN(normalizedCCN)) {
    throw new FacilityLookupError('INVALID_CCN', 'Invalid CCN format. CCN must be 6 digits.');
  }

  try {
    const response = await axios.get(`${API_BASE}/api/facility/${normalizedCCN}`, {
      timeout: REQUEST_TIMEOUT_MS,
    });

    return validateFacilityResponse(response.data, normalizedCCN);
  } catch (error) {
    if (error instanceof FacilityLookupError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new FacilityLookupError('NOT_FOUND', `No facility found with CCN: ${normalizedCCN}.`, { cause: error });
      }

      if (error.response?.status === 400) {
        throw new FacilityLookupError('INVALID_CCN', 'Invalid CCN format. CCN must be 6 digits.', { cause: error });
      }

      if (error.code === 'ECONNABORTED') {
        throw new FacilityLookupError(
          'TIMEOUT',
          'CMS lookup timed out. Please check the CCN and try again.',
          { cause: error },
        );
      }

      if (!error.response) {
        throw new FacilityLookupError(
          'NETWORK',
          'Could not reach the local CMS proxy. Start the backend server with npm run server, then try again.',
          { cause: error },
        );
      }

      const serverMessage = isRecord(error.response.data) && typeof error.response.data.error === 'string'
        ? error.response.data.error
        : 'The CMS proxy could not complete the lookup.';

      throw new FacilityLookupError('SERVER', serverMessage, { cause: error });
    }

    throw new FacilityLookupError('UNKNOWN', 'Unexpected error while fetching facility data.', {
      cause: error,
    });
  }
};

/**
 * Validate CCN format (typically 6 digits)
 */
export const isValidCCN = (ccn: string): boolean => {
  return /^\d{6}$/.test(ccn.trim());
};
