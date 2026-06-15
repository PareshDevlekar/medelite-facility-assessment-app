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

const cmsHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
};

const parseOptionalNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

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

const normalizeProviderRecord = (record, ccn) => ({
  ccn: record.prvdr_num || ccn,
  name: record.fac_name || 'Unknown Facility',
  address: record.st_adr || '',
  city: record.city_name || '',
  state: record.state_cd || '',
  zip: record.zip_cd || '',
  certified_beds: parseOptionalNumber(record.crtfd_bed_cnt) || parseOptionalNumber(record.bed_cnt) || 0,
});

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

app.get('/api/facility/:ccn', async (req, res) => {
  try {
    const { ccn } = req.params;

    if (!/^\d{6}$/.test(ccn)) {
      return res.status(400).json({ error: 'Invalid CCN format' });
    }

    console.log(`Fetching data for CCN: ${ccn}`);

    let facilityData = null;

    try {
      facilityData = await fetchFromSqlApi(ccn);
    } catch (error) {
      console.warn(`CMS SQL API failed for CCN ${ccn}; trying provider data API: ${error.message}`);
      facilityData = await fetchFromProviderApi(ccn);
    }

    if (facilityData) {
      console.log(`✓ Found facility: ${facilityData.name}`);
      res.json(facilityData);
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
