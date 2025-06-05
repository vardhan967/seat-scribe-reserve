
import { useNotification } from '@/contexts/NotificationContext';

const NotificationModal = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification || !notification.isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <i className="fas fa-check-circle text-4xl text-success"></i>;
      case 'info':
        return <i className="fas fa-info-circle text-4xl text-primary"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-4xl text-warning"></i>;
      case 'error':
        return <i className="fas fa-times-circle text-4xl text-destructive"></i>;
      default:
        return <i className="fas fa-info-circle text-4xl text-primary"></i>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
          <button
            onClick={hideNotification}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            {getIcon()}
            <div className="flex-1">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: notification.message }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            {notification.actionButton && (
              <button
                onClick={() => {
                  notification.actionButton?.onClick();
                  hideNotification();
                }}
                className="btn-primary"
              >
                {notification.actionButton.label}
              </button>
            )}
            <button
              onClick={hideNotification}
              className="btn-secondary"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
