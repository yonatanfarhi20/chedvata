import { getPrayerDangerTone, PRAYER_DANGER_TONE } from '@/lib/student/dashboard';

const TONE_COLORS = {
  [PRAYER_DANGER_TONE.SAFE]: '#15803d',
  [PRAYER_DANGER_TONE.WARNING]: '#d97706',
  [PRAYER_DANGER_TONE.DANGER]: '#dc2626',
};

const TONE_LABELS = {
  [PRAYER_DANGER_TONE.SAFE]: 'מצב תקין',
  [PRAYER_DANGER_TONE.WARNING]: 'יש להיזהר',
  [PRAYER_DANGER_TONE.DANGER]: 'סכנת הפקדה',
};

const ZONE_COLORS = ['#15803d', '#d97706', '#d97706', '#dc2626', '#dc2626'];

function polarToCartesian(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  };
}

function valueToAngle(value, max) {
  return Math.PI * (1 - value / max);
}

function describeArc(cx, cy, radius, startValue, endValue, max) {
  const start = polarToCartesian(cx, cy, radius, valueToAngle(startValue, max));
  const end = polarToCartesian(cx, cy, radius, valueToAngle(endValue, max));
  const largeArc = endValue - startValue > max / 2 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function PrayerDangerGauge({ activeAbsences, maxAbsences = 5 }) {
  const max = Math.max(1, Number(maxAbsences) || 5);
  const absences = Math.max(0, Number(activeAbsences) || 0);
  const needleValue = Math.min(absences, max);
  const tone = getPrayerDangerTone(absences);
  const cx = 100;
  const cy = 108;
  const radius = 78;
  const needle = polarToCartesian(cx, cy, radius - 10, valueToAngle(needleValue, max));
  const ticks = Array.from({ length: max + 1 }, (_, value) => value);

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <svg
        viewBox="0 0 200 132"
        className="h-48 w-full max-w-[280px]"
        role="img"
        aria-label={`מד סכנה: ${absences} חיסורים פעילים מתוך ${max}. ${TONE_LABELS[tone]}.`}
      >
        {ZONE_COLORS.map((color, index) => (
          <path
            key={color + index}
            d={describeArc(cx, cy, radius, index, index + 1, max)}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="butt"
          />
        ))}
        {ticks.map((value) => {
          const angle = valueToAngle(value, max);
          const inner = polarToCartesian(cx, cy, radius - 22, angle);
          const outer = polarToCartesian(cx, cy, radius - 16, angle);
          const label = polarToCartesian(cx, cy, radius - 34, angle);

          return (
            <g key={value}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#57534e"
                strokeWidth="1.5"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted text-[10px] font-semibold"
              >
                {value}
              </text>
            </g>
          );
        })}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="#1c1917"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill="#1c1917" />
      </svg>
      <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: TONE_COLORS[tone] }}>
        {absences}
      </p>
      <p className="text-sm font-medium text-muted">חיסורים פעילים מתוך {max}</p>
      <p className="mt-1 text-sm font-semibold" style={{ color: TONE_COLORS[tone] }}>
        {TONE_LABELS[tone]}
      </p>
    </div>
  );
}
