import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

interface LoginContextType {
  isLoggedIn: boolean;
  logIn: (username: string, password: string) => boolean;
  logOut: () => void;
}

const defaultLoginContext: LoginContextType = {
  isLoggedIn: false,
  logIn: () => false,
  logOut: () => {},
};

const LoginContext = createContext<LoginContextType>(defaultLoginContext);

interface LoginProviderProps {
  children?: ReactNode;
}

const USER_NAME = "ADMIN";
const PASSWORD = "ADMIN";
const LAST_LOGIN_TIME_KEY = "lastLoginTime"; // Key for localStorage

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Function to log in and save login timestamp to localStorage
  const logIn = (username: string, password: string) => {
    if (username === USER_NAME && password === PASSWORD) {
      const currentTime = new Date().getTime();
      localStorage.setItem(LAST_LOGIN_TIME_KEY, currentTime.toString()); // Save current time
      setIsLoggedIn(true);
      return true;
    } else {
      return false;
    }
  };

  // Function to log out and clear login timestamp from localStorage
  const logOut = () => {
    localStorage.removeItem(LAST_LOGIN_TIME_KEY);
    setIsLoggedIn(false);
  };

  // Function to check if the user is logged in within the last 24 hours
  const checkLoginStatus = () => {
    const lastLogin = localStorage.getItem(LAST_LOGIN_TIME_KEY);
    if (lastLogin) {
      const currentTime = new Date().getTime();
      const loginTime = new Date(parseInt(lastLogin)).getTime();
      const diffInHours = (currentTime - loginTime) / (1000 * 60 * 60);
      if (diffInHours < 24) {
        setIsLoggedIn(true); // Logged in within the last 24 hours
      } else {
        localStorage.removeItem(LAST_LOGIN_TIME_KEY); // Clear the login timestamp if expired
        setIsLoggedIn(false);
      }
    }
  };

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        logIn,
        logOut,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};

export default LoginContext;
