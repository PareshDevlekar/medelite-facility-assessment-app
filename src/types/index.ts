export interface FacilityData {
  ccn: string;
  legalName: string;
  customName?: string;
  address: string;
  state: string;
  city: string;
  zip: string;
  censusCapacity: number;
  overallRating?: number;
  healthInspectionRating?: number;
  staffingRating?: number;
  qualityCareRating?: number;
  currentCensus?: number;
  emr?: string;
  patientType?: string;
  previousCoverage?: 'yes' | 'no';
  previousPerformance?: string;
  medicalCoverage?: string;
}

export interface CMSFacility {
  ccn: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  certified_beds: number;
  overall_rating?: number;
  health_inspection_rating?: number;
  staffing_rating?: number;
  quality_of_care_rating?: number;
}

export interface ReportData extends FacilityData {
  reportDate: string;
}
