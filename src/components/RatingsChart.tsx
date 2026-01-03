import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import type { RatingsDataPoint } from '../services/statisticsService';
import type { TooltipProps, DotProps } from '../types';
import './RatingsChart.css';

interface RatingsChartProps {
  data: RatingsDataPoint[];
  onDataPointClick?: (dataPoint: RatingsDataPoint) => void;
}

function RatingsChart({ data, onDataPointClick }: RatingsChartProps) {
  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dateKey: point.date,
    averageRating: parseFloat(point.averageRating.toFixed(2)),
    ratingCount: point.ratingCount,
    meals: point.meals,
    originalDataPoint: point,
  }));

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const ratingCount = dataPoint.ratingCount ?? 0;
      const meals = dataPoint.meals ?? [];
      return (
        <div className="ratings-chart-tooltip">
          <p className="tooltip-date">{dataPoint.date}</p>
          <p className="tooltip-rating">
            Average Rating: {dataPoint.averageRating ?? 0} ★
          </p>
          <p className="tooltip-count">
            Based on {ratingCount} meal{ratingCount > 1 ? 's' : ''}
          </p>
          <div className="tooltip-meals">
            {meals.slice(0, 5).map((meal: { name: string; rating: number }, index: number) => (
              <div key={index} className="tooltip-meal-item">
                <span className="meal-name">{meal.name}</span>
                <span className="meal-rating">{'★'.repeat(meal.rating)}</span>
              </div>
            ))}
            {meals.length > 5 && (
              <p className="tooltip-more">...and {meals.length - 5} more</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    return `${value}★`;
  };

  const CustomDot = (props: DotProps) => {
    const { cx, cy, payload } = props;
    if (!onDataPointClick) return <circle cx={cx} cy={cy} r={4} fill="#ffc107" />;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#ffc107"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (onDataPointClick && payload && payload.originalDataPoint) {
            const dataPoint = payload.originalDataPoint as RatingsDataPoint;
            onDataPointClick(dataPoint);
          }
        }}
      />
    );
  };

  const CustomActiveDot = (props: DotProps) => {
    const { cx, cy, payload } = props;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#ffc107"
        style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
        onClick={() => {
          if (onDataPointClick && payload && payload.originalDataPoint) {
            const dataPoint = payload.originalDataPoint as RatingsDataPoint;
            onDataPointClick(dataPoint);
          }
        }}
      />
    );
  };

  return (
    <div className="ratings-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis
            stroke="#aaa"
            tickFormatter={formatYAxis}
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={3} stroke="#666" strokeDasharray="5 5" label={{ value: 'Average', fill: '#666', position: 'right' }} />
          <Line
            type="monotone"
            dataKey="averageRating"
            name="Average Rating"
            stroke="#ffc107"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
            onClick={(data: unknown) => {
              if (onDataPointClick && data && typeof data === 'object' && data !== null && 'originalDataPoint' in data) {
                const dataPoint = (data as { originalDataPoint: RatingsDataPoint }).originalDataPoint;
                onDataPointClick(dataPoint);
              }
            }}
            style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RatingsChart;
