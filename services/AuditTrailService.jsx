const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const getAllAuditTrails = async () => {
  try {
    const url = new URL(`${BASE_URL}/admin/audit-trails`);
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
    console.error("Error fetching audit trails:", error);
    return { error: "Failed to fetch audit trails" };
  }
};

const getAuditTrailsByCollection = async (collectionName) => {
  try {
    const url = new URL(`${BASE_URL}/admin/audit-trails/${collectionName}`);
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
    console.error(`Error fetching audit trails for ${collectionName}:`, error);
    return { error: `Failed to fetch audit trails for ${collectionName}` };
  }
};

const deleteAuditTrail = async (auditTrailId) => {
  try {
    const url = new URL(`${BASE_URL}/admin/audit-trails/${auditTrailId}`);
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
    console.error(`Error deleting audit trail with ID ${auditTrailId}:`, error);
    return { error: `Failed to delete audit trail with ID ${auditTrailId}` };
  }
};

export default {
  getAllAuditTrails,
  getAuditTrailsByCollection,
  deleteAuditTrail
};
