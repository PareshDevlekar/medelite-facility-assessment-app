const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;
const HOST = '127.0.0.1';

app.use(cors());
app.use(express.json());

const CMS_SQL_API_BASE = 'https://data.cms.gov/api/3/action/datastore_search_sql';
const CMS_PROVIDER_API_BASE = 'https://data.cms.gov/data-api/v1/dataset/086e48c4-87a6-4be1-8823-29e8da8f225b/data';
const CMS_PROVIDER_DATA_QUERY_BASE = 'https://data.cms.gov/provider-data/api/1/datastore/query';
const NH_PROVIDER_INFO_DATASET = '4pq5-n9py';
const NH_CLAIMS_QM_DATASET = 'ijh5-nb2v';
const NH_STATE_US_AVERAGES_DATASET = 'xcdc-v8bm';

const CLAIMS_MEASURE_CODES = {
  '521': 'strHospitalization',
  '522': 'strEDVisit',
  '551': 'ltHospitalization',
  '552': 'ltEDVisit',
};

const AVERAGE_FIELDS = {
  strHospitalization: 'percentage_of_short_stay_residents_who_were_rehospitalized__1d02',
  strEDVisit: 'percentage_of_short_stay_residents_who_had_an_outpatient_em_d911',
  ltHospitalization: 'number_of_hospitalizations_per_1000_longstay_resident_days',
  ltEDVisit: 'number_of_outpatient_emergency_department_visits_per_1000_l_de9d',
};

const cmsHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
};

const parseOptionalNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sanitizeCCN = (value) => String(value || '').trim();

const normalizeSqlRecord = (record, ccn) => ({
  ccn: record['CMS Certification Number (CCN)'] || ccn,
  name: record['Provider Name'] || 'Unknown Facility',
  address: record['Street Address'] || '',
  city: record['City'] || '',
  state: record['State'] || '',
  zip: record['ZIP Code'] || '',
  certified_beds: parseOptionalNumber(record['Number of Certified Beds']) || 0,
  overall_rating: parseOptionalNumber(record['Overall Rating']),
  health_inspection_rating: parseOptionalNumber(record['Health Inspection Rating']),
  staffing_rating: parseOptionalNumber(record['Staffing Rating']),
  quality_of_care_rating: parseOptionalNumber(record['Quality of Care Rating']),
});

const normalizeProviderInfoRecord = (record, ccn) => ({
  ccn: record.cms_certification_number_ccn || ccn,
  name: record.provider_name || 'Unknown Facility',
  address: record.provider_address || '',
  city: record.citytown || '',
  state: record.state || '',
  zip: record.zip_code || '',
  certified_beds: parseOptionalNumber(record.number_of_certified_beds) || 0,
  overall_rating: parseOptionalNumber(record.overall_rating),
  health_inspection_rating: parseOptionalNumber(record.health_inspection_rating),
  staffing_rating: parseOptionalNumber(record.staffing_rating),
  quality_of_care_rating: parseOptionalNumber(record.qm_rating),
  cmsProcessingDate: record.processing_date,
});

const normalizeProviderRecord = (record, ccn) => ({
  ccn: record.prvdr_num || ccn,
  name: record.fac_name || 'Unknown Facility',
  address: record.st_adr || '',
  city: record.city_name || '',
  state: record.state_cd || '',
  zip: record.zip_cd || '',
  certified_beds: parseOptionalNumber(record.crtfd_bed_cnt) || parseOptionalNumber(record.bed_cnt) || 0,
});

const queryProviderData = async (datasetId, params = {}) => {
  const response = await axios.get(`${CMS_PROVIDER_DATA_QUERY_BASE}/${datasetId}/0`, {
    timeout: 10000,
    headers: cmsHeaders,
    params: {
      offset: 0,
      count: true,
      results: true,
      schema: false,
      keys: true,
      format: 'json',
      rowIds: false,
      ...params,
    },
  });

  return Array.isArray(response.data?.results) ? response.data.results : [];
};

const fetchFromSqlApi = async (ccn) => {
  const sql = `SELECT * FROM "4pf6-v853" WHERE "CMS Certification Number (CCN)" = '${ccn}' LIMIT 1`;

  const response = await axios.post(CMS_SQL_API_BASE, { sql }, {
    timeout: 10000,
    headers: cmsHeaders
  });

  if (response.data?.success === false) {
    throw new Error(response.data.error?.message || 'CMS SQL API rejected the facility lookup');
  }

  const records = response.data?.result?.records;
  return Array.isArray(records) && records.length > 0 ? normalizeSqlRecord(records[0], ccn) : null;
};

const fetchFromNursingHomeProviderInfo = async (ccn) => {
  const records = await queryProviderData(NH_PROVIDER_INFO_DATASET, {
    limit: 1,
    'conditions[0][property]': 'cms_certification_number_ccn',
    'conditions[0][value]': ccn,
    'conditions[0][operator]': '=',
  });

  return records.length > 0 ? normalizeProviderInfoRecord(records[0], ccn) : null;
};

const fetchFromProviderApi = async (ccn) => {
  const response = await axios.get(CMS_PROVIDER_API_BASE, {
    timeout: 10000,
    headers: cmsHeaders,
    params: {
      'filter[prvdr_num]': ccn,
      size: 1
    }
  });

  const records = response.data;
  return Array.isArray(records) && records.length > 0 ? normalizeProviderRecord(records[0], ccn) : null;
};

const fetchClaimsMetrics = async (ccn) => {
  const records = await queryProviderData(NH_CLAIMS_QM_DATASET, {
    limit: 20,
    'conditions[0][property]': 'cms_certification_number_ccn',
    'conditions[0][value]': ccn,
    'conditions[0][operator]': '=',
  });

  return records.reduce((metrics, record) => {
    const metricKey = CLAIMS_MEASURE_CODES[record.measure_code];
    if (!metricKey) {
      return metrics;
    }

    return {
      ...metrics,
      [metricKey]: parseOptionalNumber(record.adjusted_score),
    };
  }, {});
};

const fetchAverageMetrics = async (state) => {
  if (!state) {
    return {};
  }

  const records = await queryProviderData(NH_STATE_US_AVERAGES_DATASET, {
    limit: 100,
  });

  const stateRecord = records.find((record) => record.state_or_nation === state);
  const nationalRecord = records.find((record) => record.state_or_nation === 'NATION');

  return {
    strHospitalizationStateAvg: parseOptionalNumber(stateRecord?.[AVERAGE_FIELDS.strHospitalization]),
    strHospitalizationNationalAvg: parseOptionalNumber(nationalRecord?.[AVERAGE_FIELDS.strHospitalization]),
    strEDVisitStateAvg: parseOptionalNumber(stateRecord?.[AVERAGE_FIELDS.strEDVisit]),
    strEDVisitNationalAvg: parseOptionalNumber(nationalRecord?.[AVERAGE_FIELDS.strEDVisit]),
    ltHospitalizationStateAvg: parseOptionalNumber(stateRecord?.[AVERAGE_FIELDS.ltHospitalization]),
    ltHospitalizationNationalAvg: parseOptionalNumber(nationalRecord?.[AVERAGE_FIELDS.ltHospitalization]),
    ltEDVisitStateAvg: parseOptionalNumber(stateRecord?.[AVERAGE_FIELDS.ltEDVisit]),
    ltEDVisitNationalAvg: parseOptionalNumber(nationalRecord?.[AVERAGE_FIELDS.ltEDVisit]),
  };
};

app.get('/api/facility/:ccn', async (req, res) => {
  try {
    const ccn = sanitizeCCN(req.params.ccn);

    if (!/^\d{6}$/.test(ccn)) {
      return res.status(400).json({ error: 'Invalid CCN format' });
    }

    console.log(`Fetching data for CCN: ${ccn}`);

    let facilityData = null;
    const dataWarnings = [];

    try {
      facilityData = await fetchFromNursingHomeProviderInfo(ccn);
    } catch (error) {
      console.warn(`CMS Provider Data API failed for CCN ${ccn}; trying SQL API: ${error.message}`);
      dataWarnings.push('Primary CMS provider endpoint was unavailable; fallback source used.');
      try {
        facilityData = await fetchFromSqlApi(ccn);
      } catch (sqlError) {
        console.warn(`CMS SQL API failed for CCN ${ccn}; trying POS data API: ${sqlError.message}`);
        dataWarnings.push('Secondary CMS endpoint was unavailable; legacy provider source used.');
        facilityData = await fetchFromProviderApi(ccn);
      }
    }

    if (facilityData) {
      try {
        const [claimsMetrics, averageMetrics] = await Promise.all([
          fetchClaimsMetrics(ccn),
          fetchAverageMetrics(facilityData.state),
        ]);

        facilityData = {
          ...facilityData,
          ...claimsMetrics,
          ...averageMetrics,
        };
      } catch (metricsError) {
        console.warn(`CMS hospitalization metrics failed for CCN ${ccn}: ${metricsError.message}`);
        dataWarnings.push('Hospitalization and ED visit metrics are temporarily unavailable.');
      }
    }

    if (facilityData) {
      console.log(`✓ Found facility: ${facilityData.name}`);
      res.json({
        ...facilityData,
        dataWarnings,
      });
    } else {
      console.log(`✗ No facility found with CCN: ${ccn}`);
      res.status(404).json({ error: `No facility found with CCN: ${ccn}` });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch facility data',
      details: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`✓ CMS API Proxy server running on http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
  console.error('Failed to start CMS API Proxy server:', error.message);
  process.exit(1);
});
