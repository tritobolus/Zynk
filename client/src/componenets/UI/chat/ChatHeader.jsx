import React, { useState, useRef, useEffect } from "react";
import {
  IoSearchOutline,
  IoCloseOutline,
  IoEllipsisVertical,
  IoLogOutOutline,
} from "react-icons/io5";
import { MdBlock } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { useCC } from "../../../context/Context";
import axios from "axios";
import { BACKEND_URL } from "../../../constants";

export const ChatHeader = ({
  user,
  currentRightWindowType,
  onlineUsers,
  users,
  loginUser,
  showProfile,
  setShowProfile,
  isSearchOpen,
  setIsSearchOpen,
  searchMessageQuery,
  setSearchMessageQuery,
}) => {
  const { setLoginUser, setGroups, setCurrentRightWindow, setCurrentRightWindowType, userId, typingUsers, avatarShapeClass } = useCC();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [leavingGroup, setLeavingGroup] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showMenu]);

  const blockUser = async (blockId) => {
    try {
      await axios.post(BACKEND_URL + "/user/blockUser", {
        blockById: loginUser?._id,
        blockId: blockId,
      });
      // Optimistically update local loginUser state
      setLoginUser((prev) => ({
        ...prev,
        blocked: [...(prev.blocked || []), blockId],
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const unBlockUser = async (blockId) => {
    try {
      await axios.post(BACKEND_URL + "/user/unblockUser", {
        unBlockById: loginUser?._id,
        unBlockId: blockId,
      });
      // Optimistically update local loginUser state
      setLoginUser((prev) => ({
        ...prev,
        blocked: (prev.blocked || []).filter((id) => id !== blockId),
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const isBlocked = loginUser?.blocked?.includes(user?._id);
  const blockedByThem = loginUser?.blockedBy?.includes(user?._id);

  const leaveGroup = async () => {
    if (leavingGroup) return;
    const confirm = window.confirm(`Are you sure you want to leave "${user?.groupName}"?`);
    if (!confirm) return;
    try {
      setLeavingGroup(true);
      await axios.patch(BACKEND_URL + "/group/removeMemeber", {
        removeMemberId: userId,
        groupId: user._id,
      });
      // Optimistically remove group from local state
      setGroups((prev) => prev.filter((g) => g._id !== user._id));
      setCurrentRightWindow(null);
      setCurrentRightWindowType(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLeavingGroup(false);
      setShowMenu(false);
    }
  };

  // Determine typing status
  const isTyping = currentRightWindowType === "private" && typingUsers[user?._id]?.isTyping;
  const groupTyping = currentRightWindowType === "group" && (typingUsers[user?._id] || {});
  const typingNames = Object.values(groupTyping)
    .filter((u) => u.isTyping)
    .map((u) => u.username);
  const isGroupTyping = typingNames.length > 0;

  return (
    <div
      className="flex justify-between items-center bg-surface border-border-color border-b-2 shadow-xl p-2 transition-all duration-500"
    >
      {/* Left: Avatar + Name + Status */}
      <div
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center gap-x-2 hover:cursor-pointer"
      >
        <img
          src={user?.profileImage}
          alt=""
          className={`h-12 w-12 object-cover overflow-hidden hover:scale-105 transition border border-primary ${avatarShapeClass}`}
        />
        <div className="flex flex-col leading-tight">
          <p
            className="text-text-base font-bold transition-all duration-500"
          >
            {currentRightWindowType === "private"
              ? user?.username
              : user?.groupName}
          </p>
          {currentRightWindowType === "private" ? (
            <div className="text-sm">
              {isTyping ? (
                <p className="text-emerald-500 font-medium italic">typing...</p>
              ) : onlineUsers?.includes(user?._id) ? (
                <p className="text-green-500">Online</p>
              ) : (
                <p className="text-text-muted">Offline</p>
              )}
            </div>
          ) : (
            <div className="text-sm">
              {isGroupTyping ? (
                <p className="text-emerald-500 font-medium italic">
                  {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing...
                </p>
              ) : (
                <div
                  className="text-sm flex gap-x-1 text-text-base animation"
                >
                  {user?.members?.map((memberId) => {
                    const member = users?.find((u) => u._id === memberId);
                    return <p key={memberId}>{member?.username},</p>;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Search + 3-dot menu */}
      <div className="flex items-center gap-x-1 pr-1">
        {/* Search Input (slides in) */}
        <div
          className={`flex items-center transition-all duration-300 ${
            isSearchOpen ? "w-48 opacity-100" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          <input
            type="text"
            placeholder="Search messages..."
            value={searchMessageQuery}
            onChange={(e) => setSearchMessageQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-full text-sm outline-none bg-input-bg text-text-base placeholder-text-dim border border-border-color focus:border-primary"
          />
        </div>

        {/* Search Toggle */}
        <button
          onClick={() => {
            if (isSearchOpen) setSearchMessageQuery("");
            setIsSearchOpen(!isSearchOpen);
          }}
          className="p-2 rounded-full transition-colors hover:bg-sidebar-hover text-text-base"
          title="Search messages"
        >
          {isSearchOpen ? (
            <IoCloseOutline size={20} />
          ) : (
            <IoSearchOutline size={20} />
          )}
        </button>

        {/* 3-dot vertical menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-2 rounded-full transition-colors hover:bg-sidebar-hover text-text-base"
            title="More options"
          >
            <IoEllipsisVertical size={20} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-10 z-50 w-48 rounded-xl shadow-xl border py-1 text-sm bg-surface border-border-color text-text-base"
            >
              {/* Private chat options */}
              {currentRightWindowType === "private" && (
                blockedByThem ? (
                  <div className="px-4 py-2.5 text-gray-400 text-xs">
                    {user?.username} blocked you
                  </div>
                ) : isBlocked ? (
                  <button
                    onClick={() => { unBlockUser(user._id); setShowMenu(false); }}
                    className="flex items-center gap-x-2 w-full px-4 py-2.5 transition cursor-pointer hover:bg-sidebar-hover"
                  >
                    <CgUnblock size={16} className="text-gray-500" />
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => { blockUser(user._id); setShowMenu(false); }}
                    className="flex items-center gap-x-2 w-full px-4 py-2.5 transition cursor-pointer hover:bg-sidebar-hover"
                  >
                    <MdBlock size={16} className="text-red-500" />
                    <span className="text-red-500">Block User</span>
                  </button>
                )
              )}

              {/* Group chat options */}
              {currentRightWindowType === "group" && (
                <button
                  onClick={leaveGroup}
                  disabled={leavingGroup}
                  className={`flex items-center gap-x-2 w-full px-4 py-2.5 transition cursor-pointer hover:bg-sidebar-hover ${leavingGroup ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <IoLogOutOutline size={16} className="text-red-500" />
                  <span className="text-red-500">
                    {leavingGroup ? "Leaving..." : "Leave Group"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
