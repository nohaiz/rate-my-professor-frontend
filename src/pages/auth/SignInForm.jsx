import React, { useState } from "react";
import AuthServices from "../../../services/AuthServices";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otp, setOtp] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSignIn = async (e) => {
    setError("");
    e.preventDefault();

    if (!emailRegex.test(email) && !email) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!passwordRegex.test(password) && !password) {
      setError("Please ensure your password meets the requirements.");
      return;
    }

    try {
      const response = await AuthServices.signin({
        email,
        password,
      });
      if (response.twofaRequired) {
        setIs2FAEnabled(true);
        setQrCodeUrl(response.qrCodeUrl);
      } else if (response.message === 'ok') {
        setIs2FAEnabled(true);
      }
    } catch (err) {
      setError("An error occurred during sign in.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const response = await AuthServices.verifyOtp(email, otp);
      if (response.tokenCreated) {
        window.localStorage.setItem("token", response.tokenCreated);
        window.location.href = "/";
      }
    } catch (err) {
      setError("Invalid OTP or error occurred.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-7 bg-white mt-10">
      <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
        Sign In to Your Account
      </h2>

      {!is2FAEnabled ? (
        <form onSubmit={handleSignIn} className="space-y-8 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Email:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm/6"
            />
            {error && error.includes("email") && (
              <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm/6"
            />
            {error && error.includes("password") && (
              <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
          </div>

          {error && !error.includes("password") && !error.includes("email") && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md shadow-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
          >
            Sign In
          </button>
        </form>
      ) : (
        <div className="space-y-6 mt-6">
          {qrCodeUrl && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Scan the QR Code to Set Up Google Authenticator</h3>
              <img src={qrCodeUrl} alt="QR Code for 2FA" className="mx-auto" />
            </>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Enter OTP from your Authenticator App:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm/6"
              />
              {error && error.includes("OTP") && (
                <div className="text-xs text-red-500 mt-1">{error}</div>
              )}
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

export default SignInForm;
