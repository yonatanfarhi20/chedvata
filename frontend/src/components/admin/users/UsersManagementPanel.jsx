'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RejectUserModal from '@/components/admin/RejectUserModal';
import DeleteConfirmationModal from '@/components/admin/users/DeleteConfirmationModal';
import UserFormModal from '@/components/admin/users/UserFormModal';
import UserStatusModal from '@/components/admin/users/UserStatusModal';
import UsersTableSection from '@/components/admin/users/UsersTableSection';
import UsersTableToolbar from '@/components/admin/users/UsersTableToolbar';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
  getRabbis,
  isStaffUser,
  isStudentUser,
  matchesUserSearch,
} from '@/lib/admin/users';
import { approveUser, deleteUser, getUsers, rejectUser } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { SENIOR_MANAGEMENT_ROLES, USER_ROLE, USER_STATUS } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

export default function UsersManagementPanel() {
  const sessionUser = useSession()?.user;
  const canChangeStatus = SENIOR_MANAGEMENT_ROLES.includes(sessionUser?.role);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState(null);
  const [userToReject, setUserToReject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState({ message: '', variant: 'success' });
  const loadRequestIdRef = useRef(0);

  const loadUsers = useCallback(async ({ silent = false } = {}) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    if (!silent) {
      setIsLoading(true);
    }
    setLoadError('');

    try {
      const data = await getUsers();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setUsers([]);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את רשימת המשתמשים.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUsers();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [loadUsers]);

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesUserSearch(user, searchQuery)),
    [users, searchQuery],
  );
  const studentUsers = useMemo(
    () => filteredUsers.filter(isStudentUser),
    [filteredUsers],
  );
  const staffUsers = useMemo(
    () => filteredUsers.filter(isStaffUser),
    [filteredUsers],
  );

  const handleCloseToast = useCallback(() => {
    setToast({ message: '', variant: 'success' });
  }, []);

  function showToast(message, variant = 'success') {
    setToast({ message, variant });
  }

  function handleAddUser() {
    setSelectedUser(null);
    setIsFormOpen(true);
  }

  function handleEditUser(user) {
    setSelectedUser(user);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
  }

  function handleDeleteUser(user) {
    setDeleteError('');
    setUserToDelete(user);
  }

  function handleCloseDelete() {
    if (isDeleting) {
      return;
    }

    setUserToDelete(null);
    setDeleteError('');
  }

  async function handleConfirmDelete() {
    if (!userToDelete || isDeleting) {
      return;
    }

    const pendingUser = userToDelete;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const data = await deleteUser(pendingUser._id);
      setUserToDelete(null);
      setUsers((current) => current.filter((item) => item._id !== pendingUser._id));
      showToast(data?.message || 'המשתמש נמחק בהצלחה');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setDeleteError(getErrorMessage(error, 'מחיקת המשתמש נכשלה. נסו שוב.'));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleStatusClick(user) {
    if (!canChangeStatus || isApproving || isRejecting) {
      return;
    }

    setUserToUpdateStatus(user);
  }

  function handleCloseStatusModal() {
    if (isApproving) {
      return;
    }

    setUserToUpdateStatus(null);
  }

  async function handleApproveUser(pendingUser) {
    if (!pendingUser || isApproving || isRejecting) {
      return;
    }

    setIsApproving(true);

    try {
      const data = await approveUser(pendingUser._id);
      setUserToUpdateStatus(null);
      setUsers((current) =>
        current.map((item) =>
          item._id === pendingUser._id
            ? { ...item, ...(data?.user || {}), status: USER_STATUS.ACTIVE }
            : item,
        ),
      );
      showToast(
        data?.message ||
          (pendingUser.role === USER_ROLE.STUDENT ? 'התלמיד אושר בהצלחה' : 'המשתמש אושר בהצלחה'),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        setUserToUpdateStatus(null);
        setUsers((current) => current.filter((item) => item._id !== pendingUser._id));
      }

      showToast(getErrorMessage(error, 'אישור המשתמש נכשל. נסו שוב.'), 'error');
    } finally {
      setIsApproving(false);
    }
  }

  function handleRejectFromStatus(pendingUser) {
    if (isApproving || isRejecting) {
      return;
    }

    setUserToUpdateStatus(null);
    setUserToReject(pendingUser);
  }

  function handleCloseRejectModal() {
    if (isRejecting) {
      return;
    }

    setUserToReject(null);
  }

  async function handleConfirmReject() {
    if (!userToReject || isRejecting) {
      return;
    }

    const pendingUser = userToReject;
    setIsRejecting(true);

    try {
      const data = await rejectUser(pendingUser._id);
      setUserToReject(null);
      setUsers((current) => current.filter((item) => item._id !== pendingUser._id));
      showToast(data?.message || 'הבקשה נדחתה והמשתמש נמחק');
    } catch (error) {
      setUserToReject(null);

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        setUsers((current) => current.filter((item) => item._id !== pendingUser._id));
      }

      showToast(getErrorMessage(error, 'דחיית הבקשה נכשלה. נסו שוב.'), 'error');
    } finally {
      setIsRejecting(false);
    }
  }

  async function handleUserSaved(message) {
    showToast(message);
    await loadUsers({ silent: true });
  }

  const rabbis = useMemo(() => getRabbis(users), [users]);
  const hasSearch = searchQuery.trim().length > 0;
  const actionsDisabled = isDeleting || isApproving || isRejecting;
  const sharedTableProps = {
    rabbis,
    canChangeStatus,
    onStatusClick: handleStatusClick,
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
    actionsDisabled,
  };

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">ניהול משתמשים</h1>
          <p className="mt-1 text-sm text-muted">
            ניהול נפרד של תלמידים ואנשי צוות. ניתן לחפש, למיין, להוסיף ולערוך משתמשים.
          </p>
        </header>

        <UsersTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddUser={handleAddUser}
          disabled={isLoading}
        />

        {loadError ? (
          <div className="mb-4 flex flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={() => loadUsers()}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {isLoading ? <p className="text-sm text-muted">טוען משתמשים...</p> : null}

        {!isLoading && !loadError ? (
          <div className="flex flex-col gap-8">
            <UsersTableSection
              title="תלמידים"
              description="תלמידי הישיבה לפי שיוך כיתתי וסטטוס במערכת."
              users={studentUsers}
              emptyMessage={
                hasSearch ? 'לא נמצאו תלמידים התואמים לחיפוש.' : 'אין תלמידים להצגה במערכת.'
              }
              showClassColumn
              {...sharedTableProps}
            />

            <UsersTableSection
              title="צוות"
              description="רבנים, משגיח וראש ישיבה."
              users={staffUsers}
              emptyMessage={hasSearch ? 'לא נמצאו אנשי צוות התואמים לחיפוש.' : 'אין אנשי צוות להצגה במערכת.'}
              showClassColumn={false}
              {...sharedTableProps}
            />
          </div>
        ) : null}
      </section>

      <UserFormModal
        isOpen={isFormOpen}
        user={selectedUser}
        users={users}
        onClose={handleCloseForm}
        onSaved={handleUserSaved}
      />

      <UserStatusModal
        user={userToUpdateStatus}
        isApproving={isApproving}
        onClose={handleCloseStatusModal}
        onApprove={handleApproveUser}
        onReject={handleRejectFromStatus}
      />

      <RejectUserModal
        user={userToReject}
        isConfirming={isRejecting}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
      />

      <DeleteConfirmationModal
        user={userToDelete}
        isConfirming={isDeleting}
        error={deleteError}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      <Toast
        open={Boolean(toast.message)}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
    </div>
  );
}
