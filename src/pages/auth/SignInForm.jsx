import React, { useState } from "react";
import AuthServices from "../../../services/AuthServices";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otp, setOtp] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

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
      setError("Error: " + err.message);
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
      setError("Invalid OTP or error: " + err.message);
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
          >
            Sign In
          </button>
        </form>
      ) : (
        <div className="space-y-6 mt-6">
          {qrCodeUrl === '' ?
            <></>
            :
            <>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Scan the QR Code to Set Up Google Authenticator</h3>
              <img src={qrCodeUrl} alt="QR Code for 2FA" className="mx-auto" />
            </>
          }

          <form onSubmit={handleOtpSubmit} className="space-y-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Enter OTP from your Authenticator App:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
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
