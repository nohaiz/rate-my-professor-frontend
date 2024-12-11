import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

import CourseServices from "../../../../services/CourseServices";

const CourseForm = ({ onCancel, onSave, editEntity }) => {
  const [title, setTitle] = useState(editEntity ? editEntity.title : "");
  const [code, setCode] = useState(editEntity ? editEntity.code : "");
  const [credits, setCredits] = useState(editEntity ? editEntity.credits : 0);

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const courseData = { title, code, credits };
      if (editEntity) {
        const response = await CourseServices.updateCourse(editEntity._id, courseData);
        onSave(response.course);
      } else {
        const response = await CourseServices.createCourse(courseData);
        onSave(response.course);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while processing the course.");
    }
  };

  const renderInputField = (label, value, setValue, type = 'text') => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
        required
      />
      {errorMessage && (
        <div className="text-xs font-medium text-red-500 mt-1">{errorMessage}</div>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{editEntity ? "Edit Course" : "Create New Course"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{editEntity
              ? "Modify the course details below."
              : "Fill in the details to create a new course in the system."}
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
            {renderInputField("Course Title", title, setTitle)}
            {renderInputField("Course Code", code, setCode)}
            {renderInputField("Credits", credits, setCredits)}

            <div className="flex justify-between mt-6">
              <button
                type="submit"
                className="py-2 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CourseForm;
