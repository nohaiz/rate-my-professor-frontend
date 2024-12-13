import { useEffect, useState, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineProfile, AiOutlineStar } from "react-icons/ai";
import AdminUserForm from "./AdminUserForm";
import ManageUsersServices from "../../../../services/ManageUsersServices";

const ManageUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [isUserFormVisible, setUserFormVisible] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const hasScrolled = useRef(false);


  const filterAdmins = () => {
    setFilterUserRole('admin');
    setCurrentPage(1);
  };

  const filterStudents = () => {
    setFilterUserRole('student');
    setCurrentPage(1);
  };

  const filterProfessors = () => {
    setFilterUserRole('professor');
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setFilterUserRole('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const renderCreateUserForm = () => {
    setEditUserId("");
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
  }
  useEffect(() => {
    if (successMessage && !hasScrolled.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      hasScrolled.current = true;
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ManageUsersServices.indexUsers();
        const filteredOwnUser = response ? response.users.filter((ownUser) => ownUser._id !== user.Id) : [];
        setUsers(filteredOwnUser);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, [isUserFormVisible]);

  useEffect(() => {
    let filteredList = [...users];

    if (filterUserRole) {
      filteredList = filteredList.filter((user) => {
        if (filterUserRole === 'admin') return user.adminAccount;
        if (filterUserRole === 'professor') return user.professorAccount;
        if (filterUserRole === 'student') return user.studentAccount;
        return false;
      });
    }

    if (searchQuery) {
      filteredList = filteredList.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (searchQuery || filterUserRole) {
      setCurrentPage(1);
    }

    setFilteredUsers(filteredList);
  }, [searchQuery, users, filterUserRole]);

  const handlePagination = (page) => {
    if (page < 1 || page > Math.ceil(filteredUsers.length / itemsPerPage)) return;
    setCurrentPage(page);
  };

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center px-4">
        <button
          onClick={() => handlePagination(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500 mt-4"
        >
          Prev
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
          </span>
        </div>

        <button
          onClick={() => handlePagination(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
          className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-4 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500 mt-4"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {isUserFormVisible ? (
        <AdminUserForm setUserFormVisible={setUserFormVisible} editUserId={editUserId} setSuccessMessage={setSuccessMessage} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 ml-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
                {successMessage && (
                  <div className="text-green-400 text-sm font-medium ml-4 flex justify-center items-center">
                    {successMessage}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                A comprehensive list of all users' accounts, including their email, name, role, and other relevant details.
              </p>
            </div>
            <button
              onClick={() => renderCreateUserForm()}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600"
            >
              Create User
            </button>
          </div>

          <div className="mb-6 ml-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find by email address"
              className="sm:text-sm/6 px-4 py-2 border rounded-full w-80 mb-4"
            />
          </div>

          <div className="flex flex-wrap gap-2 ml-4">
            <button
              onClick={filterAdmins}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-3 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
            >
              View All Admins
            </button>

            <button
              onClick={filterProfessors}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-3 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
            >
              View All Professors
            </button>

            <button
              onClick={filterStudents}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-3 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-900"
            >
              View All Students
            </button>

            <button
              onClick={clearFilter}
              className="bg-gray-500 text-white text-sm font-medium rounded-full py-2 px-6 mr-3 hover:bg-gray-600 focus:ring-2 focus:ring-indigo-900"
            >
              Clear Filter
            </button>
          </div>

          <div className="max-w-full">
            <div className="overflow-x-auto mt-5">
              <table className="w-full table-auto text-sm">
                <thead className="bg-white text-sm text-gray-700 font-thin">
                  <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Email</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">First Name</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Last Name</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Role</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Institution</th>
                    <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentUsers.map((user) => {
                    const admin = user.adminAccount;
                    const professor = user.professorAccount;
                    const student = user.studentAccount;

                    const firstName = admin
                      ? admin.firstName
                      : professor
                        ? professor.firstName
                        : student
                          ? student.firstName
                          : "Empty";

                    const lastName = admin
                      ? admin.lastName
                      : professor
                        ? professor.lastName
                        : student
                          ? student.lastName
                          : "Empty";

                    const role = admin
                      ? "Admin"
                      : professor
                        ? "Professor"
                        : student
                          ? "Student"
                          : "Empty";

                    const institution = professor
                      ? professor.institution?.name || "Empty"
                      : student
                        ? student.institution?.name || "Empty"
                        : "Empty";

                    return (
                      <tr key={user._id} className="border-b">
                        <td className="px-6 py-4 text-gray-900 font-semibold">{user.email}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{firstName}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{lastName}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{role}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{institution}</td>
                        <td className="px-6 py-4 flex items-center space-x-4">
                          <button
                            className="text-red-600 hover:text-red-900 text-sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <AiOutlineDelete className="mr-2" />
                          </button>
                          <button
                            className="text-black hover:text-gray-800 text-sm"
                            onClick={() => renderEditUserForm(user._id)}
                          >
                            <AiOutlineEdit className="mr-1" />
                          </button>
                          {!user.adminAccount && (
                            <button
                              className="text-black hover:text-gray-800 text-sm"
                              onClick={() => setEditUserId(user._id)}
                            >
                              <div className="flex items-center justify-center">
                                View Ratings <AiOutlineStar className="ml-2" />
                              </div>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {renderPagination()}
        </>
      )
      }
    </div >
  );
};

export default ManageUsers;
