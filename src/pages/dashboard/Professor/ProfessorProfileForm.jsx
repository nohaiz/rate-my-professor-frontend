import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CourseServices from "../../../../services/CourseServices";
import ProfileService from "../../../../services/ProfileService";
import ProfessorServices from "../../../../services/ProfessorServices";

const ProfessorProfileForm = ({ professorProfile, setProfessorProfile, setIsEditing }) => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: `${professorProfile?.professorAccount?.firstName || ''} ${professorProfile?.professorAccount?.lastName || ''}`,
    email: professorProfile?.email || '',
    institution: professorProfile?.professorAccount?.institution?.name || '',
    bio: professorProfile?.professorAccount?.bio || '',
    selectedCourse: '',
    password: '',
    confirmPassword: ''
  });

  const [availableCourses, setAvailableCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await CourseServices.indexCourses();
        const professorInstitutionId = professorProfile?.professorAccount?.institution?._id;

        const filteredCourses = response.courses.filter(course => {
          return course.professors.some(professor =>
            professor.institution._id === professorInstitutionId
          ) || course.professors.length === 0;
        });

        setAvailableCourses(filteredCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [id, professorProfile?.professorAccount?.institution]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const [firstName, lastName] = formData.fullName.trim().split(' ', 2);
    if (!firstName || !lastName) newErrors.fullName = 'Enter full name';

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email.trim()) newErrors.email = 'Email required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Enter a valid email address';

    if (!formData.institution) newErrors.institution = 'Select institution';
    if (!formData.selectedCourse) newErrors.selectedCourse = 'Select course';

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }
    if (!formData.bio) {
      newErrors.bio = 'Biography required';
    }

    if (isChangingPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!formData.password) newErrors.password = 'Password required';
      else if (!passwordRegex.test(formData.password)) newErrors.password = 'Weak password';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don’t match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const [firstName, lastName] = formData.fullName.split(' ', 2);
    const updatedFormData = {
      ...formData,
      firstName,
      lastName,
      institution: professorProfile?.professorAccount?.institution?._id,
    };

    if (!isChangingPassword || !updatedFormData.password) {
      delete updatedFormData.password;
      delete updatedFormData.confirmPassword;
    }

    delete updatedFormData.fullName;

    if (formData.email === professorProfile.email) {
      delete updatedFormData.email;
    }
    const backendData = {
      ...updatedFormData,
      ...(formData.selectedCourse && { selectedCourse: formData.selectedCourse }),
      ...(formData.bio && { bio: formData.bio })
    };

    if (formData.email !== professorProfile.email) {
      backendData.email = formData.email;
    }

    try {
      const updatedProfile = await ProfileService.updateProfile(backendData, id);
      if (updatedProfile.error) {
        const newErrors = {};
        newErrors.email = updatedProfile.error
        setErrors(newErrors)
      }
      else {
        const response = await ProfileService.getProfile(id);
        if (formData.selectedCourse) {
          await ProfessorServices.addProfessorCourse(id, professorProfile?.professorAccount?.institution?._id, formData.selectedCourse);
        }
        setProfessorProfile(response);
        resetForm();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating professor profile:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: `${professorProfile?.professorAccount?.firstName || ''} ${professorProfile?.professorAccount?.lastName || ''}`,
      email: professorProfile?.email || '',
      institution: professorProfile?.professorAccount?.institution?.name || '',
      bio: professorProfile?.professorAccount?.bio || '',
      selectedCourse: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const renderInputField = (label, name, type = 'text', disabled = false, isTextArea = false) => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {isTextArea ? (
        <textarea
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className="sm:text-sm/6 border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
          disabled={disabled}
          rows="4"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className="sm:text-sm/6 border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
          disabled={disabled}
        />
      )}
      {errors[name] && <div className="text-xs font-medium text-red-500 mt-1">{errors[name]}</div>}
    </div>
  );

  const renderPasswordFields = () => (
    <>
      {renderInputField('Password', 'password', 'password')}
      {renderInputField('Confirm Password', 'confirmPassword', 'password')}
    </>
  );

  const renderCoursesDropdown = () => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-900">Course</label>
      <select
        name="selectedCourse"
        value={formData.selectedCourse}
        onChange={handleChange}
        className="sm:text-sm/6 border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Select Course</option>
        {availableCourses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.title} ({course.code})
          </option>
        ))}
      </select>
      {errors.selectedCourse && <div className="text-xs font-medium text-red-500 mt-1">{errors.selectedCourse}</div>}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-4">
        <div className="space-y-5">
          {renderInputField('Full Name', 'fullName')}
          {renderInputField('Email Address', 'email', 'email', false)}
          {isChangingPassword && renderPasswordFields()}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-900">Institution</label>
            <input
              type="text"
              name="institution"
              value={professorProfile?.professorAccount?.institution?.name || ''}
              className="sm:text-sm/6 border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
              disabled
            />
          </div>
          {renderInputField('Biography', 'bio', 'text', false, true)}
          {renderCoursesDropdown()}

          <div className="flex items-center space-x-1 mt-3">
            <input
              type="checkbox"
              checked={isChangingPassword}
              onChange={() => setIsChangingPassword((prev) => !prev)}
            />
            <label className="text-xs text-gray-700">Yes, I want to change my password</label>
          </div>

          <div className="mt-4">
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
  );
};

export default ProfessorProfileForm;
