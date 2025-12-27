import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function useWatch() {
  const queryClient = useQueryClient();
  const isFirstConnection = useRef(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isClosed = false;

    function connect() {
      if (isClosed) return;

      eventSource = new EventSource("/api/watch");

      eventSource.onopen = () => {
        if (!isFirstConnection.current) {
          // Reconnected - invalidate all queries
          queryClient.invalidateQueries();
        }
        isFirstConnection.current = false;
      };

      eventSource.onmessage = () => {
        queryClient.invalidateQueries();
      };

      eventSource.onerror = () => {
        eventSource?.close();
        // Reconnect after 1 second
        if (!isClosed) {
          reconnectTimeout = setTimeout(connect, 1000);
        }
      };
    }

    connect();

    return () => {
      isClosed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
    };
  }, [queryClient]);
}
