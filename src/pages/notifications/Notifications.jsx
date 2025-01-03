import { useEffect } from "react";
import NotificationService from "../../../services/NotificationService";

const Notification = ({ user, setUnreadCount, fetchNotifications, notifications, setNotifications }) => {

  useEffect(() => {
    fetchNotifications();
  }, [user.Id]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prevUnreadCount => prevUnreadCount - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
      setUnreadCount(prevUnreadCount => prevUnreadCount - 1);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-center text-red-500 text-sm">No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg ${notification.isRead ? "bg-gray-100" : "bg-gray-100"}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notification:</h3>
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${notification.isRead ? "text-gray-500 cursor-default" : "text-green-600 hover:cursor-pointer"}`}
                  >
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                  <p>{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-800">{notification.message}</p>

              {notification.referenceModel === "Report" && notification.reference && (
                <div className="mt-2 border-t border-gray-300 pt-2 space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Report Details:</h4>
                  <p className="text-sm text-gray-600">Report Reason: {notification.reference.reportReason}</p>
                  <h4 className="text-sm font-medium text-gray-900">Category:</h4>
                  <p className="text-sm text-gray-600">
                    {notification.reference.category
                      .replace(/^\s*-+\s*/, '')
                      .replace(/-/g, ' ')
                      .replace(/^./, (char) => char.toUpperCase())
                    }
                  </p>

                  <h4 className="text-sm font-medium text-gray-900">Regarding your review for this professor:</h4>
                  <p className="text-sm text-gray-600">
                    {notification.reference.professorId?.firstName} {notification.reference.professorId?.lastName}
                  </p>
                </div>
              )}

              {notification.referenceModel === "Review" && notification.reference && (
                <div className="mt-2 border-t border-gray-300 pt-2 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Review Details:</h4>
                  <p className="text-sm text-gray-600">{notification.reference.text}</p>
                  <p className="text-sm font-medium text-gray-700">Rating: {notification.reference.rating}/5</p>
                </div>
              )}

              {notification.referenceModel === "Comment" && notification.reference && (
                <div className="mt-2 border-t border-gray-300 pt-2 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Comment Details:</h4>
                  <p className="text-sm text-gray-600">{notification.reference.text}</p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(notification._id);
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-700 flex ml-auto"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
