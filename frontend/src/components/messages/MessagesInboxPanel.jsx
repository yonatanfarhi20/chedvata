'use client';

import { useEffect, useRef, useState } from 'react';
import MessageCard from '@/components/messages/MessageCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getMessages } from '@/lib/api/messages';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { getMessageId } from '@/lib/messages';

export default function MessagesInboxPanel() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    loadInbox();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, []);

  async function loadInbox() {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await getMessages();

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        return;
      }

      setMessages([]);
      setLoadError(getErrorMessage(error, 'לא ניתן לטעון את תיבת ההודעות.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">הודעות</h1>
          <p className="mt-1 text-sm text-muted">
            הודעות שנשלחו אליכם אישית, לשיעור שלכם, או לכל הישיבה.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadError ? (
            <div className="mb-4 flex flex-col items-start gap-3">
              <Alert>{loadError}</Alert>
              <Button type="button" variant="secondary" fullWidth={false} onClick={loadInbox}>
                נסה שוב
              </Button>
            </div>
          ) : null}

          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Spinner />
              טוען הודעות...
            </p>
          ) : null}

          {!isLoading && !loadError && messages.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
              אין הודעות בתיבה.
            </p>
          ) : null}

          {!isLoading && messages.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {messages.map((message) => (
                <li key={getMessageId(message) || message.subject}>
                  <MessageCard message={message} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
