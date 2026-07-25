import React from "react";
import { IoMdSearch } from "react-icons/io";

import { useCC } from "../../context/Context";

export const Users = () => {
  const {
    users,
    username,
    onlineUsers,
    setCurrentUser,
    currentUser,
    handleDropdown,
    dropDown,
    newGroup,
    loginUser,
    avatarShapeClass,
  } = useCC();
  return (
    <div className="flex flex-col gap-y-2">
      {/* middle section */}
      <div className="relative rounded-xl bg-input-bg text-text-base border border-border-color py-2">
        <input
          type="text"
          placeholder="search users..."
          className="pl-10 pr-4 focus:outline-none w-full bg-transparent text-text-base placeholder-text-dim"
        />
        <IoMdSearch
          size={18}
          className="absolute text-text-muted top-[11px] left-3"
        />
      </div>

      {/* lower section */}
      <div className="flex gap-x-4 text-sm font-semibold text-text-muted pb-1 ">
        <button className="hover:cursor-pointer text-primary border-primary">
          All
        </button>
        <button className="hover:cursor-pointer">Active</button>
      </div>

      <div className="flex flex-col gap-y-1 flex-1 overflow-y-auto ">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex justify-between items-center hover:bg-sidebar-hover p-1 rounded-xl hover:cursor-pointer transition-all duration-100"
          >
            <div className="flex gap-x-3">
              <div className="relative  leading-tight">
                <img
                  src={user.profileImage}
                  alt=""
                  className={`h-12 w-12 object-cover border border-primary ${avatarShapeClass}`}
                />
                <div className="absolute top-8   right-0 flex items-center gap-2">
                  <span
                    className={`h-3 w-3  rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500 border-2 border-sidebar" : "bg-text-dim border-2 border-sidebar"}`}
                  ></span>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">{user.username}</p>
                <p className="text-sm">Bio: This is my bio</p>
              </div>
            </div>
            {/* <button className="rounded  bg-violet-700 text-white">Add to chat</button> */}
          </div>
        ))}
      </div>
    </div>
  );
};
