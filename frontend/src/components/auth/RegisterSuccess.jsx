import Link from 'next/link';
import Alert from '@/components/ui/Alert';

export default function RegisterSuccess({ email }) {
  return (
    <div className="flex flex-col gap-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">ההרשמה בוצעה בהצלחה</h1>
      <Alert variant="success">
        נשלח קישור אימות לכתובת {email}. יש לאמת את החשבון תוך 12 שעות. לאחר האימות החשבון ימתין
        לאישור ההנהלה.
      </Alert>
      <p className="text-sm text-muted">
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          חזור להתחברות
        </Link>
      </p>
    </div>
  );
}
