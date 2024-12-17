import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Select from "react-select";
import InstituteServices from "../../../../services/InstituteServices";

const InstituteForm = ({ onCancel, onSave, deptList, editEntity }) => {
  const [name, setName] = useState(editEntity ? editEntity.name : "");
  const [location, setLocation] = useState(editEntity ? editEntity.location : "");
  const [type, setType] = useState(editEntity ? editEntity.type : "");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState(editEntity && editEntity.departments ? editEntity.departments.map((department) => ({
    value: department._id,
    label: department.name,
  }))
    : []
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const departmentOptions = deptList.map((dept) => ({
      value: dept._id,
      label: dept.name,
    }));
    setDepartments(departmentOptions);
  }, [deptList]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let isValid = true;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Institute name is required.";
      isValid = false;
    } else if (name.length < 3 || name.length > 50) {
      newErrors.name = "Institute name must be between 3 and 50 characters.";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      newErrors.name = "Institute name can only contain letters and spaces.";
      isValid = false;
    }

    if (!location.trim()) {
      newErrors.location = "Location is required.";
      isValid = false;
    } else if (location.length < 3 || location.length > 50) {
      newErrors.location = "Location must be between 3 and 50 characters.";
      isValid = false;
    } else if (!/^[a-zA-Z\s,]+$/.test(location)) {
      newErrors.location = "Location can only contain letters, spaces, and commas.";
      isValid = false;
    }

    if (!type) {
      newErrors.type = "Institute type is required.";
      isValid = false;
    } else if (!["University", "College", "Community College", "Other"].includes(type)) {
      newErrors.type = "Invalid institute type.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    const institutionData = {
      name,
      location,
      type,
      departments: selectedDepartments.map(department => department.value),
    };

    try {
      const response = editEntity
        ? await InstituteServices.updateInstitute(editEntity._id, institutionData)
        : await InstituteServices.createInstitute(institutionData);

      if (response && response.status === 500) {
        setErrors({ general: "An error occurred. Please try again later." });
      }
      else if (response && response.status === 400) {
        newErrors.name = response.error;
        setErrors(newErrors);
      }
      else {
        onSave(response.institution);
      }
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editEntity ? "Edit Institute" : "Create New Institute"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editEntity
                ? "Modify the institute details below."
                : "Fill in the details to create a new institute in the system."}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-0"
          >
            <AiOutlineClose className="mr-6" />
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
            />
            {errors.name && <div className="text-xs font-medium text-red-500 mt-1">{errors.name}</div>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.location && <div className="text-xs font-medium text-red-500 mt-1">{errors.location}</div>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Institute Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Type</option>
              <option value="University">University</option>
              <option value="College">College</option>
              <option value="Community College">Community College</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && <div className="text-xs font-medium text-red-500 mt-1">{errors.type}</div>}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-900">Select Departments (Optional)</label>
            <Select
              isMulti
              options={departments}
              value={selectedDepartments}
              onChange={setSelectedDepartments}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select departments..."
            />
            {errors.departments && (
              <div className="text-xs font-medium text-red-500 mt-1">{errors.departments}</div>
            )}
          </div>

          {errors.general && <div className="text-red-500 text-sm mb-4">{errors.general}</div>}

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InstituteForm;
