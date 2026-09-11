import { getMessageTypeBadgeClassName, getMessageTypeLabel } from '@/lib/messages';

export default function MessageTypeBadge({ message }) {
  const label = getMessageTypeLabel(message);

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${getMessageTypeBadgeClassName(message)}`}
    >
      {label}
    </span>
  );
}
