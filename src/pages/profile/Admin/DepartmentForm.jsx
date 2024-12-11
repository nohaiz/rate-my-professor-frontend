import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import DepartmentService from "../../../../services/DepartmentService";

const DepartmentForm = ({ onCancel, onSave, courseList, editEntity }) => {
  const [name, setName] = useState(editEntity ? editEntity.name : "");
  const [courses, setCourses] = useState(
    editEntity && editEntity.courses ? editEntity.courses.map((course) => course._id) : []
  );

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    if (e.target.checked) {
      setCourses([...courses, courseId]);
    } else {
      setCourses(courses.filter((id) => id !== courseId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const departmentData = { name, courses };
      const response = editEntity
        ? await DepartmentService.updateDepartment(editEntity._id, departmentData)
        : await DepartmentService.createDepartment(departmentData);
      onSave(response.department);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (editEntity && editEntity.courses) {
      setCourses(editEntity.courses.map((course) => course._id));
    }
  }, [editEntity]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{editEntity ? "Edit Department" : "Create New Department"}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editEntity ? "Modify the department details below." : "Fill in the details to create a new department in the system."}
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
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Select a course</label>
              <div className="grid grid-cols-3 gap-4">
                {courseList.map((course) => (
                  <div key={course._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`course-${course._id}`}
                      value={course._id}
                      onChange={handleCourseChange}
                      checked={courses.includes(course._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`course-${course._id}`} className="text-sm">{course.title}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
