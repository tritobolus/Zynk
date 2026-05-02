import React from "react";
import { Body } from "../componenets/Body";
// import { Body } from "../componenets/body";

import { useCC } from "../context/Context";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { socket } from "../socket/socket";

//this is the layout of this project....
export const Layout = () => {
  const [loading, setLoading] = useState(false);

  const {
    checkAuth,
    auth,
    getUsers,
    setOnlineUsers,
    onlineUsers,
    loginUser,
    setCurrentRightWindow,
    users,
    setUsers,
    setLoginUser,
  } = useCC();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth === false) {
      navigate("/signin");
    }
  }, [auth]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await checkAuth();
      await getUsers();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (loginUser?.activestatus == true) {
      socket.emit("user-online", loginUser._id);
    }
    if (loginUser?.activestatus == false) {
      socket.emit("user-offline", loginUser._id);
    }
  }, [loginUser?.activestatus]);

  useEffect(() => {
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  // update my state when i block any one
  useEffect(() => {
    const handleBlocked = ({ blockId }) => {
      console.log("IBlockedUser received:", blockId);

      setLoginUser((prev) => ({
        ...prev,
        blocked: [...prev.blocked, blockId],
      }));
    };

    socket.on("IBlockedUser", handleBlocked);

    return () => {
      socket.off("IBlockedUser", handleBlocked);
    };
  }, []);

  // update my state when i unblock any one
  useEffect(() => {
    const handleUnblocked = ({ unBlockId }) => {
      console.log("IUnBlockedUser received:", unBlockId);

      setLoginUser((prev) => ({
        ...prev,
        blocked: (prev.blocked || []).filter((id) => id !== unBlockId),
      }));
    };

    socket.on("IUnBlockedUser", handleUnblocked);

    return () => {
      socket.off("IUnBlockedUser", handleUnblocked);
    };
  }, []);

  // update user's state when user blocked by someone
  useEffect(() => {
    const handleYouAreBlocked = ({ blockById, blockId }) => {
      console.log("youAreBlocked received:", blockById, blockId);

      // update loginUser
      setLoginUser((prev) => {
        if (!prev) return prev;

        if (prev._id === blockId) {
          return {
            ...prev,
            blockedBy: [...(prev.blockedBy || []), blockById],
          };
        }
        return prev;
      });
    };

    socket.on("youAreBlocked", handleYouAreBlocked);

    return () => {
      socket.off("youAreBlocked", handleYouAreBlocked);
    };
  }, []);

 // update user's state when user is UNBLOCKED by someone
useEffect(() => {
  const handleYouAreUnBlocked = ({ unBlockById, unBlockId }) => {
    console.log("youAreUnBlocked received:", unBlockById, unBlockId);

    setLoginUser((prev) => {
      if (!prev) return prev;

      if (prev._id === unBlockId) {
        return {
          ...prev,
          //  remove from blockedBy
          blockedBy: (prev.blockedBy || []).filter(
            (id) => id !== unBlockById
          ),
        };
      }
      return prev;
    });
  };

  socket.on("youAreUnBlocked", handleYouAreUnBlocked);

  return () => {
    socket.off("youAreUnBlocked", handleYouAreUnBlocked);
  };
}, []);

  return (
    <>
      <div className=" h-screen ">
        <Body />
      </div>
    </>
  );
};
