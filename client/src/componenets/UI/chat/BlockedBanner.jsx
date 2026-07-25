import React from "react";
import { CgUnblock } from "react-icons/cg";

export const BlockedBanner = ({ loginUser, user, unBlockUser }) => {
  if (loginUser?.blocked?.includes(user?._id)) {
    return (
      <div className="flex gap-x-5 justify-center items-center px-4 py-4 bg-surface text-text-base border-t border-border-color">
        <div className="flex gap-x-1">
          <p>You blocked</p>
          <p className="font-semibold">{user?.username}</p>
        </div>
        <button
          onClick={() => unBlockUser(user?._id)}
          className="flex gap-x-1 items-center px-3 py-1 bg-surface-2 text-text-base rounded-2xl hover:cursor-pointer hover:bg-sidebar-hover"
        >
          <CgUnblock />
          <p>Unblock</p>
        </button>
      </div>
    );
  }

  if (loginUser?.blockedBy?.includes(user?._id)) {
    return (
      <div className="flex gap-x-5 justify-center items-center px-4 py-5 bg-surface text-text-muted border-t border-border-color">
        <div className="flex gap-x-1">
          <p className="font-semibold">{user?.username}</p>
          <p>blocked you</p>
        </div>
      </div>
    );
  }

  return null;
};
