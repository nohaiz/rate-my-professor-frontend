const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const indexDepartments = async (page, limit) => {
  try {
    const url = new URL(`${BASE_URL}/departments`);
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
    console.error("Error fetching departments:", error);
    return { department: [], totalDepartment: 0, currentDepartment: 1 };
  }
};

const deleteDepartment = async (id) => {
  try {
    const url = new URL(`${BASE_URL}/admin/departments/${id}`);

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
    console.error("Error deleting department:", error);
    return { success: false, message: error.message };
  }
};

const createDepartment = async (data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/departments`);

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
    console.error("Error creating department:", error);
  }
};

const updateDepartment = async (id, data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/departments/${id}`);

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
    console.error("Error updating department:", error);
  }
};

export default { indexDepartments, deleteDepartment, createDepartment, updateDepartment };
