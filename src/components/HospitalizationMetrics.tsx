import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFacilityStore } from '../store/facilityStore';
import '../styles/components.css';

type MetricDefinition = {
  key: string;
  title: string;
  audience: 'Short-Stay' | 'Long-Stay';
  unit: '%' | 'per 1,000 days';
  facility?: number;
  national?: number;
  state?: number;
};

type ChartDatum = {
  name: string;
  Facility?: number;
  State?: number;
  National?: number;
};

export const HospitalizationMetrics: React.FC = () => {
  const { facilityData } = useFacilityStore();

  if (!facilityData) {
    return null;
  }

  const hasMetrics = 
    facilityData.strHospitalization !== undefined ||
    facilityData.ltHospitalization !== undefined ||
    facilityData.strEDVisit !== undefined ||
    facilityData.ltEDVisit !== undefined;

  if (!hasMetrics) {
    return null;
  }

  const formatNumber = (value: number) => value.toFixed(1);
  const formatPercent = (value?: number) => value !== undefined ? `${formatNumber(value)}%` : 'N/A';
  const formatPerThousand = (value?: number) => value !== undefined ? formatNumber(value) : 'N/A';
  const formatMetricValue = (value: number | undefined, unit: MetricDefinition['unit']) => {
    if (unit === '%') {
      return formatPercent(value);
    }

    return formatPerThousand(value);
  };

  const metrics: MetricDefinition[] = [
    {
      key: 'str-hospitalization',
      title: 'Rehospitalization Rate',
      audience: 'Short-Stay',
      unit: '%',
      facility: facilityData.strHospitalization,
      national: facilityData.strHospitalizationNationalAvg,
      state: facilityData.strHospitalizationStateAvg,
    },
    {
      key: 'str-ed-visits',
      title: 'ED Visit Rate',
      audience: 'Short-Stay',
      unit: '%',
      facility: facilityData.strEDVisit,
      national: facilityData.strEDVisitNationalAvg,
      state: facilityData.strEDVisitStateAvg,
    },
    {
      key: 'lt-hospitalization',
      title: 'Hospitalizations',
      audience: 'Long-Stay',
      unit: 'per 1,000 days',
      facility: facilityData.ltHospitalization,
      national: facilityData.ltHospitalizationNationalAvg,
      state: facilityData.ltHospitalizationStateAvg,
    },
    {
      key: 'lt-ed-visits',
      title: 'ED Visits',
      audience: 'Long-Stay',
      unit: 'per 1,000 days',
      facility: facilityData.ltEDVisit,
      national: facilityData.ltEDVisitNationalAvg,
      state: facilityData.ltEDVisitStateAvg,
    },
  ];

  const getBenchmarkInsight = (metric: MetricDefinition) => {
    if (metric.facility === undefined) {
      return 'Facility data unavailable';
    }

    const benchmarks = [metric.state, metric.national].filter((value): value is number => value !== undefined);
    if (benchmarks.length === 0) {
      return 'No benchmark available';
    }

    const bestBenchmark = Math.min(...benchmarks);
    const difference = metric.facility - bestBenchmark;

    if (Math.abs(difference) < 0.05) {
      return 'In line with best benchmark';
    }

    const formattedDifference = formatMetricValue(Math.abs(difference), metric.unit);
    return difference < 0
      ? `${formattedDifference} below best benchmark`
      : `${formattedDifference} above best benchmark`;
  };

  const buildChartData = (audience: MetricDefinition['audience']): ChartDatum[] =>
    metrics
      .filter((metric) => metric.audience === audience)
      .map((metric) => ({
        name: metric.title.replace(' Rate', ''),
        Facility: metric.facility,
        State: metric.state,
        National: metric.national,
      }));

  const tooltipFormatter = (
    value: string | number | readonly (string | number)[] | undefined,
    name: string | number | undefined,
    item: { payload?: ChartDatum },
  ): [string, string | number] => {
    const relatedMetric = metrics.find((metric) => item.payload?.name === metric.title.replace(' Rate', ''));
    const numericValue = typeof value === 'number' ? value : Number(value);
    const formattedValue = Number.isFinite(numericValue)
      ? formatMetricValue(numericValue, relatedMetric?.unit ?? '%')
      : 'N/A';

    return [formattedValue, name ?? 'Metric'];
  };

  return (
    <div className="metrics-container">
      <div className="metrics-card">
        <div className="metrics-header">
          <div>
            <h3>Hospitalization & ED Visit Metrics</h3>
            <p>Facility performance compared with state and national benchmarks.</p>
          </div>
          <span className="metrics-badge">Lower is better</span>
        </div>
        
        <div className="metric-summary-grid">
          {metrics.map((metric) => (
            <article className="metric-summary-card" key={metric.key}>
              <div>
                <span className="metric-audience">{metric.audience}</span>
                <h4>{metric.title}</h4>
              </div>
              <strong>{formatMetricValue(metric.facility, metric.unit)}</strong>
              <span className="metric-unit">{metric.unit}</span>
              <p>{getBenchmarkInsight(metric)}</p>
            </article>
          ))}
        </div>

        <div className="metrics-grid">
          <div className="metrics-section chart-section">
            <div className="chart-heading">
              <h4>Short-Stay Residents (STR)</h4>
              <span>Rates shown as percentages</span>
            </div>
            <div className="metric-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={buildChartData('Short-Stay')} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={tooltipFormatter} cursor={{ fill: 'rgba(219, 234, 254, 0.45)' }} />
                  <Legend />
                  <Bar dataKey="Facility" fill="#1e40af" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="State" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="National" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="metrics-section chart-section">
            <div className="chart-heading">
              <h4>Long-Stay Residents (LT)</h4>
              <span>Rates per 1,000 resident days</span>
            </div>
            <div className="metric-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={buildChartData('Long-Stay')} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={tooltipFormatter} cursor={{ fill: 'rgba(219, 234, 254, 0.45)' }} />
                  <Legend />
                  <Bar dataKey="Facility" fill="#1e40af" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="State" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="National" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="metrics-info">
          <p>
            <strong>Note:</strong> Lower hospitalization and ED visit rates generally indicate better quality care. 
            Short-stay measures are percentages; long-stay measures are rates per 1,000 resident days.
          </p>
        </div>
      </div>
    </div>
  );
};
