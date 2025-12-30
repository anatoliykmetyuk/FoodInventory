import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="date-range-picker">
      <label htmlFor="start-date">Start Date:</label>
      <input
        id="start-date"
        type="date"
        value={formatDateForInput(startDate)}
        onChange={(e) => onStartDateChange(new Date(e.target.value))}
        className="date-input"
      />
      <label htmlFor="end-date">End Date:</label>
      <input
        id="end-date"
        type="date"
        value={formatDateForInput(endDate)}
        onChange={(e) => onEndDateChange(new Date(e.target.value))}
        className="date-input"
      />
    </div>
  );
}

export default DateRangePicker;

