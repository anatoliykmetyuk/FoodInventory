import { useState, useEffect } from 'react';
import { aggregateData, type Granularity, type StatisticsType } from '../services/statisticsService';
import type { StatisticsDataPoint } from '../services/statisticsService';
import StatisticsChart from '../components/StatisticsChart';
import DateRangePicker from '../components/DateRangePicker';
import GranularitySelector from '../components/GranularitySelector';
import TypeSelector from '../components/TypeSelector';
import './Statistics.css';

function Statistics() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [type, setType] = useState<StatisticsType>('meals');
  const [data, setData] = useState<StatisticsDataPoint[]>([]);

  useEffect(() => {
    const aggregated = aggregateData(startDate, endDate, granularity, type);
    setData(aggregated);
  }, [startDate, endDate, granularity, type]);

  return (
    <div className="statistics-page">
      <h1>Statistics</h1>

      <div className="statistics-controls">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <GranularitySelector
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <TypeSelector
          type={type}
          onTypeChange={setType}
        />
      </div>

      {data.length === 0 ? (
        <div className="no-data">
          <p>No data available for the selected date range and type.</p>
        </div>
      ) : (
        <StatisticsChart data={data} />
      )}
    </div>
  );
}

export default Statistics;

