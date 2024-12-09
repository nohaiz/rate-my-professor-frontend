import React, { useState, useEffect } from "react";
import InstituteServices from "../../../../services/InstituteServices";
import DepartmentService from "../../../../services/DepartmentService";

const InstituteForm = ({ onCancel, onSave, deptList, editEntity }) => {
  // Initialize state based on editEntity, extracting department IDs from editEntity
  const [name, setName] = useState(editEntity ? editEntity.name : "");
  const [location, setLocation] = useState(editEntity ? editEntity.location : "");
  const [type, setType] = useState(editEntity ? editEntity.type : "");

  // Extract department IDs from editEntity
  const [departments, setDepartments] = useState(
    editEntity && editEntity.departments ? editEntity.departments.map((dept) => dept._id) : []
  );

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const institutionData = { name, location, type, departments };
      if (editEntity) {
        const response = await InstituteServices.updateInstitute(editEntity._id, institutionData);
        onSave(response.institution);

      } else {
        const response = await InstituteServices.createInstitute(institutionData);
        onSave(response.institution);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while processing the institution.");
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    if (e.target.checked) {
      setDepartments([...departments, departmentId]);
    } else {
      setDepartments(departments.filter((id) => id !== departmentId));
    }
  };

  // Sync departments when editEntity changes
  useEffect(() => {
    if (editEntity && editEntity.departments) {
      setDepartments(editEntity.departments.map((dept) => dept._id)); // Ensure we're setting only department IDs
    }
  }, [editEntity]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{editEntity ? "Edit Institute" : "Create Institute"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Institute Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Institute Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          >
            <option value="">Select Type</option>
            <option value="University">University</option>
            <option value="College">College</option>
            <option value="Community College">Community College</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Departments</label>
          <div className="space-y-2">
            {deptList.map((dept) => (
              <div key={dept._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={dept._id}
                  value={dept._id}
                  onChange={handleDepartmentChange}
                  checked={departments.includes(dept._id)} // Check if department ID is in selected departments
                  className="mr-2"
                />
                <label htmlFor={dept._id} className="text-sm">{dept.name}</label>
              </div>
            ))}
          </div>
        </div>

        {departments.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium">Selected Departments:</p>
            <div className="flex flex-wrap gap-2">
              {departments.map((deptId) => {
                const dept = deptList.find((d) => d._id === deptId);
                return (
                  <span key={deptId} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm">
                    {dept?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {errorMessage && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}

        <div className="flex justify-between mt-6">
          <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 py-2 px-6 rounded border border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstituteForm;
