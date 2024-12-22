const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const getAllInstitutesSearchHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/searchHistory/institutes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch institutes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const addInstituteSearchHistory = async (institutionData) => {
  try {
    const response = await fetch(`${BASE_URL}/searchHistory/institutes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(institutionData)
    });

    if (!response.ok) {
      throw new Error('Failed to add institution');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteInstituteSearchHistory = async (searchText = '') => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    };

    if (!searchText) {
      throw new Error('searchText is required');
    }

    const response = await fetch(`${BASE_URL}/searchHistory/institutes`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ searchText })
    });

    if (!response.ok) {
      throw new Error('Failed to delete institution');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};


const getAllProfessorsSearchHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/searchHistory/professors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch professors');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteProfessorSearchHistory = async (searchText = '') => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    };

    if (!searchText) {
      throw new Error('searchText is required');
    }

    const response = await fetch(`${BASE_URL}/searchHistory/professors`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ searchText })
    });

    if (!response.ok) {
      throw new Error('Failed to delete professor');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const addProfessorSearchHistory = async (professorData) => {
  try {
    const response = await fetch(`${BASE_URL}/searchHistory/professors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(professorData)
    });

    if (!response.ok) {
      throw new Error('Failed to add professor');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export default { getAllInstitutesSearchHistory, addInstituteSearchHistory, deleteInstituteSearchHistory, getAllProfessorsSearchHistory, deleteProfessorSearchHistory, addProfessorSearchHistory };