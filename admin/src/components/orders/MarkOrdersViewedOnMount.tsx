"use client";

import { useEffect } from "react";
import { useAdminNotifications } from "@/components/layout/AdminNotificationsProvider";
import type { MarkOrdersViewedGroup } from "@/lib/orders/notifications";

type MarkOrdersViewedOnMountProps = {
  group: MarkOrdersViewedGroup;
};

export function MarkOrdersViewedOnMount({ group }: MarkOrdersViewedOnMountProps) {
  const { markViewed } = useAdminNotifications();

  useEffect(() => {
    void markViewed(group);
  }, [group, markViewed]);

  return null;
}
