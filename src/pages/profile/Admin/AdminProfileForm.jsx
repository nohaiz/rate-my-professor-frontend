import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ProfileService from '../../../../services/ProfileService';

const AdminProfileForm = ({ adminProfile, setAdminProfile, setIsEditing }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullName: `${adminProfile?.adminAccount.firstName || ''} ${adminProfile?.adminAccount.lastName || ''}`,
    email: adminProfile?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false); 
  const [errors, setErrors] = useState({});

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
    };

    if (!updatedFormData.password || updatedFormData.password !== updatedFormData.confirmPassword) {
      delete updatedFormData.password;
      delete updatedFormData.confirmPassword;
    }

    delete updatedFormData.fullName;

    try {
      const response = await ProfileService.updateProfile(updatedFormData, id);
      setAdminProfile(response);
      resetForm();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: `${adminProfile?.firstName || ''} ${adminProfile?.lastName || ''}`,
      email: adminProfile?.email || '',
      password: '',
      confirmPassword: '',
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

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-4">
        <div className="space-y-5">
          {renderInputField('Full Name', 'fullName', 'text', 'First & Last Name')}
          {renderInputField('Email Address', 'email', 'email', '', true)}

          {isChangingPassword && (
            <>
              {renderInputField('Password', 'password', 'password')}
              {renderInputField('Password Confirmation', 'confirmPassword', 'password')}
            </>
          )}

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

export default AdminProfileForm;
