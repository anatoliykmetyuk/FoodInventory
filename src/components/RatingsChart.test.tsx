import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import RatingsChart from './RatingsChart';
import type { RatingsDataPoint } from '../services/statisticsService';

describe('RatingsChart', () => {
  const mockData: RatingsDataPoint[] = [
    {
      date: '2024-01-01',
      averageRating: 4.5,
      ratingCount: 2,
      meals: [
        { id: 'meal1', name: 'Test Meal 1', rating: 4 },
        { id: 'meal2', name: 'Test Meal 2', rating: 5 },
      ],
    },
    {
      date: '2024-01-02',
      averageRating: 3.0,
      ratingCount: 1,
      meals: [
        { id: 'meal3', name: 'Test Meal 3', rating: 3 },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chart with data', () => {
    const { container } = render(<RatingsChart data={mockData} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render the chart without onDataPointClick handler', () => {
    const { container } = render(<RatingsChart data={mockData} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render with onDataPointClick handler provided', () => {
    const mockOnDataPointClick = vi.fn();
    const { container } = render(<RatingsChart data={mockData} onDataPointClick={mockOnDataPointClick} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render with empty data array', () => {
    const { container } = render(<RatingsChart data={[]} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render chart with single data point', () => {
    const singleDataPoint: RatingsDataPoint[] = [
      {
        date: '2024-01-01',
        averageRating: 4.0,
        ratingCount: 1,
        meals: [{ id: 'meal1', name: 'Test Meal', rating: 4 }],
      },
    ];
    const { container } = render(<RatingsChart data={singleDataPoint} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle data points with zero rating count', () => {
    const zeroCountData: RatingsDataPoint[] = [
      {
        date: '2024-01-01',
        averageRating: 0,
        ratingCount: 0,
        meals: [],
      },
    ];
    const { container } = render(<RatingsChart data={zeroCountData} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should process data correctly with multiple meals', () => {
    const { container } = render(<RatingsChart data={mockData} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle data points with decimal average ratings', () => {
    const decimalData: RatingsDataPoint[] = [
      {
        date: '2024-01-01',
        averageRating: 3.75,
        ratingCount: 4,
        meals: [
          { id: 'meal1', name: 'Meal 1', rating: 4 },
          { id: 'meal2', name: 'Meal 2', rating: 3 },
          { id: 'meal3', name: 'Meal 3', rating: 4 },
          { id: 'meal4', name: 'Meal 4', rating: 4 },
        ],
      },
    ];
    const { container } = render(<RatingsChart data={decimalData} />);
    const chartContainer = container.querySelector('.ratings-chart');
    expect(chartContainer).toBeInTheDocument();
  });
});

