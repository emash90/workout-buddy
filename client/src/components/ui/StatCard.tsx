import type { LucideIcon } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  goal?: number;
  unit?: string;
  color: string;
  subtitle?: string;
  showProgress?: boolean;
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  title,
  value,
  goal,
  unit = '',
  color,
  subtitle,
  showProgress = true,
  className = '',
}: StatCardProps) => {

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {subtitle && <span className="text-sm font-medium text-gray-500">{subtitle}</span>}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-base ml-1 font-normal text-gray-500">{unit}</span>}
      </h3>
      {goal && (
        <>
          <p className="text-sm text-gray-500 mb-3">
            of {goal.toLocaleString()} {unit}
          </p>
          {showProgress && <ProgressBar value={Number(value)} max={goal} color={color} />}
        </>
      )}
    </div>
  );
};
