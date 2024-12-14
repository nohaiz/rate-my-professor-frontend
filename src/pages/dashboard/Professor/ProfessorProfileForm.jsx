import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DepartmentService from "../../../../services/DepartmentService";
import ProfessorServices from "../../../../services/ProfessorServices";
import ProfileService from "../../../../services/ProfileService";
import InstituteServices from "../../../../services/InstituteServices";

const ProfessorProfileForm = ({ professorProfile, setProfessorProfile, setIsEditing, courses }) => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: `${professorProfile?.professorAccount?.firstName || ''} ${professorProfile?.professorAccount?.lastName || ''}`,
    email: professorProfile?.email || '',
    institution: professorProfile?.professorAccount?.institution?.name || '',
    bio: professorProfile?.professorAccount?.bio || '',
    selectedDepartment: professorProfile?.professorAccount?.department?._id || '',
    selectedCourse: '',
    password: '',
    confirmPassword: ''
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await DepartmentService.indexDepartments();
        const data = await InstituteServices.getInstitute(professorProfile?.professorAccount?.institution?._id);
        const ans = data.institute.departments.map((institue) =>
          response.departments.filter((dep) => institue._id.toString() === dep._id.toString())
        );
        const departmentsObject = Object.assign(ans.flat());
        setDepartments(departmentsObject);

      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [id]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const [firstName, lastName] = formData.fullName.trim().split(' ', 2);
    if (!firstName || !lastName) newErrors.fullName = 'Enter full name';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    if (!formData.institution) newErrors.institution = 'Select institution';

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

    const backendData = {
      ...updatedFormData,
      ...(formData.selectedDepartment && { selectedDepartment: formData.selectedDepartment }),
      ...(formData.selectedCourse && { selectedCourse: formData.selectedCourse }),
      ...(formData.bio && { bio: formData.bio })
    };

    try {
      if (formData.selectedDepartment && formData.selectedCourse) {
        await ProfessorServices.addProfessorCourse(
          professorProfile._id, professorProfile.professorAccount?.institution?._id, formData.selectedDepartment, formData.selectedCourse
        );
      }

      await ProfileService.updateProfile(backendData, id);
      const response = await ProfileService.getProfile(id);
      setProfessorProfile(response);
      resetForm();
      setIsEditing(false);
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
      selectedDepartment: professorProfile?.professorAccount?.department?._id || '',
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

  const renderDepartmentAndCoursesDropdown = () => {
    const selectedDepartment = departments.find(department => department._id === formData.selectedDepartment);
    const availableCourses = selectedDepartment
      ? selectedDepartment.courses.filter(course =>
        !courses.some(existingCourse => existingCourse._id === course._id)
      )
      : [];

    return (
      <div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-900">Department (Optional)</label>
          <select
            name="selectedDepartment"
            value={formData.selectedDepartment}
            onChange={handleChange}
            className="sm:text-sm/6 border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {formData.selectedDepartment && (
          <div className="flex flex-col space-y-2 mt-4">
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-4">
        <div className="space-y-5">
          {renderInputField('Full Name', 'fullName')}
          {renderInputField('Email Address', 'email', 'email', true)}
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
          {renderDepartmentAndCoursesDropdown()}

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
