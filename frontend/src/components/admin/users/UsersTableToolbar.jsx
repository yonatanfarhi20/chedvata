import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function UsersTableToolbar({
  searchQuery,
  onSearchChange,
  onAddUser,
  disabled = false,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full sm:max-w-sm">
        <TextField
          id="users-search"
          name="usersSearch"
          label="חיפוש"
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
          autoComplete="off"
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-muted">סינון לפי שם או תעודת זהות</p>
      </div>
      <Button type="button" fullWidth={false} disabled={disabled} onClick={() => onAddUser?.()}>
        הוסף משתמש
      </Button>
    </div>
  );
}
