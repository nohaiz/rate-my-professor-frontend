import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ProfileService from '../../../../services/ProfileService';
import InstituteServices from '../../../../services/InstituteServices';

const StudentProfileForm = ({ studentProfile, setStudentProfile, setIsEditing }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullName: `${studentProfile?.studentAccount?.firstName || ''} ${studentProfile?.studentAccount?.lastName || ''}`,
    email: studentProfile?.email || '',
    password: '',
    confirmPassword: '',
    institution: studentProfile?.studentAccount?.institution?._id || '',
    fieldOfStudy: studentProfile?.studentAccount?.fieldOfStudy || '',
    GPA: studentProfile?.studentAccount?.GPA || '',
  });
  const [institutes, setInstitutes] = useState([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await InstituteServices.indexInstitutes();
        setInstitutes(response.institutions);
      } catch (error) {
        console.error('Error fetching institutes:', error);
      }
    };
    if (id) fetchInstitutes();
  }, [id]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [firstName, lastName] = formData.fullName.trim().split(' ', 2);
    if (!firstName || !lastName) newErrors.fullName = 'Enter full name';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    else if (!emailPattern.test(formData.email)) newErrors.email = 'Invalid email';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (isChangingPassword) {
      if (!formData.password) newErrors.password = 'Password required';
      else if (!passwordRegex.test(formData.password)) newErrors.password = 'Weak password';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don’t match';
    }
    if (!formData.fieldOfStudy) newErrors.fieldOfStudy = 'Field of study required'
    if (!formData.institution) newErrors.institution = 'Select institution';

    const gpa = String(formData.GPA).trim();
    const gpaRegex = /^(?:[0-4](?:\.\d{1,2})?|4(\.0{1,2})?)$/;

    if (!gpa || gpa === '') {
      newErrors.GPA = 'GPA required';
    } else if (!gpaRegex.test(gpa)) {
      newErrors.GPA = 'Invalid GPA';
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
      firstName: firstName || '',
      lastName: lastName || '',
      institution: formData.institution || studentProfile?.studentAccount?.institution?._id,
    };

    if (!updatedFormData.password || updatedFormData.password !== updatedFormData.confirmPassword) {
      delete updatedFormData.password;
      delete updatedFormData.confirmPassword;
    }
    if (formData.email === studentProfile.email) {
      delete updatedFormData.email;
    }
    delete updatedFormData.fullName;

    try {
      const response = await ProfileService.updateProfile(updatedFormData, id);
      if (response.error) {
        const newErrors = {};
        newErrors.email = response.error
        setErrors(newErrors)
      } else {
        setStudentProfile(response);
        resetForm();
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: `${studentProfile?.studentAccount?.firstName || ''} ${studentProfile?.studentAccount?.lastName || ''}`,
      email: studentProfile?.email || '',
      password: '',
      confirmPassword: '',
      institution: studentProfile?.studentAccount?.institution?.id || '',
      fieldOfStudy: studentProfile?.studentAccount?.fieldOfStudy || '',
      GPA: studentProfile?.studentAccount?.GPA || '',
    });
    setErrors({});
  };

  const renderInputField = (label, name, type = 'text', placeholder = '', disabled = false) => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="sm:text-sm/6 border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={placeholder}
        disabled={disabled}
      />
      {errors[name] && <div className="text-xs font-medium text-red-500 mt-1">{errors[name]}</div>}
    </div>
  );

  const renderSelectField = (label, name, options) => {
    const selectedInstitutionId = studentProfile?.studentAccount?.institution?._id;
    const filteredOptions = options.filter((institution) => institution._id !== selectedInstitutionId);

    return (
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <select
          name={name}
          value={formData[name] || selectedInstitutionId}
          onChange={handleChange}
          className="sm:text-sm/6 border border-gray-300 p-2 rounded-md min-h-[40px] focus:ring-indigo-500 focus:border-indigo-500"
        >
          {studentProfile?.studentAccount?.institution && (
            <option value={selectedInstitutionId}>
              {studentProfile.studentAccount.institution.name}
            </option>
          )}
          {filteredOptions.map((institution) => (
            <option key={institution._id} value={institution._id}>
              {institution.name}
            </option>
          ))}
        </select>
        {errors[name] && <div className="text-xs font-medium text-red-500 mt-1">{errors[name]}</div>}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-4">
        <div className="space-y-5">
          {renderInputField('Full Name', 'fullName', 'text', 'First & Last Name')}
          {renderInputField('Email Address', 'email', 'email', '', false)}

          {isChangingPassword && (
            <>
              {renderInputField('Password', 'password', 'password')}
              {renderInputField('Password Confirmation', 'confirmPassword', 'password')}
            </>
          )}

          {renderSelectField('Institution', 'institution', institutes)}
          {renderInputField('Field of Study', 'fieldOfStudy')}
          {renderInputField('GPA', 'GPA')}

          <div className="flex items-center space-x-1 mt-3">
            <input
              type="checkbox"
              checked={isChangingPassword}
              onChange={() => setIsChangingPassword((prev) => !prev)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Yes, I want to change my password</label>
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

export default StudentProfileForm;
