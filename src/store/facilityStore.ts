import { create } from 'zustand';
import type { FacilityData, CMSFacility } from '../types';

interface FacilityStore {
  facilityData: FacilityData | null;
  cmsData: CMSFacility | null;
  loading: boolean;
  error: string | null;
  setFacilityData: (data: FacilityData) => void;
  setCMSData: (data: CMSFacility) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateManualInput: <K extends keyof FacilityData>(field: K, value: FacilityData[K]) => void;
  reset: () => void;
}

export const useFacilityStore = create<FacilityStore>((set) => ({
  facilityData: null,
  cmsData: null,
  loading: false,
  error: null,
  setFacilityData: (data) => set({ facilityData: data }),
  setCMSData: (data) => set({ cmsData: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateManualInput: (field, value) =>
    set((state) => ({
      facilityData: state.facilityData
        ? { ...state.facilityData, [field]: value }
        : null,
    })),
  reset: () => set({
    facilityData: null,
    cmsData: null,
    loading: false,
    error: null,
  }),
}));
