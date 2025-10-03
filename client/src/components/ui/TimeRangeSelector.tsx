interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  color?: string;
}

export const TimeRangeSelector = ({
  value,
  onChange,
  options,
  color = 'blue',
}: TimeRangeSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            value === option.value
              ? `bg-${color}-600 text-white`
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
