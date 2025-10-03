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
  showValues?: boolean;
  showGridLines?: boolean;
  onBarClick?: (data: ChartBarData) => void;
}

export const ChartBar = ({
  data,
  color = 'from-blue-500 to-blue-400',
  height = 256,
  showTooltip = true,
  showValues = false,
  showGridLines = true,
  onBarClick,
}: ChartBarProps) => {
  const dataMaxValue = Math.max(...data.map((d) => d.value), 1);

  // Calculate a nicer max value for better visualization
  const getNiceMaxValue = (max: number) => {
    if (max === 0) return 100;

    // Round up to nearest nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;

    let niceValue;
    if (normalized <= 1) niceValue = 1;
    else if (normalized <= 2) niceValue = 2;
    else if (normalized <= 5) niceValue = 5;
    else niceValue = 10;

    return niceValue * magnitude;
  };

  const maxValue = getNiceMaxValue(dataMaxValue);

  // Calculate nice grid line values
  const gridLineCount = 5;
  const gridLines = Array.from({ length: gridLineCount }, (_, i) => {
    const value = (maxValue / (gridLineCount - 1)) * i;
    return Math.round(value);
  });

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      {/* Grid lines */}
      {showGridLines && (
        <div className="absolute inset-0 pointer-events-none pl-12">
          {gridLines.map((value, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-200"
              style={{ bottom: `${(i / (gridLineCount - 1)) * 100}%` }}
            >
              <span className="absolute left-0 -translate-x-full pr-2 text-xs text-gray-500 font-medium">
                {value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart bars */}
      <div className="absolute inset-0 flex items-end justify-between space-x-2 pl-12">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group h-full">
              <div className="w-full flex flex-col justify-end h-full relative">
                {/* Value label on top of bar */}
                {showValues && item.value > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.value.toLocaleString()}
                  </div>
                )}

                <div
                  className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all duration-500 ease-out hover:opacity-90 hover:shadow-md ${
                    onBarClick ? 'cursor-pointer' : ''
                  } relative`}
                  style={{
                    height: item.value > 0 ? `${barHeight}%` : '0%',
                    minHeight: item.value > 0 ? '3px' : '0px',
                    animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                  onClick={() => onBarClick?.(item)}
                >
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                      <div className="font-semibold">{item.value.toLocaleString()}</div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 font-medium absolute -bottom-6">{item.label}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }
      `}</style>
    </div>
  );
};
