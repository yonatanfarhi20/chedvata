import UsersTable from '@/components/admin/users/UsersTable';

export default function UsersTableSection({
  title,
  description,
  users,
  emptyMessage,
  ...tableProps
}) {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </header>

      {users.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
          {emptyMessage}
        </p>
      ) : (
        <UsersTable users={users} {...tableProps} />
      )}
    </section>
  );
}
