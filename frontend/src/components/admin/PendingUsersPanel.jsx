'use client';

import { useEffect, useRef, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import PendingUsersTable from '@/components/admin/PendingUsersTable';
import RejectUserModal from '@/components/admin/RejectUserModal';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { approveUser, getPendingUsers, rejectUser } from '@/lib/api/admin';
import { useSession } from '@/lib/auth/session';

const ROW_EXIT_MS = 200;

export default function PendingUsersPanel() {
  const user = useSession()?.user;
  const [users, setUsers] = useState([]);
  const [leavingIds, setLeavingIds] = useState([]);
  const [userToReject, setUserToReject] = useState(null);
  const [busyUserId, setBusyUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const exitTimeoutsRef = useRef([]);
  const busyUserIdRef = useRef(null);
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    loadPendingUsers();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    return () => {
      exitTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  async function loadPendingUsers() {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');
    setActionError('');
    setSuccessMessage('');

    try {
      const data = await getPendingUsers();

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
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את רשימת הממתינים.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  function removeUserFromList(userId) {
    setLeavingIds((current) => (current.includes(userId) ? current : [...current, userId]));

    const timeoutId = window.setTimeout(() => {
      setUsers((current) => current.filter((item) => item._id !== userId));
      setLeavingIds((current) => current.filter((id) => id !== userId));
    }, ROW_EXIT_MS);

    exitTimeoutsRef.current.push(timeoutId);
  }

  function beginAction(userId) {
    if (busyUserIdRef.current) {
      return false;
    }

    busyUserIdRef.current = userId;
    setBusyUserId(userId);
    setActionError('');
    setSuccessMessage('');
    return true;
  }

  function endAction() {
    busyUserIdRef.current = null;
    setBusyUserId(null);
  }

  async function handleApprove(pendingUser) {
    if (!beginAction(pendingUser._id)) {
      return;
    }

    try {
      const data = await approveUser(pendingUser._id);
      removeUserFromList(pendingUser._id);
      setSuccessMessage(data?.message || 'התלמיד אושר בהצלחה');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        removeUserFromList(pendingUser._id);
      }

      setActionError(getErrorMessage(error, 'אישור התלמיד נכשל. נסו שוב.'));
    } finally {
      endAction();
    }
  }

  function handleReject(pendingUser) {
    if (busyUserIdRef.current) {
      return;
    }

    setActionError('');
    setUserToReject(pendingUser);
  }

  function handleCloseRejectModal() {
    if (busyUserIdRef.current) {
      return;
    }

    setUserToReject(null);
  }

  async function handleConfirmReject() {
    if (!userToReject || !beginAction(userToReject._id)) {
      return;
    }

    const pendingUser = userToReject;

    try {
      const data = await rejectUser(pendingUser._id);
      setUserToReject(null);
      removeUserFromList(pendingUser._id);
      setSuccessMessage(data?.message || 'הבקשה נדחתה והמשתמש נמחק');
    } catch (error) {
      setUserToReject(null);

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        removeUserFromList(pendingUser._id);
      }

      setActionError(getErrorMessage(error, 'דחיית הבקשה נכשלה. נסו שוב.'));
    } finally {
      endAction();
    }
  }

  const isRejecting = Boolean(userToReject) && busyUserId === userToReject._id;

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col">
        <header className="mb-6">
          <p className="mb-2 text-2xl font-bold tracking-wide text-primary">ישיבת חדוותא</p>
          <h1 className="text-xl font-semibold text-foreground">בקשות הרשמה</h1>
          <p className="mt-1 text-sm text-muted">
            שלום {user?.firstName}, להלן התלמידים שאימתו את המייל וממתינים לאישור ההנהלה.
          </p>
        </header>

        {loadError ? (
          <div className="mb-4 flex flex-col items-start gap-3">
            <Alert>{loadError}</Alert>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadPendingUsers}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-4">
            <Alert>{actionError}</Alert>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4">
            <Alert variant="success">{successMessage}</Alert>
          </div>
        ) : null}

        {isLoading ? <p className="text-sm text-muted">טוען בקשות...</p> : null}

        {!isLoading && !loadError && users.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
            אין כרגע בקשות הממתינות לאישור.
          </p>
        ) : null}

        {!isLoading && users.length > 0 ? (
          <PendingUsersTable
            users={users}
            leavingIds={leavingIds}
            actionsDisabled={Boolean(busyUserId)}
            disabledUserId={userToReject?._id}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : null}
      </section>

      <RejectUserModal
        user={userToReject}
        isConfirming={isRejecting}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
