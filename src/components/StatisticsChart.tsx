import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { StatisticsDataPoint } from '../services/statisticsService';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './StatisticsChart.css';

interface StatisticsChartProps {
  data: StatisticsDataPoint[];
  onDataPointClick?: (dataPoint: StatisticsDataPoint) => void;
}

function StatisticsChart({ data, onDataPointClick }: StatisticsChartProps) {
  const currency = getCurrency();

  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dateKey: point.date,
    cost: point.cost,
    cumulativeTotal: point.cumulativeTotal,
    items: point.items,
    originalDataPoint: point, // Keep reference to original data point
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{dataPoint.date}</p>
          <p className="tooltip-total">
            Period Total: {formatPrice(dataPoint.cost, currency)}
          </p>
          <p className="tooltip-cumulative">
            Cumulative Total: {formatPrice(dataPoint.cumulativeTotal, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    return formatPrice(value, currency);
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const handleClick = () => {
      if (onDataPointClick && payload && payload.originalDataPoint) {
        onDataPointClick(payload.originalDataPoint);
      }
    };

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#4a9eff"
        style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
        onClick={onDataPointClick ? handleClick : undefined}
      />
    );
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!onDataPointClick) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#ffc107"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (onDataPointClick && payload && payload.originalDataPoint) {
            onDataPointClick(payload.originalDataPoint);
          }
        }}
      />
    );
  };

  const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!onDataPointClick) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#ffc107"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (onDataPointClick && payload && payload.originalDataPoint) {
            onDataPointClick(payload.originalDataPoint);
          }
        }}
      />
    );
  };

  return (
    <div className="statistics-chart">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="cost"
            fill="#4a9eff"
            shape={CustomBar}
          />
          <Line
            type="monotone"
            dataKey="cumulativeTotal"
            stroke="#ffc107"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatisticsChart;

