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

// New createDepartment function
const createDepartment = async (data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/departments`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),  // Data to create the new department
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
    console.error("Error creating department:", error);
    return { success: false, message: error.message };
  }
};

// New updateDepartment function
const updateDepartment = async (id, data) => {
  try {
    const url = new URL(`${BASE_URL}/admin/departments/${id}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),  // Data to update the existing department
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
    console.error("Error updating department:", error);
    return { success: false, message: error.message };
  }
};

export default { indexDepartments, deleteDepartment, createDepartment, updateDepartment };
