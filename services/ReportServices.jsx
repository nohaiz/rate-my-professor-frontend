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

const getAllReviewReports = async (page, limit) => {

  try {

    const url = new URL(`${BASE_URL}/reports/review/`);
    const params = { page, limit };
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error('Network Error:', error);
    return { reports: [], totalReports: 0, currentPage: 1 };

  }
};

const deleteReviewReport = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error('Network Error:', error);
  }
};

const updateReviewReport = async (reportId, reportData) => {

  try {
    const res = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(reportData),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;


  } catch (error) {
    console.error('Network Error:', error);
  }
};


export default {
  createReviewReport,
  getAllReviewReports,
  deleteReviewReport,
  updateReviewReport,
};
