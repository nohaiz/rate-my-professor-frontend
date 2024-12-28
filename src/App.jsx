import { useState, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';

import './App.css'

//  IMPORTED MODULES
import Navbar from './components/Navbar';
import Home from './pages/home/Home';

import Institute from './pages/institute/InstituteList';
import Professor from './pages/professor/ProfessorList';
import SignInForm from './pages/auth/SignInForm';
import SignUpForm from './pages/auth/SignUpForm';

import StudentProfile from './pages/dashboard/Student/StudentProfile';
import ProfessorProfile from './pages/dashboard/Professor/ProfessorProfile';
import AdminProfile from './pages/dashboard/Admin/AdminProfile';

import ProfessorDetails from './pages/professor/ProfessorDetails';
import ProfessorReviewForm from './pages/professor/ProfessorReviewForm';

import InstituteDetails from './pages/institute/InstituteDetails';

import Notification from './pages/notifications/Notifications';

//  SERVICES
import AuthServices from '../services/AuthServices'
import NotificationService from "../services/NotificationService";


function App() {

  const [user, setUser] = useState(AuthServices.getUser());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(null)
  const navigate = useNavigate();

  const handleSignout = () => {
    AuthServices.signout();
    setUser(null);
    navigate('/')
  };

  const fetchNotifications = async () => {
    const response = await NotificationService.getUserNotifications(user.Id);
    setUnreadCount(response.notifications.filter(notification => !notification.isRead).length);
    if (response?.notifications) {
      setNotifications(response.notifications);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <>
      <Navbar user={user} handleSignout={handleSignout} unreadCount={unreadCount} />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path='/' element={<Home user={user} />} />
        <Route path='/institutes' element={<Institute user={user} />}></Route>
        <Route path='/professors' element={<Professor user={user} />}></Route>
        <Route path='/institutions/:id' element={<InstituteDetails />}></Route>
        <Route path="/professors/:id" element={<ProfessorDetails user={user} />} >
          {user?.role === "student" ? (
            <Route path="review" element={<ProfessorReviewForm />} />
          ) : (
            <Route path="review" element={<h2 className='ml-8 mb-8'>Unauthorized Access To Review</h2>} />
          )}
        </Route>
        <Route path='auth/sign-in' element={<SignInForm />}></Route>
        <Route path='auth/sign-up' element={<SignUpForm />}></Route>
        {/* PRIVATE ROUTES */}
        {user ? (
          <>
            {user.role === "student" ? (
              <Route path="/profile/:id" element={<StudentProfile handleSignout={handleSignout} user={user} />} />
            ) : user.role === "professor" ? (
              <Route path="/profile/:id" element={<ProfessorProfile handleSignout={handleSignout} user={user} />} />
            ) : (
              <Route path="/dashboard/:id" element={<AdminProfile handleSignout={handleSignout} user={user} />} />
            )}
            <Route path='notifications' element={<Notification user={user} setUnreadCount={setUnreadCount} fetchNotifications={fetchNotifications} notifications={notifications} setNotifications={setNotifications} />} />
          </>
        ) : (
          <></>
        )}
      </Routes >
    </>
  )
}

export default App
