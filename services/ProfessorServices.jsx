const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const indexProfessors = async (name = '') => {
  try {
    const url = new URL(`${BASE_URL}/professors`);
    if (name) {
      url.searchParams.append('name', name);
    }

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
    return [];
  }
};

export default { indexProfessors };
