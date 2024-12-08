import { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineProfile } from "react-icons/ai";
import AdminUserForm from "./AdminUserForm";
import ManageUsersServices from "../../../../services/ManageUsersServices";

const ManageUsers = () => {

  const [users, setUsers] = useState([]);
  const [isUserFormVisible, setUserFormVisible] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterUserRole, setFilterUserRole] = useState([]);

  const filterAdmins = () => {
    const filteredAdmins = users.filter(user => user.adminAccount);
    setFilterUserRole(filteredAdmins);
  };

  const filterStudents = () => {
    const filteredStudents = users.filter(user => user.studentAccount);
    setFilterUserRole(filteredStudents);
  };

  const filterProfessors = () => {
    const filteredProfessors = users.filter(user => user.professorAccount);
    setFilterUserRole(filteredProfessors);
  };

  const clearFilter = () => {
    setFilterUserRole([]);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ManageUsersServices.indexUsers();
        setUsers(response.users);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, [isUserFormVisible]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [users]);

  const renderCreateUserForm = () => {
    setUserFormVisible(true);
  };

  const renderEditUserForm = (userId) => {
    setEditUserId(userId);
    setUserFormVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await ManageUsersServices.deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
      setSuccessMessage("User deleted successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const displayedUsers = filterUserRole.length > 0 ? filterUserRole : users;

  return (
    <div className="space-y-3">
      {isUserFormVisible ? (
        <AdminUserForm setUserFormVisible={setUserFormVisible} editUserId={editUserId} setSuccessMessage={setSuccessMessage} setEditUserId={setEditUserId} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 ml-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                A comprehensive list of all users' accounts, including their email, name, role, and other relevant details.
              </p>

              {successMessage && (
                <div className="bg-green-100 text-green-700 text-sm font-medium rounded-full py-2 px-6 mt-2">
                  {successMessage}
                </div>
              )}
            </div>
            <button
              onClick={renderCreateUserForm}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600"
            >
              Create User
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={filterAdmins} className="rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-gray-900">
              View All Admins
            </button>
            <button onClick={filterProfessors} className="rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-900">
              View All Professors
            </button>

            <button onClick={filterStudents} className="rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-900">
              View All Students
            </button>

            <button onClick={clearFilter} className="rounded-full py-2 px-6 text-sm font-medium transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-900">
              Clear Filter
            </button>
          </div>


          <div className="max-w-full ">
            <div className="overflow-x-auto mt-5">
              <table className="w-full table-auto text-sm">
                <thead className="bg-white text-sm text-gray-700 font-thin">
                  <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Email</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">First Name</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Last Name</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Role</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Institution</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {displayedUsers.map((user) => {
                    const admin = user.adminAccount;
                    const professor = user.professorAccount;
                    const student = user.studentAccount;

                    const firstName = admin
                      ? admin.firstName
                      : professor
                        ? professor.firstName
                        : student
                          ? student.firstName
                          : "-";

                    const lastName = admin
                      ? admin.lastName
                      : professor
                        ? professor.lastName
                        : student
                          ? student.lastName
                          : "-";

                    const role = admin
                      ? "Admin"
                      : professor
                        ? "Professor"
                        : student
                          ? "Student"
                          : "-";

                    const institution = professor
                      ? professor.institution.name
                      : student
                        ? student.institution?.name || "-"
                        : "-";

                    return (
                      <tr key={user._id} className="border-b">
                        <td className="px-6 py-4 text-gray-900 font-semibold">{user.email}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{firstName}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{lastName}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{role}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{institution}</td>
                        <td className="px-6 py-4">
                          <button
                            className="text-black hover:text-gray-800 text-sm"
                            onClick={() => renderEditUserForm(user._id)}
                          >
                            <AiOutlineProfile className="mr-2" />
                          </button>
                          <button
                            className="text-black hover:text-gray-800 text-sm ml-4"
                            onClick={() => renderEditUserForm(user._id)}
                          >
                            <AiOutlineEdit className="mr-2" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 text-sm ml-4"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <AiOutlineDelete className="mr-2" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
