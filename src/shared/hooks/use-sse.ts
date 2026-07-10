'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/shared/components/toast';

type SSEEvent = {
  event: string;
  data: Record<string, unknown>;
};

type UseSSEOptions = {
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
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    const es = new EventSource('/api/notifications/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      reconnectAttempts.current = 0;
      options.onConnect?.();
    };

    es.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data);
        options.onNotification?.(data);
        // Default: show toast
        toast('info', data.title || 'Уведомление');
      } catch {}
    });

    es.addEventListener('unread_count', (e) => {
      try {
        const data = JSON.parse(e.data);
        options.onUnreadCount?.(data.count);
      } catch {}
    });

    es.addEventListener('moderation_needed', (e) => {
      try {
        const data = JSON.parse(e.data);
        options.onModerationNeeded?.(data);
        toast('warning', `Новый ЧИ на модерации: ${data.title || ''}`);
      } catch {}
    });

    es.addEventListener('heartbeat', () => {});

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      options.onDisconnect?.();

      // Reconnect with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };
  }, [options, toast]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return {
    disconnect: () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    },
  };
}
