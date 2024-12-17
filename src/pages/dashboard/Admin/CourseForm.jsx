import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

import CourseServices from "../../../../services/CourseServices";
import ProfessorServices from "../../../../services/ProfessorServices";
import Select from "react-select";

const CourseForm = ({ onCancel, onSave, editEntity }) => {
  const [title, setTitle] = useState(editEntity ? editEntity.title : "");
  const [code, setCode] = useState(editEntity ? editEntity.code : "");
  const [credits, setCredits] = useState(editEntity ? editEntity.credits : 0);
  const [professors, setProfessors] = useState([]);
  const [selectedProfessors, setSelectedProfessors] = useState(editEntity && editEntity.professors ? editEntity.professors.map((professor) => ({
    value: professor._id,
    label: `${professor.firstName} ${professor.lastName}`,
  }))
    : []
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const response = await ProfessorServices.indexProfessors();
        setProfessors(
          response.professorsData.map((professor) => ({
            value: professor._id,
            label: `${professor.firstName} ${professor.lastName}`,
          }))
        );
      } catch (err) {
        console.error("Error fetching professors:", err);
      }
    };
    fetchProfessor();
  }, []);

  useEffect(() => {
    const fetchFilteredProfessors = async () => {
      try {
        const allProfessors = await ProfessorServices.indexProfessors();

        if (selectedProfessors.length === 0) {
          setProfessors(
            allProfessors.professorsData.map((professor) => ({
              value: professor._id,
              label: `${professor.firstName} ${professor.lastName}`,
            }))
          );
          return;
        }

        const institutionIds = await Promise.all(
          selectedProfessors.map(async (selected) => {
            if (selected?.value) {
              try {
                const professor = await ProfessorServices.getProfessor(selected.value);
                return professor?.professerData?.institution._id;
              } catch (error) {
                console.error(`Failed to fetch professor with ID ${selected.value}:`, error);
                return null;
              }
            }
            return null;
          })
        );

        const uniqueInstitutionIds = [...new Set(institutionIds.filter(id => id !== null))];

        if (uniqueInstitutionIds.length === 0) {
          setProfessors(
            allProfessors.professorsData.map((professor) => ({
              value: professor._id,
              label: `${professor.firstName} ${professor.lastName}`,
            }))
          );
        } else {
          const filteredProfessors = allProfessors.professorsData.filter(
            (professor) => uniqueInstitutionIds.includes(professor.institution._id)
          );

          setProfessors(
            filteredProfessors.map((professor) => ({
              value: professor._id,
              label: `${professor.firstName} ${professor.lastName}`,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching professors or institution data:", err);
      }
    };
    fetchFilteredProfessors();
  }, [selectedProfessors]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let isValid = true;
    const newErrors = {};

    if (title.trim() === "") {
      isValid = false;
      newErrors.title = "Please enter a course title.";
    } else if (title.length < 3) {
      isValid = false;
      newErrors.title = "Course title must be at least 3 characters long.";
    } else if (title.length > 50) {
      isValid = false;
      newErrors.title = "Course title cannot exceed 50 characters.";
    } else if (!/^[a-zA-Z\s]+$/.test(title)) {
      isValid = false;
      newErrors.title = "Course title can only contain letters and spaces.";
    }

    if (code.trim() === "") {
      isValid = false;
      newErrors.code = "Please enter a course code.";
    } else if (code.length < 3) {
      isValid = false;
      newErrors.code = "Course code must be at least 3 characters long.";
    } else if (code.length > 10) {
      isValid = false;
      newErrors.code = "Course code cannot exceed 10 characters.";
    } else if (!/^[^\s]+$/.test(code)) {
      isValid = false;
      newErrors.code = "Course code cannot contain spaces.";
    }

    if (credits < 1 || credits > 5) {
      isValid = false;
      newErrors.credits = "Credits must be between 1 and 5.";
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    const courseData = {
      title,
      code,
      credits,
      professors: selectedProfessors.map((professor) => professor.value),
    };

    try {
      let response;
      if (editEntity) {
        response = await CourseServices.updateCourse(editEntity._id, courseData);
      } else {
        response = await CourseServices.createCourse(courseData);
      }
      if (response && response.status === 500) {
        newErrors.generalError = "An error occurred. Please try again later.";
        setErrors(newErrors);
      }
      else if (response && response.status === 400) {
        newErrors.code = response.error;
        setErrors(newErrors);
      } else {
        onSave(response.course);
      }
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editEntity ? "Edit Course" : "Create New Course"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editEntity
                ? "Modify the course details below."
                : "Fill in the details to create a new course in the system."}
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
          <div className="space-y-5">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.title && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.title}</div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Course Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.code && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.code}</div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Professors (Optional)</label>
              <Select
                isMulti
                name="professors"
                options={professors}
                value={selectedProfessors}
                onChange={setSelectedProfessors}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select professors..."
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-900">Credits</label>
              <input
                type="text"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="sm:text-sm border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.credits && (
                <div className="text-xs font-medium text-red-500 mt-1">{errors.credits}</div>
              )}
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
          </div>
        </form>
      </div>
    </>
  );
};

export default CourseForm;
