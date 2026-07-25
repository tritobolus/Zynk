import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../constants";

export const Context = createContext();

export const getAvatarShapeClass = (shape) => {
  switch (shape) {
    case "circle":
      return "rounded-full";
    case "squircle":
      return "rounded-2xl";
    case "blob2":
      return "rounded-[60%_40%_30%_70%/60%_30%_70%_40%]";
    case "teardrop":
      return "rounded-[0%_100%_100%_100%]";
    case "wobbly":
    default:
      return "rounded-[40%_60%_60%_40%/60%_40%_60%_40%]";
  }
};

export const ContextProvider = ({ children }) => {
  // my details
  const [auth, setAuth] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [chatId, setChatId] = useState("");

  // other details
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRightWindow, setCurrentRightWindow] = useState("");
  const [currentRightWindowType, setCurrentRightWindowType] = useState("");

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lastPrivateChats, setLastPrivateChats] = useState([]);
  const [lastGroupChats, setLastGroupChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loginUser, setLoginUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  const avatarShapeClass = getAvatarShapeClass(loginUser?.avatarShape || "wobbly");

  // for dropdown
  const [newGroup, setNewGroup] = useState(false);
  const [settings, setSettings] = useState(false);
  const [dropDown, setDropDown] = useState(false);

  // search query
  const [query, setQuery] = useState("");

  // get all messages when user login for the first time
  const getLastChats = async () => {
    try {
      if (!userId) return;
      const res = await axios.get(BACKEND_URL + "/message/getLastChats", {
        params: {
          userId: userId,
        },
      });
      setLastPrivateChats(res.data.privateChats);
      setLastGroupChats(res.data.groupChats);
      if (res.data.unreadCounts) {
        setUnreadCounts(res.data.unreadCounts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLastChats();
  }, [userId]);

  // Apply theme class to :root whenever loginUser changes
  useEffect(() => {
    const themes = ["theme-violet", "theme-midnight", "theme-emerald", "theme-ocean", "theme-sunset"];
    themes.forEach((t) => document.documentElement.classList.remove(t));
    const userTheme = loginUser?.theme || "violet";
    document.documentElement.classList.add(`theme-${userTheme}`);
  }, [loginUser?.theme]);

  // for dropdown
  const handleNewGroup = () => {
    if (newGroup) {
      setNewGroup(false);
    } else {
      setDropDown(false);
      setNewGroup(true);
    }
  };

  const handleSettings = () => {
    if (settings) {
      setSettings(false);
    } else {
      setDropDown(false);
      setSettings(true);
    }
  };

  const handleDropdown = () => {
    if (dropDown) {
      setDropDown(false);
    } else {
      setDropDown(true);
      setNewGroup(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get(BACKEND_URL + `/authentication/verify`, {
        withCredentials: true,
      });
      if (res.data.message === "Success") {
        setAuth(true);
        setUserId(res.data.userId);
        setEmail(res.data.email);
        setUsername(res.data.username);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.log(error);
      setAuth(false);
    }
  };

  const getUsers = async () => {
    try {
      const res = await axios.get(BACKEND_URL + "/user/getuser");
      setUsers(res.data.users);
      setLoginUser(res.data.users.find((u) => u._id == userId));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId) {
      getUsers();
    }
  }, [userId]);

  const getGroups = async () => {
    try {
      const res = await axios.get(BACKEND_URL + "/group/getGroups");
      setGroups(res.data.groupdata);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <Context.Provider
      value={{
        auth,
        userId,
        email,
        username,
        checkAuth,
        getUsers,
        getGroups,
        users,
        setUsers,
        setOnlineUsers,
        onlineUsers,
        setCurrentRightWindow,
        currentRightWindow,
        setCurrentRightWindowType,
        currentRightWindowType,
        handleNewGroup,
        handleDropdown,
        setDropDown,
        dropDown,
        setNewGroup,
        newGroup,
        handleSettings,
        settings,
        setSettings,
        loginUser,
        setLoginUser,
        groups,
        setGroups,
        lastPrivateChats,
        setLastPrivateChats,
        lastGroupChats,
        setLastGroupChats,
        unreadCounts,
        setUnreadCounts,
        chatId,
        setChatId,
        query,
        setQuery,
        typingUsers,
        setTypingUsers,
        avatarShapeClass,
      }}
    >
      {children}
    </Context.Provider>
  );
};

// custom hook
export const useCC = () => useContext(Context);
