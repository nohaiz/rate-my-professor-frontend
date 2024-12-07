import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiOutlineEdit, AiOutlineClose } from "react-icons/ai";

import ProfileService from "../../../../services/ProfileService";
import AdminProfileForm from "./AdminProfileForm";  

const AdminProfile = () => {
  const { id } = useParams();
  const [adminProfile, setAdminProfile] = useState(null);
  const [isProfileVisible, setProfileVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-6 border-b border-gray-300 pb-2">
        <button
          onClick={() => setProfileVisible(true)}
          className={`${
            isProfileVisible ? "border-b-2 border-indigo-500" : ""
          } py-2 px-4 text-sm font-medium text-gray-500 transition duration-200 ease-in-out hover:text-gray-900 focus:outline-none`}
        >
          Admin Profile
        </button>
      </div>

      {adminAccount && (
        <>
          {isProfileVisible ? (
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 mt-4">
                      <div className="text-sm font-medium text-gray-900">Password</div>
                      <div className="text-sm text-gray-700 sm:col-span-2">
                        {"********"}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          ) : (
            <section className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">No other details available</h3>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProfile;
