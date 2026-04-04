import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notificationApi";
import { useNotificationStore } from "@/store/notificationStore";
import { toast } from "sonner";

export const useNotifications = (userId) => {
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  // Fetch all notifications with optional params
  const useGetNotifications = (params) => {
    return useQuery({
      queryKey: ["notifications", userId, params],
      queryFn: async () => {
        const res = await notificationApi.getNotifications(userId, params);
        return res.data.data || [];
      },
      enabled: !!userId,
    });
  };

  // Fetch unread count for the notification badge
  const useGetUnreadCount = () => {
    return useQuery({
      queryKey: ["notifications-unread", userId],
      queryFn: async () => {
        const res = await notificationApi.getUnreadCount(userId);
        const count = res.data.data || 0;
        setUnreadCount(count);
        return count;
      },
      enabled: !!userId,
      refetchInterval: 30000, // Poll every 30 seconds
    });
  };

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", userId]);
      queryClient.invalidateQueries(["notifications-unread", userId]);
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", userId]);
      queryClient.invalidateQueries(["notifications-unread", userId]);
      toast.success("All notifications marked as read");
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", userId]);
      queryClient.invalidateQueries(["notifications-unread", userId]);
    },
  });

  return {
    useGetNotifications,
    useGetUnreadCount,
    markAsRead: markAsReadMutation,
    markAllAsRead: markAllAsReadMutation,
    deleteNotification: deleteNotificationMutation,
  };
};
