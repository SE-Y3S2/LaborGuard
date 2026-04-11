import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notificationApi";
import { useNotificationStore } from "@/store/notificationStore";
import { toast } from "sonner";

/**
 * useNotifications — JWT-based (no userId needed in API calls)
 * Backend extracts userId from the Bearer token automatically.
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  // Fetch all notifications
  const useGetNotifications = (params) => {
    return useQuery({
      queryKey: ["notifications", params],
      queryFn: async () => {
        const res = await notificationApi.getNotifications();
        return res.data.data || [];
      },
    });
  };

  // Fetch unread count for the notification badge
  const useGetUnreadCount = () => {
    return useQuery({
      queryKey: ["notifications-unread"],
      queryFn: async () => {
        const res = await notificationApi.getUnreadCount();
        const count = res.data.data?.count ?? res.data.data ?? 0;
        setUnreadCount(count);
        return count;
      },
      refetchInterval: 30000, // Poll every 30 seconds
    });
  };

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    },
  });

  // Update notification settings
  const updateSettingsMutation = useMutation({
    mutationFn: (data) => notificationApi.updateSettings(data),
    onSuccess: () => {
      toast.success("Notification settings updated");
    },
  });

  return {
    useGetNotifications,
    useGetUnreadCount,
    markAsRead: markAsReadMutation,
    markAllAsRead: markAllAsReadMutation,
    updateSettings: updateSettingsMutation,
  };
};
