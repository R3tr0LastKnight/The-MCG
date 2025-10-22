import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { isLoggedIn } from "../utils/auth";
import { Progress } from "./ui/Progress.tsx";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import { useUser } from "../utils/userContext";
import axios from "axios";

const Nav = () => {
  const [login, setLogin] = useState(isLoggedIn());
  const [user, setUser] = useState(null);
  const { logIn } = useUser();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLogin(true);
    } else {
      setUser(null);
      setLogin(false);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      let result;

      // 1. Try popup first (works on desktop)
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        console.warn("Popup failed, falling back to redirect:", popupError);
        await signInWithRedirect(auth, googleProvider);
        return; // redirect will reload the page, so stop here
      }

      // 2. Get user info (popup success case)
      const user = result.user;

      const userData = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
      };

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setLogin(true);
        console.log("Logged in user:", data.user);
      }
    } catch (err) {
      console.error("Google login error:", err);
    }
    window.location.reload();
  };

  // 🔹 After page reload (in App.js or a top-level component):
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const user = result.user;
        const userData = {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          uid: user.uid,
        };

        const res = await fetch(
          "https://myspotifymcgtestretro.loca.lt/api/users/google-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );

        const data = await res.json();

        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          setLogin(true);
          console.log("Redirect login success:", data.user);
        }
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-between w-screen px-4 !lg:max-h-[10vh] py-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <div
        onClick={() => window.location.reload()}
        className="text-5xl font- font-bitcount   w-1/2"
      >
        <div className="cursor-target w-fit">The MCG</div>
      </div>
      <div className="flex flex-col lg:flex-row lg:mr-4 items-center gap-1 lg:gap-4 ">
        {login && user ? (
          <>
            <div className="flex">
              {user.photo ? (
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src={user.photo}
                    alt="User profile"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-10 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col text-sm">
              <div className="text-center">{user.name}</div>
              <div className="flex  gap-2 items-center">
                <div>lvl {user.level}</div>
                <div className="w-20">
                  <Progress
                    value={user.exp / 10}
                    className="bg-white border [&>div]:bg-black transition-all duration-1000 ease-out"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={handleGoogleLogin}
            className="border border-black rounded-xl   hover:bg-black hover:text-white group hover:shadow-[0_4px_10px_rgb(0,0,0,0.4)] cursor-target"
          >
            <div className="flex justify-center items-center gap-2 py-1 px-2 ">
              Google Login
              {/* google icon svg unchanged */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="25"
                height="25"
                viewBox="0 0 48 48"
                className="group-hover:invert"
              >
                <path d="M37.62 9.38L34.7 12.3c-1.47 1.47-3.7 1.75-5.58.85C27.57 12.41 25.84 12 24 12c-3.96 0-7.47 1.91-9.65 4.87l-6.44-4.73C11.53 7.2 17.39 4 24 4 29.27 4 34.05 6.05 37.62 9.38zM35 40.7c-3.16 2.09-6.93 3.3-11 3.3-6.7 0-12.62-3.29-16.23-8.34l6.33-4.88C16.26 33.93 19.88 36 24 36c1.57 0 3.06-.3 4.43-.86L35 40.7zM12 24c0 1.43.25 2.79.71 4.06L6.2 33.08v.03C4.79 30.38 4 27.28 4 24c0-3.36.83-6.53 2.31-9.31l6.56 4.81C12.31 20.89 12 22.41 12 24zM44 24c0 5.88-2.55 11.18-6.59 14.83 0-.01 0-.01 0-.02l-6.19-5.24c1.86-1.4 3.29-3.33 4.08-5.57H28c-2.209 0-4-1.791-4-4v-4h19.61C43.86 21.27 44 22.66 44 24z"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
