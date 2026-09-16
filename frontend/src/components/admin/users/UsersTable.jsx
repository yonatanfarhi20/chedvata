'use client';

import { useMemo, useState } from 'react';
import UserRowActions from '@/components/admin/users/UserRowActions';
import UserStatusBadge from '@/components/admin/users/UserStatusBadge';
import { SortIcon } from '@/components/admin/users/UserTableIcons';
import {
  USER_ROLE_LABELS,
  formatClassAffiliation,
  getUserFullName,
  isPendingApprovalStatus,
} from '@/lib/admin/users';

const COLUMN_DEFINITIONS = Object.freeze({
  name: {
    key: 'name',
    label: 'שם',
    sortValue: (user) => getUserFullName(user).toLowerCase(),
  },
  idNumber: {
    key: 'idNumber',
    label: 'תעודת זהות',
    sortValue: (user) => String(user.idNumber || ''),
  },
  classId: {
    key: 'classId',
    label: 'שיוך כיתתי',
    sortValue: (user) => String(user.classId || ''),
  },
  status: {
    key: 'status',
    label: 'סטטוס',
    sortValue: (user) => String(user.status || ''),
  },
});

function getColumns(showClassColumn) {
  return [
    COLUMN_DEFINITIONS.name,
    COLUMN_DEFINITIONS.idNumber,
    ...(showClassColumn ? [COLUMN_DEFINITIONS.classId] : []),
    COLUMN_DEFINITIONS.status,
  ];
}

function compareUsers(left, right, column, direction) {
  const leftValue = column.sortValue(left);
  const rightValue = column.sortValue(right);
  const result = String(leftValue).localeCompare(String(rightValue), 'he');

  return direction === 'desc' ? -result : result;
}

function UserCell({ columnKey, user, rabbis, canChangeStatus, onStatusClick, actionsDisabled }) {
  if (columnKey === 'name') {
    return (
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{getUserFullName(user)}</div>
        <div className="text-xs text-muted">{USER_ROLE_LABELS[user.role] || user.role || '—'}</div>
      </td>
    );
  }

  if (columnKey === 'idNumber') {
    return (
      <td className="px-4 py-3 font-mono text-foreground" dir="ltr">
        {user.idNumber || '—'}
      </td>
    );
  }

  if (columnKey === 'classId') {
    return (
      <td className="px-4 py-3 text-foreground">{formatClassAffiliation(user.classId, rabbis)}</td>
    );
  }

  return (
    <td className="px-4 py-3">
      <UserStatusBadge
        user={user}
        disabled={actionsDisabled}
        interactive={canChangeStatus && isPendingApprovalStatus(user.status)}
        onClick={onStatusClick}
      />
    </td>
  );
}

export default function UsersTable({
  users,
  rabbis = [],
  showClassColumn = true,
  canChangeStatus = false,
  onStatusClick,
  onEdit,
  onDelete,
  actionsDisabled = false,
}) {
  const columns = useMemo(() => getColumns(showClassColumn), [showClassColumn]);
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });

  const sortedUsers = useMemo(() => {
    const column = columns.find((item) => item.key === sort.key) || columns[0];
    return [...users].sort((left, right) => compareUsers(left, right, column, sort.direction));
  }, [users, sort, columns]);

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
      <table
        className={`w-full border-collapse text-start text-sm ${
          showClassColumn ? 'min-w-[48rem]' : 'min-w-[36rem]'
        }`}
      >
        <thead className="bg-background text-muted">
          <tr>
            {columns.map((column) => {
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
              {columns.map((column) => (
                <UserCell
                  key={column.key}
                  columnKey={column.key}
                  user={user}
                  rabbis={rabbis}
                  canChangeStatus={canChangeStatus}
                  onStatusClick={onStatusClick}
                  actionsDisabled={actionsDisabled}
                />
              ))}
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
