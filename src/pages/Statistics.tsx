import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aggregateData, type Granularity, type StatisticsType } from '../services/statisticsService';
import type { StatisticsDataPoint } from '../services/statisticsService';
import StatisticsChart from '../components/StatisticsChart';
import DateRangePicker from '../components/DateRangePicker';
import GranularitySelector from '../components/GranularitySelector';
import TypeSelector from '../components/TypeSelector';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './Statistics.css';

function Statistics() {
  const navigate = useNavigate();
  const currency = getCurrency();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [type, setType] = useState<StatisticsType>('meals');
  const [data, setData] = useState<StatisticsDataPoint[]>([]);
  const [selectedDataPoint, setSelectedDataPoint] = useState<StatisticsDataPoint | null>(null);

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
        <>
          <StatisticsChart
            data={data}
            onDataPointClick={(dataPoint) => setSelectedDataPoint(dataPoint)}
          />
          {selectedDataPoint && selectedDataPoint.items.length > 0 && (
            <div className="statistics-items-list">
              <h2>Items for {new Date(selectedDataPoint.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</h2>
              <div className="items-grid">
                {selectedDataPoint.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.type === 'meal') {
                        navigate(`/cooking/meal/${item.id}`);
                      } else {
                        navigate(`/shopping/event/${item.id}`);
                      }
                    }}
                    className="statistics-item-button"
                  >
                    <span className="item-name">{item.name}</span>
                    <span className="item-cost">{formatPrice(item.cost, currency)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Statistics;

