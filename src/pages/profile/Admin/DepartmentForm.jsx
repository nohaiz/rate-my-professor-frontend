import React, { useState, useEffect } from "react";
import DepartmentService from "../../../../services/DepartmentService";

const DepartmentForm = ({ onCancel, onSave, courseList, editEntity }) => {
  const [name, setName] = useState(editEntity ? editEntity.name : "");
  const [courses, setCourses] = useState(
    editEntity && editEntity.courses ? editEntity.courses.map((course) => course._id) : []
  );

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    if (e.target.checked) {
      setCourses([...courses, courseId]); // Add course ID to selected courses
    } else {
      setCourses(courses.filter((id) => id !== courseId)); // Remove course ID from selected courses
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    try {
      const departmentData = { name, courses };
      const response = editEntity
        ? await DepartmentService.updateDepartment(editEntity._id, departmentData) // Update if in edit mode
        : await DepartmentService.createDepartment(departmentData); // Create if in create mode
      onSave(response.department); // Call onSave with the updated department
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (editEntity && editEntity.courses) {
      setCourses(editEntity.courses.map((course) => course._id)); // Sync courses if editEntity changes
    }
  }, [editEntity]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{editEntity ? "Edit Department" : "Create Department"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Department Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Courses</label>
          <div className="space-y-2">
            {courseList.map((course) => (
              <div key={course._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`course-${course._id}`}
                  value={course._id}
                  onChange={handleCourseChange}
                  checked={courses.includes(course._id)} // Check if course is selected
                  className="mr-2"
                />
                <label htmlFor={`course-${course._id}`} className="text-sm">{course.title}</label>
              </div>
            ))}
          </div>
        </div>

        {courses.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium">Selected Courses:</p>
            <div className="flex flex-wrap gap-2">
              {courses.map((courseId) => {
                const course = courseList.find((c) => c._id === courseId);
                return (
                  <span key={courseId} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm">
                    {course?.title}
                  </span>
                );
              })}
            </div>
          </div>
        )}

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

export default DepartmentForm;
