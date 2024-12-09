import React, { useState } from "react";
import CourseServices from "../../../../services/CourseServices";

const CourseForm = ({ onCancel, onSave, editEntity }) => {
  // Initialize state based on editEntity if it's present
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
        console.log(response.course)
        onSave(response.course); // Pass back the updated course
      } else {
        const response = await CourseServices.createCourse(courseData);
        onSave(response.course); // Pass back the newly created course
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while processing the course.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{editEntity ? "Edit Course" : "Create Course"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Course Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Credits</label>
          <input
            type="text"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

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

export default CourseForm;
