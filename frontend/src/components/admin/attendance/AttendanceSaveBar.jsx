import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function AttendanceSaveBar({ disabled = false, isSubmitting = false, onSave }) {
  return (
    <div className="sticky bottom-0 z-20 shrink-0 border-t border-border bg-background/95 py-4 backdrop-blur">
      <Button
        type="button"
        disabled={disabled || isSubmitting}
        onClick={onSave}
        fullWidth
        className="inline-flex items-center justify-center gap-2 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            שומר נוכחות...
          </>
        ) : (
          'שמור נוכחות'
        )}
      </Button>
    </div>
  );
}
