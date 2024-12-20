import React, { useState, useEffect } from "react";
import AuthServices from "../../../services/AuthServices";
import InstituteServices from "../../../services/InstituteServices";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [institution, setInstitution] = useState("");
  const [institutes, setInstitutes] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await InstituteServices.indexInstitutes();
        if (response && Array.isArray(response.institutions)) {
          setInstitutes(response.institutions);
        } else {
          setInstitutes([]);
        }
      } catch (error) {
        setInstitutes([]);
      }
    };
    fetchInstitutes();
  }, []);

  const validateSignUpForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email || !email.trim()) newErrors.email = "Email is required";
    if (email && !emailRegex.test(email)) newErrors.email = "Invalid email format";

    if (!firstName || !firstName.trim()) newErrors.firstName = "First name is required";
    if (firstName && !nameRegex.test(firstName)) newErrors.firstName = "First name should only contain letters and no spacing";
    if (firstName && (firstName.length < 3 || firstName.length > 15)) {
      newErrors.firstName = "First name must be between 3 and 15 characters";
    }

    if (!lastName || !lastName.trim()) newErrors.lastName = "Last name is required";
    if (lastName && !nameRegex.test(lastName)) newErrors.lastName = "Last name should only contain letters and no spacing";
    if (lastName && (lastName.length < 3 || lastName.length > 15)) {
      newErrors.lastName = "Last name must be between 3 and 15 characters";
    }
    if (!password || !password.trim()) newErrors.password = "Password is required";
    if (password && !passwordRegex.test(password)) {
      newErrors.password = "Password must be at least 8 characters and include an uppercase letter, lowercase letter, digit, and special character";
    }
    if (!confirmPassword || !confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (isProfessor && !institution) newErrors.institution = "Please select an institution";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateSignUpForm()) return;

    try {
      const response = await AuthServices.signup({
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        isStudent,
        isProfessor,
        institution,
      });
      if (response.qrCodeUrl) {
        setIs2FAEnabled(true);
        setQrCodeUrl(response.qrCodeUrl);
      }
    } catch (err) {
      setErrors({ general: "Error: " + err.message });
    }
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!validateOtp()) return;

    try {
      const response = await AuthServices.verifyOtp(email, otp);
      if (response.tokenCreated) {
        window.localStorage.setItem("token", response.tokenCreated);
        window.location.href = "/";
      }
    } catch (err) {
      setErrors({ otp: "Invalid OTP or error: " + err.message });
    }
  };

  return (
    <div className="max-w-md mx-auto p-7 bg-white mt-10">
      <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
        Set Up Your Account to Get Started
      </h2>

      {!is2FAEnabled ? (
        <form onSubmit={handleSignUp} className="space-y-8 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.firstName && <div className="text-red-500 text-sm">{errors.firstName}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.lastName && <div className="text-red-500 text-sm">{errors.lastName}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}
          </div>
          <div className="flex items-center space-x-6">
            <div>
              <label className="text-sm font-medium text-gray-800 mb-2">Are you a student?</label>
              <input
                type="checkbox"
                checked={isStudent}
                onChange={() => setIsStudent((prev) => !prev)}
                className="ml-2 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 mb-2">Are you a professor?</label>
              <input
                type="checkbox"
                checked={isProfessor}
                onChange={() => setIsProfessor((prev) => !prev)}
                className="ml-2 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
          </div>
          {isProfessor && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Institution:</label>
              <select
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select an Institution</option>
                {institutes.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              {errors.institution && <div className="text-red-500 text-sm">{errors.institution}</div>}
            </div>
          )}
          {errors.general && <div className="text-red-500 text-sm">{errors.general}</div>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
          >
            Sign Up
          </button>
        </form>
      ) : (
        <div className="space-y-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center">Scan the QR Code to Set Up Google Authenticator</h3>
          <img src={qrCodeUrl} alt="QR Code for 2FA" className="mx-auto" />
          <form onSubmit={handleOtpSubmit} className="space-y-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Enter OTP from your Authenticator App:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.otp && <div className="text-red-500 text-sm">{errors.otp}</div>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
            >
              Verify OTP
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;
