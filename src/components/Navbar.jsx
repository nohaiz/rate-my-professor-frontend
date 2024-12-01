import { Link } from "react-router-dom";

const Navbar = ({ user, handleSignout }) => {

  return (
    <>
      {user ?
        <>
          <Link to="/">Home</Link>
          <Link to="/auth/sign-in">Sign In</Link>
          <Link to="/auth/sign-up">Sign Up</Link>
        </>
        :
        <>
          <Link to="/">Sign Out</Link>
        </>
      }
    </>
  )
}

export default Navbar;