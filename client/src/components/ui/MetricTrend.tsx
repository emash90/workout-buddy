import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricTrendProps {
  value: number;
  change: number;
  label?: string;
  showValue?: boolean;
}

export const MetricTrend = ({ value, change, label, showValue = true }: MetricTrendProps) => {
  const getTrendIcon = () => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="flex items-center space-x-2">
      {showValue && <span className="text-sm font-medium text-gray-900">{value.toLocaleString()}</span>}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getTrendColor()}`}>
        {getTrendIcon()}
        <span>{Math.abs(change)}%</span>
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
};
