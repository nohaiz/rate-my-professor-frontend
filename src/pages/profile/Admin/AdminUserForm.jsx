import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

import ManageUsersServices from "../../../../services/ManageUsersServices";
import InstituteServices from "../../../../services/InstituteServices";

const AdminUserForm = ({ setUserFormVisible, editUserId, setSuccessMessage, setEditUserId }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    userType: "",
    institution: "",
    bio: "",
    fieldOfStudy: "",
    GPA: "",
  });

  const [errors, setErrors] = useState({});
  const [institutionComboBox, setInstitutionComboBox] = useState([]);
  const [userTypes, setUserTypes] = useState({
    isStudent: false,
    isProfessor: false,
    isAdmin: false,
  });
  useEffect(() => {
    if (editUserId) {
      const fetchUser = async () => {
        try {
          const response = await ManageUsersServices.getUser(editUserId);
          if (response.adminAccount) {
            setFormData({
              email: response.email,
              firstName: response?.adminAccount.firstName,
              lastName: response?.adminAccount.lastName,
              userType: "Admin",
            });
            setUserTypes({
              isStudent: false,
              isProfessor: false,
              isAdmin: true,
            });
          }
          if (response.professorAccount) {
            setFormData({
              email: response.email,
              firstName: response?.professorAccount?.firstName,
              lastName: response?.professorAccount?.lastName,
              bio: response?.professorAccount?.bio || '',
              institution: response?.professorAccount?.institution,
              userType: "Professor",
            });
            setUserTypes({
              isStudent: false,
              isProfessor: true,
              isAdmin: false,
            });
          }
          if (response.studentAccount) {
            setFormData({
              email: response.email,
              firstName: response?.studentAccount?.firstName,
              lastName: response?.studentAccount?.lastName,
              institution: response?.studentAccount?.institution || '',
              fieldOfStudy: response?.studentAccount?.fieldOfStudy || '',
              GPA: response?.studentAccount?.GPA || '',
              userType: "Student",
            });
            setUserTypes({
              isStudent: true,
              isProfessor: false,
              isAdmin: false,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setErrors({ general: "Error fetching user data: " + error.message });
        }
      };
      fetchUser();
    }

    const fetchInstitutes = async () => {
      try {
        const response = await InstituteServices.indexInstitutes();
        setInstitutionComboBox(response?.institutions || []);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        setInstitutionComboBox([]);
      }
    };
    fetchInstitutes();
  }, [editUserId]);

  const validateForm = () => {
    // Need to fix this
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.firstName || !formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName || !formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.userType) newErrors.userType = "Select a role";
    if (!editUserId) {
      if (!formData.password || !formData.password.trim()) newErrors.password = "Password is required";
      if (!formData.confirmPassword || !formData.confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
    }
    if (userTypes.isStudent) {
      if (!formData.institution || !formData.institution.trim()) newErrors.institution = "Institution is required";
      if (!editUserId) {
        if (!formData.fieldOfStudy || !formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = "Field of study is required";
        if (!formData.GPA || (formData.GPA && formData.GPA.toString().trim() === "")) newErrors.GPA = "GPA is required";
      }
    }

    if (userTypes.isProfessor) {
      if (!formData.institution || !formData.institution.trim()) newErrors.institution = "Institution is required";
      if (!editUserId) {
        if (!formData.bio || !formData.bio.trim()) newErrors.bio = "Bio is required";
      }
    }

    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setUserFormVisible(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        institution: formData.institution,
        bio: formData.bio,
        fieldOfStudy: formData.fieldOfStudy,
        GPA: formData.GPA,
        isStudent: userTypes.isStudent,
        isProfessor: userTypes.isProfessor,
        isAdmin: userTypes.isAdmin,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      let response;
      if (editUserId) {
        userData.editUserId = editUserId;
        response = await ManageUsersServices.editUser(editUserId, userData);
        setEditUserId('')
      } else {
        response = await ManageUsersServices.createUser(userData);
      }

      if (response.success) {
        setSuccessMessage(editUserId ? "User updated successfully" : "User created successfully");
        setTimeout(() => setSuccessMessage(''), 3000);
        setUserFormVisible(false);
      } else {
        setErrors({ general: response.message || "Error submitting data" });
      }
    } catch (err) {
      setErrors({ general: "Error: " + err.message });
    }
  };

  const handleUserTypeChange = (e) => {
    const selectedType = e.target.value;
    setFormData((prev) => ({ ...prev, userType: selectedType }));
    setUserTypes({
      isStudent: selectedType === "Student",
      isProfessor: selectedType === "Professor",
      isAdmin: selectedType === "Admin",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderFormFields = () => {
    const commonFields = [
      { label: "First Name", name: "firstName", type: "text", value: formData.firstName },
      { label: "Last Name", name: "lastName", type: "text", value: formData.lastName },
      { label: "Email", name: "email", type: "email", value: formData.email },
      { label: "Password", name: "password", type: "password", value: formData.password },
      { label: "Confirm Password", name: "confirmPassword", type: "password", value: formData.confirmPassword },
    ];

    const userTypeFields = [];

    if (userTypes.isProfessor) {
      userTypeFields.push(
        {
          label: "Institution",
          name: "institution",
          type: "select",
          value: formData.institution,
          options: institutionComboBox.map((inst) => ({ value: inst._id, label: inst.name })),
        },
        { label: "Biography", name: "bio", type: "text", value: formData.bio }
      );
    }

    if (userTypes.isStudent) {
      userTypeFields.push(
        {
          label: "Institution",
          name: "institution",
          type: "select",
          value: formData.institution,
          options: institutionComboBox.map((inst) => ({ value: inst._id, label: inst.name })),
        },
        { label: "Field of Study", name: "fieldOfStudy", type: "text", value: formData.fieldOfStudy },
        { label: "GPA", name: "GPA", type: "text", value: formData.GPA }
      );
    }

    return commonFields.concat(userTypeFields).map((field) => (
      <div key={field.name}>
        <label className="block text-sm font-medium text-gray-800 mb-2">{field.label}:</label>
        {field.type === "select" ? (
          <select
            name={field.name}
            value={field.value}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select an {field.label}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            name={field.name}
            value={field.value}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
        {errors[field.name] && <div className="text-red-500 text-sm">{errors[field.name]}</div>}
      </div>
    ));
  };

  return (
    <>
      <button
        onClick={handleCancel}
        className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-10"
      >
        <AiOutlineClose className="mr-2" />
      </button>
      <div className="max-w-md mx-auto p-7 bg-white mt-10">
        <h2 className="text-center text-2xl font-medium tracking-tight text-gray-900">
          {editUserId ? "Edit User" : "Create User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Select User Role:</label>

            <select
              value={formData.userType}
              onChange={handleUserTypeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!!editUserId}
            >
              <option value="">Select a User Type</option>
              <option value="Student">Student</option>
              <option value="Professor">Professor</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.userType && <div className="text-red-500 text-sm">{errors.userType}</div>}
          </div>

          {renderFormFields()}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {editUserId ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminUserForm;
