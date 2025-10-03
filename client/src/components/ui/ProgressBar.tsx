interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar = ({
  value,
  max,
  color = 'from-blue-500 to-blue-600',
  showPercentage = false,
  size = 'md',
  className = '',
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${heightClasses[size]}`}>
        <div
          className={`bg-gradient-to-r ${color} ${heightClasses[size]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
