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
    institution: studentProfile?.studentAccount?.institution?.id || '',
    fieldOfStudy: studentProfile?.studentAccount?.fieldOfStudy || '',
    GPA: studentProfile?.studentAccount?.GPA || '',
  });
  const [institutes, setInstitutes] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchInstitutes = async () => {
        try {
          const response = await InstituteServices.indexInstitutes();
          setInstitutes(response.institutions);
        } catch (error) {
          console.error('Error fetching institutes:', error);
        }
      };
      fetchInstitutes();
    }
  }, [id]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [firstName, lastName] = formData.fullName.split(' ', 2);
    const updatedFormData = {
      ...formData,
      firstName: firstName || '',
      lastName: lastName || '',
    };
    delete updatedFormData.fullName;

    if (updatedFormData.password === updatedFormData.confirmPassword) {
      try {
        const response = await ProfileService.updateProfile(updatedFormData, id);
        setStudentProfile(response);
        resetForm();
        setIsEditing(false)
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Passwords do not match!');
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
  };

  const renderInputField = (label, name, type = 'text', placeholder = '') => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-700 sm:col-span-2">
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-md"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const renderSelectField = (label, name, options) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-700 sm:col-span-2">
        <select
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-md"
        >
          <option value="">Select {label}</option>
          {options.map((institution) => (
            <option key={institution.id} value={institution._id}>
              {institution.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {renderInputField('Full Name', 'fullName', 'text', 'First Name Last Name')}
          {renderInputField('Email Address', 'email', 'email')}
          {renderInputField('Password', 'password', 'password')}
          {renderInputField('Confirm Password', 'confirmPassword', 'password')}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {renderSelectField('Institution', 'institution', institutes)}
          {renderInputField('Field of Study', 'fieldOfStudy')}
          {renderInputField('GPA', 'GPA')}
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="py-2 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default StudentProfileForm;
