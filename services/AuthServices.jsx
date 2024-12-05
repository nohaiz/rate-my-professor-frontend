const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const getUser = () => {

  try {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const rawPayload = token.split(".")[1];
    const jsonPayload = window.atob(rawPayload);
    const user = JSON.parse(jsonPayload);

    if (isTokenExpired(user.exp)) {
      signout();
      return null;
    }
    console.log(user)
    return user;
  } catch (err) {
    console.error("Error retrieving user:", err);
    return null;
  }
};

const isTokenExpired = (exp) => {
  const expired = Date.now() >= exp * 1000;
  return expired;
};

const signup = async (formData) => {

  try {
    const res = await fetch(`${BASE_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }
    return json;
  } catch (err) {
    throw err;
  }
};

const signin = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email, password),
    });

    const json = await res.json();
    console.log(json)
    if (json.error) {
      throw new Error(json.error);
    }
    if (json.token) {
      localStorage.setItem("token", json.token);
      return json;
    }
    return json
  } catch (err) {
    console.error("Signin error:", err);
    throw err;
  }
};


const signout = () => {
  window.localStorage.removeItem("token");
};

const verifyOtp = async (email, otp) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.error) {
      throw new Error(json.error);
    }

    if (json.tokenCreated) {
      localStorage.setItem("token", json.tokenCreated);
      return json;
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    throw err;
  }
};

export default { getUser, signup, signin, signout, verifyOtp };
