const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const indexUsers = async (page, limit) => {
  try {
    const url = new URL(`${BASE_URL}/admin/users`);
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
    console.error("Error fetching users:", error);
    return { users: [], totalUsers: 0, currentPage: page };
  }
};

const createUser = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...formData
      }),
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
    console.error("Error creating user:", error);
    return { error: error.message };
  }
};

const getUser = async (userId) => {
  try {
    const url = new URL(`${BASE_URL}/admin/users/${userId}`);

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
    console.error("Error fetching user:", error);
    return { error: error.message };
  }
};

const editUser = async (userId, formData) => {
  try {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...formData
      }),
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
    console.error("Error editing user:", error);
    return { error: error.message };
  }
};

const deleteUser = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
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
    console.error("Error deleting user:", error);
    return { error: error.message };
  }
};



export default { indexUsers, createUser, getUser, editUser, deleteUser };
