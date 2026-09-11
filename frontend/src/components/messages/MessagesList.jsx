import MessageCard from '@/components/messages/MessageCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getMessageId } from '@/lib/messages';

export default function MessagesList({ messages = [], isLoading = false, loadError = '', onRetry }) {
  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{loadError}</Alert>
        {onRetry ? (
          <Button type="button" variant="secondary" fullWidth={false} onClick={onRetry}>
            נסה שוב
          </Button>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        טוען הודעות...
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
        אין הודעות בתיבה.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((message) => (
        <li key={getMessageId(message) || message.subject}>
          <MessageCard message={message} />
        </li>
      ))}
    </ul>
  );
}
