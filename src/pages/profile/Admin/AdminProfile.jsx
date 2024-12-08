import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineEdit, AiOutlineClose, AiOutlineDelete } from "react-icons/ai";

import ProfileService from "../../../../services/ProfileService";
import AdminProfileForm from "./AdminProfileForm";

import ManageUsers from "./ManageUsers";

const AdminProfile = ({ handleSignout }) => {
  const { id } = useParams();
  const [adminProfile, setAdminProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await ProfileService.getProfile(id);
        setAdminProfile(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAdminProfile();
  }, [id]);

  const { adminAccount } = adminProfile || {};
  const { firstName, lastName } = adminAccount || {};

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
      <div className="mb-6 flex space-x-4 border-b border-gray-300 pb-2">
        {['profile', 'dashboard', 'academic', 'reporting'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${activeTab === tab
              ? "bg-indigo-500 text-white"
              : "bg-transparent text-gray-600"} 
              rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {tab === 'profile' && 'Admin Profile'}
            {tab === 'dashboard' && 'User Dashboard'}
            {tab === 'academic' && 'Academic Dashboard'}
            {tab === 'reporting' && 'Reporting & Moderation'}
          </button>
        ))}
      </div>

      {adminProfile && (
        <>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Admin details and application.</p>
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
                <AdminProfileForm
                  adminProfile={adminProfile}
                  setAdminProfile={setAdminProfile}
                  setIsEditing={setIsEditing}
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
                        {adminProfile.email}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <ManageUsers activeTab={activeTab} />
            </>
          )}
          {activeTab === 'academic' && (
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Academic Dashboard</h3>
            </section>
          )}
          {activeTab === 'reporting' && (
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Reporting & Moderation</h3>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProfile;
