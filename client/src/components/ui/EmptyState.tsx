import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  iconColor = 'bg-blue-100 text-blue-600',
}: EmptyStateProps) => {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
      <div className="text-center max-w-md mx-auto">
        <div className={`w-16 h-16 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="primary">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};
