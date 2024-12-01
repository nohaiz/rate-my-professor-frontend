import { useState } from 'react'
import { Route, Routes } from 'react-router-dom';

import './App.css'

//  IMPORTED MODULES
import Navbar from './components/Navbar';
import Home from './pages/home/Home';

//  SERVICES
import AuthServices from '../services/AuthServices'

function App() {

  const [user, setUser] = useState(AuthServices.getUser());

  const handleSignout = () => {
    AuthServices.signout();
    setUser(null);
  };

  return (
    <>
      <Navbar user={user} handleSignout={handleSignout} />
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
    </>
  )
}

export default App
