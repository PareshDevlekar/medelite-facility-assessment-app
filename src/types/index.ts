export interface HospitalizationMetrics {
  // Short-Stay (STR) Metrics
  strHospitalization?: number;
  strHospitalizationNationalAvg?: number;
  strHospitalizationStateAvg?: number;
  strEDVisit?: number;
  strEDVisitNationalAvg?: number;
  strEDVisitStateAvg?: number;
  
  // Long-Stay (LT) Metrics
  ltHospitalization?: number;
  ltHospitalizationNationalAvg?: number;
  ltHospitalizationStateAvg?: number;
  ltEDVisit?: number;
  ltEDVisitNationalAvg?: number;
  ltEDVisitStateAvg?: number;
}

export interface FacilityData extends HospitalizationMetrics {
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

export interface CMSFacility extends HospitalizationMetrics {
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
