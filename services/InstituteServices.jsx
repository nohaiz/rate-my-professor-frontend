const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const indexInstitutes = async (page, limit, name = '') => {
  try {
    const url = new URL(`${BASE_URL}/institutes`);
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
      throw new Error(`Request failed with status ${res.status}`);
    }

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }

    return json;

  } catch (error) {
    console.error("Error fetching institutes:", error);
    return { institution: [], totalInstitution: 0, currentInstitution: 1 };
  }
};

const getInstitute = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/institutes/${id}`);

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
    console.error("Error fetching institute:", error);
    return { institute: null };
  }
};

const deleteInstitute = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/admin/institutes/${id}`);

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
    console.error("Error deleting institute:", error);
    return { success: false, message: error.message };
  }
};

const createInstitute = async (data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/institutes`);

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
    console.error("Error creating institute:", error);
  }
};

const updateInstitute = async (id, data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/institutes/${id}`);

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
    console.error("Error updating institute:", error);
  }
};

export default { indexInstitutes, getInstitute, deleteInstitute, createInstitute, updateInstitute };
