const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const createReviewReport = async (professorId, reviewId, reportReason, category) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/${professorId}/review/${reviewId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ reportReason, category }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse;

  } catch (error) {
    console.error('Network Error:', error);
  }
};

const getReviewReport = async (id) => {
  try {
    const response = await fetch(`/review/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
    } else {
      const error = await response.json();
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};

const getAllReviewReports = async () => {
  try {
    const response = await fetch('/review', {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
    } else {
      const error = await response.json();
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};

const deleteReviewReport = async (id) => {
  try {
    const response = await fetch(`/review/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
    } else {
      const error = await response.json();
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};

export default {
  createReviewReport,
  getReviewReport,
  getAllReviewReports,
  deleteReviewReport,
};
