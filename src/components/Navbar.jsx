import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = ({ user, handleSignout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white">
      <nav className="mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Rate My Professor</span>
            <h1 className="text-base font-semibold text-gray-900">Rate My Professor</h1>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center space-x-8">
          <Link
            to="/institution"
            className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Institution
          </Link>
          <Link
            to="/professor"
            className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Professor
          </Link>
          <Link
            to="/profile"
            className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Profile
          </Link>
          <Link
            to="/dashboard"
            className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Dashboard
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end space-x-4">
          {user ? (
            <button
              onClick={handleSignout}
              className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link
                to="/auth/sign-in"
                className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/auth/sign-up"
                className="text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div
        className={`lg:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
          <Link
            to="/institution"
            className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Institution
          </Link>
          <Link
            to="/professor"
            className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Professor
          </Link>
          <Link
            to="/profile"
            className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Profile
          </Link>
          <Link
            to="/dashboard"
            className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
          >
            Dashboard
          </Link>
        </div>

        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3 border-t border-gray-200">
          {user ? (
            <button
              onClick={handleSignout}
              className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link
                to="/auth/sign-in"
                className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/auth/sign-up"
                className="block w-full text-left text-base font-semibold text-gray-900 hover:text-indigo-300 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
