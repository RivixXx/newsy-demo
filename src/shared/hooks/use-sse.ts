'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/shared/components/toast';

type UseSSEOptions = {
  enabled?: boolean;
  onNotification?: (data: Record<string, unknown>) => void;
  onUnreadCount?: (count: number) => void;
  onModerationNeeded?: (data: Record<string, unknown>) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

export function useSSE(options: UseSSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const optionsRef = useRef(options);
  const { toast } = useToast();
  optionsRef.current = options;

  useEffect(() => {
    if (!options.enabled) return;

    let disposed = false;

    const connect = () => {
      if (disposed || eventSourceRef.current) return;

      const es = new EventSource('/api/notifications/stream');
      eventSourceRef.current = es;

      es.onopen = () => {
        reconnectAttempts.current = 0;
        optionsRef.current.onConnect?.();
      };

    es.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current.onNotification?.(data);
        // Default: show toast
        toast('info', data.title || 'Уведомление');
      } catch {}
    });

    es.addEventListener('unread_count', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current.onUnreadCount?.(data.count);
      } catch {}
    });

    es.addEventListener('moderation_needed', (e) => {
      try {
        const data = JSON.parse(e.data);
        optionsRef.current.onModerationNeeded?.(data);
        toast('warning', `Новый ЧИ на модерации: ${data.title || ''}`);
      } catch {}
    });

    es.addEventListener('heartbeat', () => {});

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      optionsRef.current.onDisconnect?.();

      if (disposed) return;

      // EventSource does not expose the HTTP status. Limit retries so an
      // expired session cannot create an endless series of 401 requests.
      if (reconnectAttempts.current >= 5) return;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };
    };

    connect();
    return () => {
      disposed = true;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
      reconnectAttempts.current = 0;
    };
  }, [options.enabled, toast]);

  return {
    disconnect: () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    },
  };
}
