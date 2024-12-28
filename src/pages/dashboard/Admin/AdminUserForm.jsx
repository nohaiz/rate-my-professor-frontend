import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

import ManageUsersServices from "../../../../services/ManageUsersServices";
import InstituteServices from "../../../../services/InstituteServices";

const AdminUserForm = ({ setUserFormVisible, editUserId, setSuccessMessage }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    userType: "Admin",
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
    isAdmin: true,
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
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.email || !formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.firstName || !formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (formData.firstName && !nameRegex.test(formData.firstName)) newErrors.firstName = "First name should only contain letters and no spacing";
    if (formData.firstName && (formData.firstName.length < 3 || formData.firstName.length > 15)) {
      newErrors.firstName = "First name must be between 3 and 15 characters";
    }

    if (!formData.lastName || !formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (formData.lastName && !nameRegex.test(formData.lastName)) newErrors.lastName = "Last name should only contain letters and no spacing";
    if (formData.lastName && (formData.lastName.length < 3 || formData.lastName.length > 15)) {
      newErrors.lastName = "Last name must be between 3 and 15 characters";
    }

    if (!editUserId) {
      if (!formData.password || !formData.password.trim()) newErrors.password = "Password is required";
      if (formData.password && !passwordRegex.test(formData.password)) {
        newErrors.password = "Password must be at least 8 characters and include an uppercase letter, lowercase letter, digit, and special character";
      }
      if (!formData.confirmPassword || !formData.confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    if (userTypes.isProfessor) {
      if (formData.bio && formData.bio.length > 500) {
        newErrors.bio = "Bio must be 500 characters max";
      }
      if (!formData.bio || formData.bio.trim() === "") formData.bio = "";
      if (!formData.institution || !formData.institution.trim()) newErrors.institution = "Institution is required";
    }

    if (userTypes.isStudent) {
      if (formData.fieldOfStudy && formData.fieldOfStudy.length > 30) {
        newErrors.fieldOfStudy = "Field of study must be 30 characters max";
      }
      if (!formData.fieldOfStudy || formData.fieldOfStudy.trim() === "") formData.fieldOfStudy = "";
      if (formData.GPA) {
        const gpaRegex = /^(\d(\.\d{1,2})?)$/;
        if (!gpaRegex.test(formData.GPA)) {
          newErrors.GPA = "GPA must be a valid decimal number";
        } else if (formData.GPA < 0.0 || formData.GPA > 4.0) {
          newErrors.GPA = "GPA must be between 0.0 and 4.0";
        }
      }

      if (!formData.institution || !formData.institution.trim()) newErrors.institution = "Institution is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setUserFormVisible(false);
  };

  const handleSubmit = async (e) => {
    const newErrors = {};
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
      };

      if (!editUserId) {
        if (formData.password) {
          userData.password = formData.password;
          userData.confirmPassword = formData.confirmPassword;
        }
      } else {
        if (formData.password) {
          if (formData.password !== formData.confirmPassword) {
            setErrors({ general: "Passwords do not match" });
            return;
          }
          userData.password = formData.password;
          userData.confirmPassword = formData.confirmPassword;
        }
      }

      let response;
      if (editUserId) {
        userData.editUserId = editUserId;
        response = await ManageUsersServices.editUser(editUserId, userData);
      } else {
        response = await ManageUsersServices.createUser(userData);
      }
      if (response && response.status === 500) {
        newErrors.generalError = "An error occurred. Please try again later.";
        setErrors(newErrors);
      }
      else if (response && response.status === 400) {
        newErrors.email = response.error;
        setErrors(newErrors);
      }
      else if (response.success) {
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
      { label: "Email", name: "email", type: "text", value: formData.email },
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
        {
          label: "Biography",
          name: "bio",
          type: "textarea",
          value: formData.bio,
        }
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
        ) : field.type === "textarea" ? (
          <textarea
            name={field.name}
            value={field.value}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editUserId ? "Edit User" : "Create New User"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editUserId
                ? "Modify the user details below."
                : "Fill in the details to create a new user in the system."}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-gray-900 hover:text-red-600 focus:outline-none absolute right-0"
          >
            <AiOutlineClose className="mr-6" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="space-y-8 mt-8 w-full max-w-md space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Select User Role:</label>
            <select
              value={formData.userType}
              onChange={handleUserTypeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!!editUserId}
            >
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
