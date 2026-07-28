// Minimal dependency-free trend line — no charting library is installed in
// this project, and a handful of points doesn't warrant adding one.
export function VitalSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const width = 240;
  const height = 48;
  const padding = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full text-teal-500" aria-hidden="true">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
