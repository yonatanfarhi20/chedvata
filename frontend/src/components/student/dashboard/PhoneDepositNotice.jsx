import { PRAYER_DANGER_TONE } from '@/lib/student/dashboard';

const TONE_STYLES = {
  [PRAYER_DANGER_TONE.SAFE]: 'border-success/30 bg-success/10 text-success',
  [PRAYER_DANGER_TONE.WARNING]: 'border-amber-300 bg-amber-50 text-amber-800',
  [PRAYER_DANGER_TONE.DANGER]: 'border-error/30 bg-error/10 text-error',
};

export default function PhoneDepositNotice({ notice }) {
  if (!notice?.message) {
    return null;
  }

  const toneClass = TONE_STYLES[notice.tone] || TONE_STYLES[PRAYER_DANGER_TONE.WARNING];

  return (
    <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-semibold ${toneClass}`}>
      {notice.message}
    </p>
  );
}
