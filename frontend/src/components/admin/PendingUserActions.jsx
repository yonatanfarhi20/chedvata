import Button from '@/components/ui/Button';

export default function PendingUserActions({ user, onApprove, onReject }) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="success"
        size="sm"
        fullWidth={false}
        onClick={() => onApprove?.(user)}
        aria-label={`אשר תלמיד ${fullName}`}
      >
        אשר תלמיד
      </Button>
      <Button
        variant="danger"
        size="sm"
        fullWidth={false}
        onClick={() => onReject?.(user)}
        aria-label={`דחה בקשה של ${fullName}`}
      >
        דחה בקשה
      </Button>
    </div>
  );
}
