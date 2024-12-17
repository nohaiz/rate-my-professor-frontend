import { json } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const indexCourses = async (page, limit) => {
  try {
    const url = new URL(`${BASE_URL}/courses`);
    const params = { page, limit };
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return json;

  } catch (error) {
    console.error("Error fetching courses:", error);
    return { course: [], totalCourse: 0, currentCourse: 1 };
  }
};

const getCourse = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/courses/${id}`);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return json;

  } catch (error) {
    console.error("Error fetching course:", error);
    return { course: null };
  }
};


const deleteCourse = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/admin/courses/${id}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return json;

  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, message: error.message };
  }
};

const createCourse = async (data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/courses`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error creating course:", error);
  }
};

const updateCourse = async (id, data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/courses/${id}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };

    }
    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error updating course:", error);
  }
};

export default { indexCourses, getCourse, deleteCourse, createCourse, updateCourse };
