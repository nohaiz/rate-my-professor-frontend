import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";

import ProfileService from "../../../../services/ProfileService";
import ProfessorProfileForm from "./ProfessorProfileForm";
import ProfessorServices from "../../../../services/ProfessorServices";
import SaveProfessors from "../../../components/SavedProfessors";

const ProfessorProfile = ({ handleSignout }) => {
  const { id } = useParams();
  const [professorProfile, setProfessorProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [courses, setCourses] = useState([]);
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const navigate = useNavigate();

  const fetchProfessorProfile = async () => {
    try {
      const response = await ProfileService.getProfile(id);
      setProfessorProfile(response);
      if (response?.professorAccount?.institution?.departments) {
        const allCourses = response.professorAccount.institution.departments.reduce(
          (courses, dept) => [...courses, ...dept.courses],
          []
        );
        setCourses(allCourses);
      }
    } catch (error) {
      console.error("Error fetching professor profile:", error);
    }
  };

  useEffect(() => {
    fetchProfessorProfile();
  }, [id]);

  const { professorAccount } = professorProfile || {};
  const { firstName, lastName, institution, bio } = professorAccount || {};

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
  };

  const handleRemoveCourse = async (courseId, DeptId) => {
    try {
      const response = await ProfessorServices.removeProfessorCourse(
        id,
        professorProfile.professorAccount.institution._id,
        DeptId,
        courseId
      );

      if (response.message) {
        const updatedCourses = courses.filter(c => c._id !== courseId);
        setCourses(updatedCourses);
        fetchProfessorProfile();
      }
    } catch (error) {
      console.error("Error removing professor's course:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this profile?");
    if (confirmDelete) {
      try {
        await ProfileService.deleteProfile(id);
        alert("Profile deleted successfully.");
        handleSignout();
        navigate("/auth/sign-in");
      } catch (error) {
        console.error("Error deleting profile:", error);
        alert("There was an error deleting the profile.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-6 border-b border-gray-300 pb-2">
        {["profile", "savedProfessors", "ratings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${activeTab === tab
              ? "bg-indigo-500 text-white"
              : "bg-transparent text-gray-600"
              } rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {tab === "profile" && "Professor Profile"}
            {tab === "savedProfessors" && "Saved Professors"}
            {tab === "ratings" && "Ratings"}
          </button>
        ))}
      </div>

      {professorProfile && (
        <>
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Professor Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details below.</p>
                </div>
                <div className="flex space-x-4">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center text-sm text-gray-900 hover:text-indigo-600 focus:outline-none"
                      >
                        <AiOutlineEdit className="mr-2" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                      >
                        <AiOutlineDelete className="mr-2" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onCancel}
                      className="flex items-center text-sm text-gray-900 hover:text-red-600 focus:outline-none"
                    >
                      <AiOutlineClose className="mr-2" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <ProfessorProfileForm
                  professorProfile={professorProfile}
                  setProfessorProfile={setProfessorProfile}
                  setIsEditing={setIsEditing}
                  courses={courses}
                  fetchProfessorProfile={fetchProfessorProfile}
                />
              ) : (
                <>
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                      <div className="text-sm font-medium text-gray-900">Full Name</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {firstName} {lastName}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Email Address</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {professorProfile.email}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Institution</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {institution?.name || "Empty"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Departments</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {institution?.departments?.length > 0 ? (
                          institution.departments.map((dept, deptIdx) => (
                            <div key={deptIdx} className="mb-2">
                              <div className="font-medium">{dept.name}</div>
                              <div className="text-sm text-gray-600 mb-2 mt-2">
                                {dept.courses?.length ? (
                                  <div className="flex flex-col space-y-2">
                                    {dept.courses.map((course, courseIdx) => (
                                      <div key={courseIdx} className="flex items-center space-x-2">
                                        <div className="text-sm text-gray-700">
                                          {course.title} ({course.code})
                                        </div>
                                        <button
                                          onClick={() => handleRemoveCourse(course._id, dept._id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <AiOutlineDelete />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  "No courses available"
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          "Empty"
                        )}
                      </div>
                    </div>

                    <div className="py-3 sm:grid sm:grid-cols-3 sm:px-0 mt-1">
                      <dt className="text-sm font-medium text-gray-900">Biography</dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                        <div
                          className="w-full sm:text-sm border border-gray-200 p-3 rounded-md bg-gray-10 text-gray-700 min-h-[150px] break-words"
                          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                        >
                          {bio || "Tell us about yourself..."}
                        </div>
                      </dd>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "savedProfessors" && (
            <section className="space-y-6">
              <SaveProfessors professorProfile={professorProfile} setProfessorProfile={setProfessorProfile} setActiveTab={setActiveTab} />
            </section>
          )}

          {activeTab === "ratings" && (
            <section className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
              {professorProfile.reviews?.length ? (
                professorProfile.reviews.map((review, idx) => (
                  <div key={idx} className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-700">{review}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-700">No reviews available</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ProfessorProfile;
