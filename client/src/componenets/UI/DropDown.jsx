import React from "react";
import { MdGroupAdd } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { IoIosLogOut } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { useState } from "react";
import { NewGroup } from "./NewGroup";
import { useCC } from "../../context/Context";

import axios from "axios";
import { IoLogInOutline } from "react-icons/io5";
import { BACKEND_URL } from "../../constants";

export const DropDown = () => {
  const {
    users,
    username,
    onlineUsers,
    setCurrentUser,
    currentUser,
    handleDropdown,
    dropDown,
    newGroup,
    handleNewGroup,
    handleSettings,
    settings,
    setSettings,
    loginUser,
  } = useCC();

  const logout = async () => {
    try {
      const res = await axios.delete(BACKEND_URL + `/authentication/signout`, {
        withCredentials: true,
      });
      console.log(res);
      window.location.reload();
    } catch (error) {
      alert("Logout failed");
      console.log(error);
      // toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div
        className="relative flex flex-col gap-y-2 w-35 shadow-md bg-surface text-text-base border border-border-color p-2 rounded-lg text-sm animation"
      >
        <div
          onClick={() => handleNewGroup()}
          className="flex gap-x-2 items-center justify-start hover:cursor-pointer p-1 rounded hover:bg-sidebar-hover"
        >
          <MdGroupAdd size={16} />
          <p>New group</p>
        </div>
        <div
          onClick={() => handleSettings()}
          className="flex gap-x-2 items-center justify-start hover:cursor-pointer p-1 rounded hover:bg-sidebar-hover"
        >
          <IoMdSettings size={16} />
          <p>Settings</p>
        </div>
        <div
          onClick={() => logout()}
          className="flex gap-x-2 items-center justify-start hover:cursor-pointer p-1 rounded text-red-500 border-t border-border-color pt-2"
        >
          <IoIosLogOut size={16} />
          <p>Log out</p>
        </div>
      </div>
    </>
  );
};
