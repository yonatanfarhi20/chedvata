import MessageTypeBadge from '@/components/messages/MessageTypeBadge';
import { getUserFullName } from '@/lib/admin/users';
import { formatMessageDate } from '@/lib/messages';

export default function MessageCard({ message }) {
  const senderName = getUserFullName(message?.senderId) || 'הנהלה';
  const sentAt = formatMessageDate(message?.createdAt);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <MessageTypeBadge message={message} />
      <h2 className="mt-3 text-base font-semibold text-foreground">{message?.subject}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{message?.content}</p>
      <p className="mt-3 text-xs text-muted">
        מאת {senderName}
        {sentAt ? ` · ${sentAt}` : ''}
      </p>
    </article>
  );
}
