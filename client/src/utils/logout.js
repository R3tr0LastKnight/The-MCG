import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // adjust path if firebase.js is elsewhere

export const logout = async (setUser) => {
  try {
    await signOut(auth); // Firebase session logout
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (setUser) setUser(null); // reset React state if passed

    console.log(" Logged out successfully");
    window.location.href = "/"; // optional redirect
  } catch (err) {
    console.error(" Error logging out:", err);
  }
};
