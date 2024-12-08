import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';

import './App.css'

//  IMPORTED MODULES
import Navbar from './components/Navbar';
import Home from './pages/home/Home';

import Institute from './pages/institute/Institute';
import Professor from './pages/professor/Professor';
import SignInForm from './pages/auth/SignInForm';
import SignUpForm from './pages/auth/SignUpForm';

import StudentProfile from './pages/profile/Student/StudentProfile';
import ProfessorProfile from './pages/profile/Professor/ProfessorProfile';
import AdminProfile from './pages/profile/Admin/AdminProfile';

//  SERVICES
import AuthServices from '../services/AuthServices'

function App() {

  const [user, setUser] = useState(AuthServices.getUser());
  const navigate = useNavigate();

  const handleSignout = () => {
    AuthServices.signout();
    setUser(null);
    navigate('/')
  };

  return (
    <>
      <Navbar user={user} handleSignout={handleSignout} />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path='/' element={<Home />} />
        <Route path='/institutes' element={<Institute />}></Route>
        <Route path='/professors' element={<Professor />}></Route>
        <Route path='auth/sign-in' element={<SignInForm />}></Route>
        <Route path='auth/sign-up' element={<SignUpForm />}></Route>
        {/* PRIVATE ROUTES */}
        {user ? (
          user.role === "student" ? (
            <Route path="/profile/:id" element={<StudentProfile handleSignout={handleSignout} />} />
          ) : user.role === "professor" ? (
            <Route path="/profile/:id" element={<ProfessorProfile handleSignout={handleSignout} />} />
          ) : (
            <Route path="/dashboard/:id" element={<AdminProfile handleSignout={handleSignout} />} />
          )
        ) : <></>}

      </Routes >
    </>
  )
}

export default App
