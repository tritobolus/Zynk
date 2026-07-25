import React from "react";
import { IoMdClose } from "react-icons/io";
import { useCC } from "../../context/Context";
import { MdEmail } from "react-icons/md";
import { MdBlock } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CgUnblock } from "react-icons/cg";

import axios from "axios";
import { BACKEND_URL } from "../../constants";
import { useEffect } from "react";

export const Profile = ({ setShowProfile, user }) => {
  const { onlineUsers, userId, users, loginUser, avatarShapeClass } = useCC();

  const blockUser = async (blockId) => {
    try {
      const res = await axios.post(BACKEND_URL + "/user/blockUser", {
        blockById: loginUser?._id,
        blockId: blockId,
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const unBlockUser = async (blockId) => {
    try {
      const res = await axios.post(BACKEND_URL + "/user/unblockUser", {
        unBlockById: loginUser?._id,
        unBlockId: blockId,
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className="flex flex-col gap-y-8 rouned text-text-base bg-sidebar h-screen w-85 shadow-2xl p-4 py-6 transition-all duration-500"
      >
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">User Info</p>

          <IoMdClose
            className="hover:cursor-pointer"
            onClick={() => setShowProfile(false)}
            size={20}
          />
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <div className="relative flex flex-col leading-tight">
            <img
              src={user.profileImage}
              alt=""
              className={`h-40 w-40 object-cover overflow-hidden border border-primary ${avatarShapeClass}`}
            />
            <div className="absolute top-29 right-2 flex items-center gap-2">
              <span
                className={`h-6 w-6  rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500 border-3 border-sidebar" : "bg-text-dim border-3 border-sidebar"}`}
              ></span>
            </div>
          </div>
          <p className="text-2xl font-semibold">{user.username}</p>
        </div>

        {/* BIO */}
        <div className="flex flex-col gap-y-1">
          <p className="text-primary text-md font-semibold">Bio</p>
          <p>{user.bio}</p>
        </div>

        {/* contacts */}
        <div className="">
          <div className="flex gap-x-3 items-center">
            <MdEmail size={20} className="text-primary" />
            <p>{user.email}</p>
          </div>
        </div>

        {/* others*/}
        <div className="flex flex-col gap-y-1">
          {loginUser?.blocked?.includes(user._id) ? (
            <div
              onClick={() => unBlockUser(user._id)}
              className="flex gap-x-3 items-center rounded-md p-1 hover:bg-sidebar-hover hover:cursor-pointer"
            >
              <CgUnblock size={20} className="text-text-muted" />
              <p className="text-text-muted">Unblock User</p>
            </div>
          ) : loginUser?.blockedBy?.includes(user._id) ? (
            <div
              className="hover:bg-sidebar-hover flex gap-x-3 p-1 items-center"
            >
              <MdBlock size={20} />
              <div className="flex gap-x-1">
                <p>{user.username}</p>
                <p>blocked you</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => blockUser(user._id)}
              className="flex gap-x-3 items-center rounded-md p-1 hover:bg-sidebar-hover hover:cursor-pointer"
            >
              <MdBlock size={20} className="text-red-500" />
              <p className="text-red-500">Block User</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
