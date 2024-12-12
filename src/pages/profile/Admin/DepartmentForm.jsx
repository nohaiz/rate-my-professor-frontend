import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Select from "react-select";
import DepartmentService from "../../../../services/DepartmentService";

const DepartmentForm = ({ onCancel, onSave, courseList, editEntity }) => {
  const [name, setName] = useState(editEntity ? editEntity.name : "");
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(
    editEntity && editEntity.courses
      ? editEntity.courses.map((course) => ({
        value: course._id,
        label: course.title,
      }))
      : []
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const courseOptions = courseList.map((course) => ({
      value: course._id,
      label: course.title,
    }));
    setCourses(courseOptions);
  }, [courseList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let isValid = true;
    const newErrors = {};

    if (name.trim() === "") {
      isValid = false;
      newErrors.name = "Please enter a department name.";
    } else if (name.length < 3) {
      isValid = false;
      newErrors.name = "Department name must be at least 3 characters long.";
    } else if (name.length > 50) {
      isValid = false;
      newErrors.name = "Department name cannot exceed 50 characters.";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      isValid = false;
      newErrors.name = "Department name can only contain letters and spaces.";
    }
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    const departmentData = {
      name,
      courses: selectedCourses.map(course => course.value),
    };

    try {
      const response = editEntity
        ? await DepartmentService.updateDepartment(editEntity._id, departmentData)
        : await DepartmentService.createDepartment(departmentData);

      if (response && response.status === 500) {
        newErrors.generalError = "An error occurred. Please try again later.";
        setErrors(newErrors);
      } else if (response && response.status === 400) {
        newErrors.name = response.error;
        setErrors(newErrors);
      } else {
        onSave(response.department);
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
              {editEntity ? "Edit Department" : "Create New Department"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editEntity
                ? "Modify the department details below."
                : "Fill in the details to create a new department in the system."}
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
          <div className="space-y-5">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Department Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.name && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.name}</div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Select Courses (Optional)</label>
              <Select
                isMulti
                options={courses}
                value={selectedCourses}
                onChange={setSelectedCourses}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select courses..."
              />
              {errors.courses && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.courses}</div>
              )}
            </div>
          </div>

          {errors.generalError && (
            <div className="text-xs font-medium text-red-500 mt-1">{errors.generalError}</div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="py-2 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DepartmentForm;
