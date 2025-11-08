import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useUser } from "../utils/userContext";

const Drawer = ({ page, setPage }) => {
  const [isDrawOpen, setIsDrawOpen] = useState(false);
  const drawerRef = useRef(null);
  const buttonRef = useRef(null);
  const { user } = useUser();
  const menuItems = user
    ? ["Home", "Collection", "Packs", "Account", "Leaderboard", "Logout"]
    : ["Home", "Collection", "Packs", "Leaderboard", "Account"];
  const drawerWidth = 256; // 16rem
  const topOffset = 160; // tailwind's top-40 = 10rem = 160px

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDrawOpen(false);
      }
    };

    if (isDrawOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    if (page === "logout") {
      handleLogout();
    }
  }, [page]);

  return (
    <motion.div
      animate={{ x: isDrawOpen ? 0 : -drawerWidth }}
      initial={{ x: -drawerWidth }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed left-0 z-50 flex"
      style={{
        top: topOffset,
        height: "24rem",
      }}
    >
      <div
        ref={drawerRef}
        className="w-[16rem] h-full bg-white pl-12 rounded-tr-2xl rounded-br-2xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] relative"
      >
        <ul className="flex flex-col justify-evenly relative z-50 items-start h-full w-full text-3xl font-bitcount">
          {menuItems.map((item, i) => (
            <li
              key={i}
              className="hover:border-b border-dotted transition   cursor-target"
              onClick={() => {
                setIsDrawOpen(false);
                if (item === "Home") {
                  setPage("index");
                } else if (item === "Collection") {
                  setPage("collection");
                } else if (item === "Packs") {
                  setPage("packs");
                } else if (item === "Account") {
                  setPage("account");
                } else if (item === "Logout") {
                  setPage("logout");
                } else if (item === "Leaderboard") {
                  setPage("leaderboard");
                }
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={buttonRef}
        onClick={() => setIsDrawOpen(!isDrawOpen)}
        className="cursor-target flex items-center relative z-40 top-36 justify-center w-12 h-20 bg-white   rounded-tr-lg rounded-br-lg shadow-[5px_3px_10px_rgb(0,0,0,0.2)]"
      >
        <div className="rotate-90 font-bitcount ">menu</div>
      </div>
    </motion.div>
  );
};

export default Drawer;
