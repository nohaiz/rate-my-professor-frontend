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

export default { indexDepartments };
