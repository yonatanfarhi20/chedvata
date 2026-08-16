'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import UserFormModal from '@/components/admin/users/UserFormModal';
import UsersTable from '@/components/admin/users/UsersTable';
import UsersTableToolbar from '@/components/admin/users/UsersTableToolbar';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { matchesUserSearch } from '@/lib/admin/users';
import { getUsers } from '@/lib/api/admin';
import { ApiError, getErrorMessage } from '@/lib/api/client';

export default function UsersManagementPanel() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
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

  const handleCloseToast = useCallback(() => {
    setToastMessage('');
  }, []);

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

  async function handleUserSaved(message) {
    setToastMessage(message);
    await loadUsers({ silent: true });
  }

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">ניהול משתמשים</h1>
          <p className="mt-1 text-sm text-muted">
            רשימה מרוכזת של התלמידים ואנשי הצוות במערכת. ניתן לחפש, למיין, להוסיף ולערוך משתמשים.
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

        {!isLoading && !loadError && filteredUsers.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
            {hasSearch ? 'לא נמצאו משתמשים התואמים לחיפוש.' : 'אין משתמשים להצגה במערכת.'}
          </p>
        ) : null}

        {!isLoading && filteredUsers.length > 0 ? (
          <UsersTable users={filteredUsers} onEdit={handleEditUser} />
        ) : null}
      </section>

      <UserFormModal
        isOpen={isFormOpen}
        user={selectedUser}
        onClose={handleCloseForm}
        onSaved={handleUserSaved}
      />

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage}
        onClose={handleCloseToast}
      />
    </div>
  );
}
