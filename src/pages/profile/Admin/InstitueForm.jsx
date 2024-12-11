import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import InstituteServices from "../../../../services/InstituteServices";

const InstituteForm = ({ onCancel, onSave, deptList, editEntity }) => {
  const [name, setName] = useState(editEntity ? editEntity.name : "");
  const [location, setLocation] = useState(editEntity ? editEntity.location : "");
  const [type, setType] = useState(editEntity ? editEntity.type : "");

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

  useEffect(() => {
    if (editEntity && editEntity.departments) {
      setDepartments(editEntity.departments.map((dept) => dept._id));
    }
  }, [editEntity]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{editEntity ? "Edit Institute" : "Create New Institute"}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editEntity ? "Modify the institute details below." : "Fill in the details to create a new institute in the system."}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-0"
          >
            <AiOutlineClose className="mr-2" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Institute Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Institute Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <label className="block text-sm font-medium text-gray-900">Select a department</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {deptList.map((dept) => (
                <div key={dept._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={dept._id}
                    value={dept._id}
                    onChange={handleDepartmentChange}
                    checked={departments.includes(dept._id)}
                    className="mr-2"
                  />
                  <label htmlFor={dept._id} className="text-sm text-gray-900">{dept.name}</label>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}

          <div className="flex justify-between mt-6">
            <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full">
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InstituteForm;
