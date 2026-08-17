import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { ACTIVITY_TYPE, ACTIVITY_TYPE_LABELS } from '@/lib/admin/attendance';

export default function AttendanceFilters({
  date,
  activityType,
  onDateChange,
  onActivityTypeChange,
  disabled = false,
}) {
  return (
    <section className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="attendance-date"
          name="date"
          label="תאריך"
          type="date"
          value={date}
          onChange={(event) => onDateChange?.(event.target.value)}
          required
          disabled={disabled}
        />
        <SelectField
          id="attendance-activity-type"
          name="activityType"
          label="סוג פעילות"
          value={activityType}
          onChange={(event) => onActivityTypeChange?.(event.target.value)}
          required
          disabled={disabled}
        >
          {Object.values(ACTIVITY_TYPE).map((type) => (
            <option key={type} value={type}>
              {ACTIVITY_TYPE_LABELS[type]}
            </option>
          ))}
        </SelectField>
      </div>
    </section>
  );
}
