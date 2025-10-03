interface ChartBarData {
  label: string;
  value: number;
  [key: string]: any;
}

interface ChartBarProps {
  data: ChartBarData[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
  onBarClick?: (data: ChartBarData) => void;
}

export const ChartBar = ({
  data,
  color = 'from-blue-500 to-blue-400',
  height = 256,
  showTooltip = true,
  onBarClick,
}: ChartBarProps) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center group">
          <div className="w-full flex flex-col justify-end h-full">
            <div
              className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all hover:opacity-80 ${
                onBarClick ? 'cursor-pointer' : ''
              } relative`}
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '2px',
              }}
              onClick={() => onBarClick?.(item)}
            >
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.value.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-2 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
