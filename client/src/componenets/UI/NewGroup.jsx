import React, { useState } from "react";
import { useCC } from "../../context/Context";
import { IoMdSearch } from "react-icons/io";

import { SearchChats } from "../../config/SearchChats";

import axios from "axios";
import { BACKEND_URL } from "../../constants";

export const NewGroup = () => {
  const { users, userId, handleNewGroup, getGroups, loginUser, avatarShapeClass } = useCC();
  const [groupName, setGroupName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [query, setQuery] = useState("");

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId); // remove
      } else {
        return [...prev, userId]; // add
      }
    });
  };

  const handleCreateGroup = async() => {
    if(!groupName || selectedUsers.length <1){
      alert("Group name & members are required!")
      return
    }
    try {
      const groupData = {
        groupName,
        superAdminId: userId,
        members: selectedUsers,
      };
      const res = await axios.post(BACKEND_URL + "/group/create", groupData);


      console.log(res)
      getGroups(); //what is the problem with this?  sying it's not a function 
      handleNewGroup()

    } catch (error) {
      console.log(error);
    }
  };

  const filteredUsers = query
      ? SearchChats(users, query).map((r) => r.item)
      : users;
  
  

  return (
    <>
      <div className="p-5 flex flex-col gap-y-2 h-dvh bg-sidebar text-text-base">
        <h1 className="text-center text-xl ">New Group</h1>
        <div className="flex flex-col">
          <label htmlFor="groupname" className="text-sm text-text-muted">
            Group Name
          </label>
          <input
            name="groupname"
            type="text"
            placeholder="Enter group name"
            onChange={(e) => setGroupName(e.target.value)}
            className="px-2 py-2 bg-input-bg text-text-base rounded-xl border border-border-color focus:outline-none focus:border-primary"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="px-2 py-2 pl-8 bg-input-bg text-text-base rounded-xl border border-border-color focus:outline-none focus:border-primary w-full"
          />
          <IoMdSearch
            size={20}
            className="absolute top-3 left-2 text-text-dim"
          />
        </div>

        <div className="flex flex-col  flex-1 overflow-y-auto hide-scrollbar">
          {filteredUsers.filter((user) => user._id !== userId).map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center gap-x-4 hover:bg-sidebar-hover p-1 rounded-xl hover:cursor-pointer transition-all duration-100"
            >
              <div className="relative flex justify-center items-center gap-x-2">
                <img
                  src={user.profileImage}
                  alt=""
                  className={`h-10 w-10 object-cover border border-border-color ${avatarShapeClass}`}
                />
                <p className="text-lg font-semibold text-center">
                  {user.username}
                </p>
              </div>

              <div className="flex justify-end">
                <input
                  onChange={() => handleSelectUser(user._id)}
                  type="checkbox"
                  className=""
                />
              </div>
            </div>
          ))}
          
         
        </div>

        <div className="flex justify-between px-2">
          <button
            onClick={() => handleNewGroup()}
            className="bg-surface-2 hover:bg-sidebar-hover hover:cursor-pointer rounded-xl px-8 py-3 text-text-base transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleCreateGroup()}
            className="bg-primary text-white hover:cursor-pointer rounded-xl px-8 py-3 hover:bg-primary-dark active:scale-95 transition-all duration-200"
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};
