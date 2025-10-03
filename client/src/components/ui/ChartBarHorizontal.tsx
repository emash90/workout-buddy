interface ChartBarHorizontalData {
  label: string;
  value: number;
  [key: string]: any;
}

interface ChartBarHorizontalProps {
  data: ChartBarHorizontalData[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
  showValues?: boolean;
  showGridLines?: boolean;
  valueFormatter?: (value: number) => string;
}

export const ChartBarHorizontal = ({
  data,
  color = 'from-blue-500 to-blue-400',
  height = 600,
  showTooltip = true,
  showValues = true,
  showGridLines = true,
  valueFormatter,
}: ChartBarHorizontalProps) => {
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

  const formatValue = (value: number) => {
    if (valueFormatter) return valueFormatter(value);
    return value.toLocaleString();
  };

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      {/* Grid lines */}
      {showGridLines && (
        <div className="absolute inset-0 pointer-events-none">
          {gridLines.map((value, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-gray-200"
              style={{ left: `${(i / (gridLineCount - 1)) * 100}%` }}
            >
              <span className="absolute top-0 left-0 -translate-y-full pt-1 text-xs text-gray-500 font-medium -translate-x-1/2">
                {value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart bars */}
      <div className="absolute inset-0 flex flex-col justify-around pt-6">
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex items-center group h-full">
              {/* Hour label */}
              <div className="w-12 text-right pr-3">
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              </div>

              {/* Bar container */}
              <div className="flex-1 relative h-6">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-r-lg transition-all duration-500 ease-out hover:opacity-90 hover:shadow-md relative group`}
                  style={{
                    width: item.value > 0 ? `${barWidth}%` : '0%',
                    minWidth: item.value > 0 ? '4px' : '0px',
                    animation: `slideRight 0.6s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {showTooltip && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                      <div className="font-semibold">{formatValue(item.value)}</div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                  )}

                  {showValues && item.value > 0 && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {formatValue(item.value)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideRight {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
      `}</style>
    </div>
  );
};
