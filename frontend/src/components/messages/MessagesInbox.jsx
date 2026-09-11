'use client';

import { useEffect, useRef, useState } from 'react';
import MessagesList from '@/components/messages/MessagesList';
import { getMessages } from '@/lib/api/messages';
import { ApiError, getErrorMessage } from '@/lib/api/client';

export default function MessagesInbox({ reloadKey = 0 }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    loadInbox();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [reloadKey]);

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
    <MessagesList
      messages={messages}
      isLoading={isLoading}
      loadError={loadError}
      onRetry={loadInbox}
    />
  );
}
