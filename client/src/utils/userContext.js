import { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // ✅ Add cardCount state
  const [cardCount, setCardCount] = useState(
    Number(localStorage.getItem("cardCount")) || 0
  );

  const logIn = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCardCount(0);
    localStorage.removeItem("cardCount");
  };

  // ✅ Whenever cardCount updates -> save to localStorage
  const updateCardCount = (count) => {
    setCardCount(count);
    localStorage.setItem("cardCount", count);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logIn,
        logOut,
        cardCount, // ✅ export cardCount
        setCardCount: updateCardCount, // ✅ export cardCount setter
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
