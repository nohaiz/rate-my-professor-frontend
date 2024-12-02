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

export default { indexInstitutes };
