"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAdminOrderNotifications,
  markOrdersViewed as markOrdersViewedRequest,
} from "@/lib/orders/notificationsClient";
import type {
  AdminOrderNotifications,
  MarkOrdersViewedGroup,
} from "@/lib/orders/notifications";

type AdminNotificationsContextValue = {
  counts: AdminOrderNotifications;
  loading: boolean;
  refreshCounts: () => Promise<void>;
  markViewed: (group: MarkOrdersViewedGroup) => Promise<void>;
};

const emptyCounts: AdminOrderNotifications = {
  newActiveOrders: 0,
  newCustomCakeRequests: 0,
};

const AdminNotificationsContext =
  createContext<AdminNotificationsContextValue | null>(null);

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<AdminOrderNotifications>(emptyCounts);
  const [loading, setLoading] = useState(true);

  const refreshCounts = useCallback(async () => {
    try {
      const next = await fetchAdminOrderNotifications();
      setCounts(next);
    } catch {
      setCounts(emptyCounts);
    } finally {
      setLoading(false);
    }
  }, []);

  const markViewed = useCallback(async (group: MarkOrdersViewedGroup) => {
    const next = await markOrdersViewedRequest(group);
    setCounts(next);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshCounts();
    }, 0);
    const interval = window.setInterval(() => {
      void refreshCounts();
    }, 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [refreshCounts]);

  const value = useMemo(
    () => ({ counts, loading, refreshCounts, markViewed }),
    [counts, loading, refreshCounts, markViewed],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications(): AdminNotificationsContextValue {
  const context = useContext(AdminNotificationsContext);
  if (!context) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationsProvider",
    );
  }
  return context;
}
