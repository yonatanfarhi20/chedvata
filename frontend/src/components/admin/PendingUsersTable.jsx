import PendingUserActions from '@/components/admin/PendingUserActions';

function getFullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function formatRegistrationDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('he-IL');
}

function PendingUserCard({ user, onApprove, onReject, disabled, isLeaving }) {
  return (
    <article
      className={`rounded-xl border border-border bg-card p-4 shadow-sm transition-opacity duration-200 ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <h3 className="text-base font-semibold text-foreground">{getFullName(user)}</h3>
      <dl className="mt-3 space-y-1 text-sm text-muted">
        <div className="flex justify-between gap-4">
          <dt>תעודת זהות</dt>
          <dd className="font-medium text-foreground">{user.idNumber}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>תאריך הרשמה</dt>
          <dd className="font-medium text-foreground">{formatRegistrationDate(user.createdAt)}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <PendingUserActions
          user={user}
          onApprove={onApprove}
          onReject={onReject}
          disabled={disabled}
        />
      </div>
    </article>
  );
}

export default function PendingUsersTable({
  users,
  onApprove,
  onReject,
  disabledUserId,
  actionsDisabled = false,
  leavingIds = [],
}) {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((user) => (
          <PendingUserCard
            key={user._id}
            user={user}
            onApprove={onApprove}
            onReject={onReject}
            disabled={
              actionsDisabled || disabledUserId === user._id || leavingIds.includes(user._id)
            }
            isLeaving={leavingIds.includes(user._id)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full min-w-[40rem] border-collapse text-start text-sm">
          <thead className="bg-background text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">שם</th>
              <th className="px-4 py-3 font-semibold">תעודת זהות</th>
              <th className="px-4 py-3 font-semibold">תאריך הרשמה</th>
              <th className="px-4 py-3 font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isLeaving = leavingIds.includes(user._id);

              return (
                <tr
                  key={user._id}
                  className={`border-t border-border transition-opacity duration-200 ${
                    isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{getFullName(user)}</td>
                  <td className="px-4 py-3 text-foreground">{user.idNumber}</td>
                  <td className="px-4 py-3 text-foreground">
                    {formatRegistrationDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <PendingUserActions
                      user={user}
                      onApprove={onApprove}
                      onReject={onReject}
                      disabled={actionsDisabled || disabledUserId === user._id || isLeaving}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
