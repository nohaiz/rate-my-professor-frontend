import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";

import ProfileService from "../../../../services/ProfileService";
import StudentProfileForm from "./StudentProfileForm";

import SaveProfessors from "../../../components/SavedProfessors";

const StudentProfile = ({ handleSignout }) => {
  const { id } = useParams();
  const [studentProfile, setStudentProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await ProfileService.getProfile(id);
        setStudentProfile(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudentProfile();
  }, [id]);

  const { studentAccount } = studentProfile || {};
  const { firstName, lastName, institution, fieldOfStudy, GPA } = studentAccount || {};

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
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
            {tab === "profile" && "Student Profile"}
            {tab === "savedProfessors" && "Saved Professors"}
            {tab === "ratings" && "Ratings"}
          </button>
        ))}
      </div>

      {studentProfile && (
        <>
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
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
                <StudentProfileForm studentProfile={studentProfile} setStudentProfile={setStudentProfile} setIsEditing={setIsEditing} />
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
                      <div className="text-sm text-gray-700 sm:col-span-2">{studentProfile.email}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Institution</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{institution?.name || "Empty"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Field of Study</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{fieldOfStudy || "Empty"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">GPA</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">{GPA || "Empty"}</div>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "savedProfessors" && (
            <section className="space-y-6">
              <SaveProfessors studentProfile={studentProfile} setStudentProfile={setStudentProfile} setActiveTab={setActiveTab} />
            </section>
          )}

          {activeTab === "ratings" && (
            <section className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
              <p className="text-sm text-gray-700">{studentProfile.review || "No reviews available"}</p>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default StudentProfile;
