import { ProgressBar } from './ProgressBar';

interface MetricItemProps {
  label: string;
  value: number | string;
  max?: number;
  color?: string;
  showProgress?: boolean;
  valueFormatter?: (value: number | string) => string;
}

export const MetricItem = ({
  label,
  value,
  max,
  color = 'from-blue-500 to-blue-600',
  showProgress = true,
  valueFormatter,
}: MetricItemProps) => {
  const displayValue = valueFormatter
    ? valueFormatter(value)
    : typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-blue-600">{displayValue}</span>
      </div>
      {showProgress && max && (
        <ProgressBar value={Number(value)} max={max} color={color} size="sm" />
      )}
    </div>
  );
};
