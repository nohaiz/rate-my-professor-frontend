const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const getUserNotifications = async () => {
  try {
    const url = new URL(`${BASE_URL}/notifications`);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    const url = new URL(`${BASE_URL}/notifications/${notificationId}/read`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { status: 500, error: "Error marking notification as read" };
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const url = new URL(`${BASE_URL}/notifications/${notificationId}`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error deleting notification:", error);
    return { status: 500, error: "Error deleting notification" };
  }
};


export default { getUserNotifications, markNotificationAsRead, deleteNotification };
