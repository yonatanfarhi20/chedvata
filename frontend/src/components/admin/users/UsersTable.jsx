'use client';

import { useMemo, useState } from 'react';
import UserRowActions from '@/components/admin/users/UserRowActions';
import { SortIcon } from '@/components/admin/users/UserTableIcons';
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  formatClassAffiliation,
  getUserFullName,
} from '@/lib/admin/users';
import { USER_STATUS } from '@/lib/auth/constants';

const COLUMNS = [
  {
    key: 'name',
    label: 'שם',
    sortValue: (user) => getUserFullName(user).toLowerCase(),
  },
  {
    key: 'idNumber',
    label: 'תעודת זהות',
    sortValue: (user) => String(user.idNumber || ''),
  },
  {
    key: 'classId',
    label: 'שיוך כיתתי',
    sortValue: (user) => String(user.classId || ''),
  },
  {
    key: 'status',
    label: 'סטטוס',
    sortValue: (user) => String(user.status || ''),
  },
];

function compareUsers(left, right, column, direction) {
  const leftValue = column.sortValue(left);
  const rightValue = column.sortValue(right);
  const result = String(leftValue).localeCompare(String(rightValue), 'he');

  return direction === 'desc' ? -result : result;
}

function StatusBadge({ status }) {
  const isActive = status === USER_STATUS.ACTIVE;
  const isPendingApproval = status === USER_STATUS.PENDING_ADMIN_APPROVAL;

  const styles = isActive
    ? 'bg-success/10 text-success'
    : isPendingApproval
      ? 'bg-amber-100 text-amber-800'
      : 'bg-background text-muted';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {USER_STATUS_LABELS[status] || status || '—'}
    </span>
  );
}

export default function UsersTable({ users, onEdit, onDelete, actionsDisabled = false }) {
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });

  const sortedUsers = useMemo(() => {
    const column = COLUMNS.find((item) => item.key === sort.key) || COLUMNS[0];
    return [...users].sort((left, right) => compareUsers(left, right, column, sort.direction));
  }, [users, sort]);

  function handleSort(key) {
    setSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return { key, direction: 'asc' };
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[48rem] border-collapse text-start text-sm">
        <thead className="bg-background text-muted">
          <tr>
            {COLUMNS.map((column) => {
              const isActive = sort.key === column.key;

              return (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground"
                    aria-label={`מיון לפי ${column.label}`}
                  >
                    {column.label}
                    <SortIcon direction={isActive ? sort.direction : undefined} />
                  </button>
                </th>
              );
            })}
            <th className="px-4 py-3 font-semibold">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user._id} className="border-t border-border">
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{getUserFullName(user)}</div>
                <div className="text-xs text-muted">
                  {USER_ROLE_LABELS[user.role] || user.role || '—'}
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-foreground" dir="ltr">
                {user.idNumber || '—'}
              </td>
              <td className="px-4 py-3 text-foreground">{formatClassAffiliation(user.classId)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3">
                <UserRowActions
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  disabled={actionsDisabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
