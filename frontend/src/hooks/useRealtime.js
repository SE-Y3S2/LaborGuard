import { useEffect, useCallback } from 'react';
import { Centrifuge } from 'centrifuge';
import { useQueryClient } from '@tanstack/react-query';
import { useMessagingStore } from '@/store/messagingStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  const { setCentrifugoClient, activeConversationId, addMessage } = useMessagingStore();
  const { incrementUnread } = useNotificationStore();

  const handleNewMessage = useCallback((payload) => {
    const { conversationId, message } = payload;
    
    // Update messaging store (conversations list)
    addMessage(conversationId, message);
    
    // Update TanStack Query cache for messages in the active conversation
    if (conversationId === activeConversationId) {
      queryClient.setQueryData(['messages', conversationId], (oldData) => {
        if (!oldData) return [message];
        // Check if message already exists to avoid duplicates
        if (oldData.find(m => m._id === message._id)) return oldData;
        return [...oldData, message];
      });
    }
  }, [activeConversationId, addMessage, queryClient]);

  const handleNotification = useCallback((payload) => {
    // Only increment if it's for the current user
    if (payload.userId === user?.userId) {
      incrementUnread();
      queryClient.invalidateQueries(['notifications-unread', user?.userId]);
    }
  }, [user?.userId, incrementUnread, queryClient]);

  useEffect(() => {
    if (!accessToken || !user) return;

    const centrifuge = new Centrifuge(import.meta.env.VITE_CENTRIFUGO_URL, {
        token: accessToken
    });

    centrifuge.on('connected', () => {
        console.log('Centrifugo connected');
    });

    centrifuge.on('disconnected', () => {
        console.log('Centrifugo disconnected');
    });

    // Subscribe to personal notification channel
    const subNotification = centrifuge.newSubscription(`notifications#${user.userId}`);
    subNotification.on('publication', (ctx) => {
        handleNotification(ctx.data);
    });
    subNotification.subscribe();

    // Subscribe to active conversation channel if exists
    let subChat = null;
    if (activeConversationId) {
        subChat = centrifuge.newSubscription(`chat#${activeConversationId}`);
        subChat.on('publication', (ctx) => {
            handleNewMessage({ conversationId: activeConversationId, message: ctx.data });
        });
        subChat.subscribe();
    }

    centrifuge.connect();
    setCentrifugoClient(centrifuge);

    return () => {
        subNotification.unsubscribe();
        if (subChat) subChat.unsubscribe();
        centrifuge.disconnect();
    };
  }, [user, accessToken, activeConversationId, handleNewMessage, handleNotification, setCentrifugoClient]);
};
