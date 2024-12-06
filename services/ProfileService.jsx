const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const getProfile = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/profile/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};

const updateProfile = async (formdata, id) => {
  try {
    const response = await fetch(`${BASE_URL}/profile/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formdata)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    const json = await response.json();

    return json;
  } catch (error) {
    console.error(error);
  }
};

export default { getProfile, updateProfile }
