
import React, { createContext, useContext, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  isVisible: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (notification: Omit<Notification, 'id' | 'isVisible'>) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (notificationData: Omit<Notification, 'id' | 'isVisible'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotification({
      ...notificationData,
      id,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{
      notification,
      showNotification,
      hideNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
