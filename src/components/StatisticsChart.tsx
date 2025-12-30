import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { StatisticsDataPoint } from '../services/statisticsService';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './StatisticsChart.css';

interface StatisticsChartProps {
  data: StatisticsDataPoint[];
}

function StatisticsChart({ data }: StatisticsChartProps) {
  const navigate = useNavigate();
  const currency = getCurrency();

  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: point.cost,
    items: point.items,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{dataPoint.date}</p>
          <p className="tooltip-total">
            Total: {formatPrice(dataPoint.cost, currency)}
          </p>
          <div className="tooltip-items">
            {dataPoint.items.map((item: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  if (item.type === 'meal') {
                    navigate(`/cooking/meal/${item.id}`);
                  } else {
                    navigate(`/shopping/event/${item.id}`);
                  }
                }}
                className="tooltip-item"
              >
                {item.name}: {formatPrice(item.cost, currency)}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    return formatPrice(value, currency);
  };

  return (
    <div className="statistics-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#4a9eff"
            strokeWidth={2}
            dot={{ fill: '#4a9eff', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatisticsChart;

