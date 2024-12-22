const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const indexProfessors = async (page, limit, name = '') => {
  try {
    const url = new URL(`${BASE_URL}/professors`);
    const params = { page, limit, name };
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
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error fetching professors:", error);
    return { professorsData: [], totalProfessors: 0 };
  }
};

const getProfessor = async (professorId) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${professorId}`);
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
    console.error("Error fetching professors:", error);
    return { professorsData: [], totalProfessors: 0 };
  }
};

const addProfessorCourse = async (id, institution, selectedCourse) => {
  try {
    const res = await fetch(`${BASE_URL}/professors/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ institution, selectedCourse }),
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
    console.error("Error updating professor's course:", error);
    return { message: "Failed to update professor's course" };
  }
};

const removeProfessorCourse = async (id, institution, selectedDepartment, selectedCourse) => {
  try {
    const res = await fetch(`${BASE_URL}/professors/${id}/remove-course`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ institution, selectedDepartment, selectedCourse }),
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
    console.error("Error removing professor's course:", error);
    return { message: "Failed to remove professor from the course" };
  }
};

const addProfessorToBookmarks = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/professors/${id}/bookmark`, {
      method: 'PUT',
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
    console.error("Error bookmarking professor:", error);
    return { message: "Failed to bookmark professor" };
  }
};

const removeProfessorFromBookmarks = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/professors/${id}/bookmark`, {
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
    console.error("Error bookmarking professor:", error);
    return { message: "Failed to bookmark professor" };
  }
};

const createProfessorReview = async (id, formData) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${id}/review`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error creating institute:", error);
  }
}

const updateProfessorReview = async (id, reviewId, formData) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${id}/review/${reviewId}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',

      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error updating review:", error);
  }
};

const deleteProfessorReview = async (id, reviewId) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${id}/review/${reviewId}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error deleting review:", error);
    return { message: "Failed to delete review" };
  }
};

const addProfessorComment = async (id, reviewId, comment) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${id}/reviews/${reviewId}/comments`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error updating review:", error);
  }
}

const updateProfessorComment = async (id, reviewId, commentId, updatedComment) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${id}/reviews/${reviewId}/comments/${commentId}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: updatedComment }),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error updating comment:", error);
    return { message: "Failed to update comment" };
  }
};

const removeProfessorComment = async (id, reviewId, commentId) => {
  try {
    const url = new URL(`${BASE_URL}/professors/${id}/reviews/${reviewId}/comments/${commentId}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      return { status: res.status, error: errorResponse.error || `Error ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Error removing comment:", error);
  }
};



export default { indexProfessors, getProfessor, addProfessorCourse, removeProfessorCourse, addProfessorToBookmarks, removeProfessorFromBookmarks, createProfessorReview, updateProfessorReview, deleteProfessorReview, addProfessorComment, updateProfessorComment, removeProfessorComment };
