import React, { useEffect, useState } from "react";
import { useCC } from "../context/Context";

import { SlOptionsVertical } from "react-icons/sl";
import { IoMdSearch } from "react-icons/io";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { IoIosArrowDropupCircle } from "react-icons/io";
import { IoChatbox } from "react-icons/io5";
import { IoMdCall } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

import { MyProfile } from "./UI/MyProfile";
import { DropDown } from "./UI/DropDown";
import { NewGroup } from "./UI/NewGroup";
import { Chats } from "./UI/Chats";
import { Settings } from "./UI/Settings";
import { Users } from "./UI/Users";

export const LeftSide = () => {
  const {
    users,
    username,
    onlineUsers,
    handleDropdown,
    dropDown,
    newGroup,
    settings,
    userId,
    setCurrentRightWindow,
    setCurrentRightWindowType,
    loginUser,
    setQuery,
    avatarShapeClass,
  } = useCC();

  const [activeTab, setActiveTab] = useState("chats");
  const [profile, setProfile] = useState(false);

  var [myBio, setMyBio] = useState("");

  useEffect(() => {
    setMyBio(loginUser?.bio); // here i store that value
  }, [loginUser]);

  const handleProfile = () => {
    if (profile) {
      setProfile(false);
    } else {
      setProfile(true);
    }
  };

  return (
    <>
      <div
        className="relative flex flex-col px-1 h-screen bg-sidebar text-text-base animation border-r border-border-color"
      >
        {/* header */}
        <div className="flex flex-col gap-y-5 mx-5  my-2 mb-0 ">

          {/* upper section */}
          <div className="  flex justify-between items-center flex-shrink-0 mb-1">
            <div className="flex gap-x-3 justify-center  items-center">
              <div
                onClick={() => setProfile(!profile)}
                className="relative bg-surface-2 w-12 rounded-r-4xl rounded-l-2xl flex flex-col leading-tight hover:cursor-pointer z-10"
              >
                <img
                  src={loginUser?.profileImage}
                  alt=""
                  className="h-8 w-8 object-cover rounded-full -ml-2 border border-primary"
                />
                {!profile && (
                  <IoIosArrowDropdownCircle
                    size={14}
                    className="absolute top-[10px] right-1 text-text-muted"
                  />
                )}
                {profile && (
                  <IoIosArrowDropupCircle
                    size={14}
                    className="absolute top-[10px] right-1 text-text-muted"
                  />
                )}
              </div>

              {/* search chat */}
              <div
                className="relative rounded-4xl bg-input-bg py-[6px]"
              >
                <input
                  type="text"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="search chats..."
                  className="pl-10 pr-4 focus:outline-none w-full bg-transparent text-text-base placeholder-text-dim"
                />
                <IoMdSearch
                  size={18}
                  className="absolute text-text-muted top-[10px] left-3"
                />
              </div>
            </div>

            <div
              onClick={() => handleDropdown()}
              className="hover:cursor-pointer rounded-full p-2 text-primary active:bg-surface-2 transition-all duration-200 -mr-2"
            >
              <SlOptionsVertical className="text-voilet-700" />
            </div>
          </div>
        </div>

        {/* Chat section*/}
        <div className="flex flex-col flex-1 min-h-0 rounded-4xl mb-2 bg-surface-2 mt-2">
          <div
            className={`${onlineUsers.length < 1 && "hidden"} flex w-85 flex-shrink-0 justify-center overflow-x-auto gap-x-2  `}
          >
            {onlineUsers
              ?.filter((user) => user !== userId) //remove yourself
              .map((user) => {
                const current = users?.find((u) => u._id === user);

                if (!current) return null;

                return (
                  <div
                    key={user}
                    onClick={() => {
                      // setChatId(chat._id)
                      setCurrentRightWindow(current._id);
                      setCurrentRightWindowType("private");
                    }}
                    className="relative my-1 "
                  >
                    <img
                      key={user}
                      src={current.profileImage}
                      className={`w-9 h-9 object-cover border border-primary ${avatarShapeClass}`}
                    />
                    <div className="absolute bottom-1 border border-sidebar -right-[1px] h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                );
              })}
          </div>
          {activeTab === "chats" && <Chats />}
          {/* {activeTab === "users" && <Users />} */}
          {/* {activeTab === "settings" && <Settings />} */}
        </div>

        {/* navigation bar */}
        {/* <div className="flex justify-between p-2 px-4 border-t-2 border-gray-200  pb-1 ">
          <div
            onClick={() => setActiveTab("chats")}
            className={`flex flex-col justify-center items-center ${activeTab == "chats" && "text-violet-700"} gap-y-1 leading-tight`}
          >
            <IoChatbox size={20} />
            <p className="text-sm font-semibold">CHATS</p>
          </div>
          <div className="flex flex-col justify-center items-center text-gray-500 gap-y-1 leading-tight">
            <IoMdCall size={20}/>
            <p className="text-sm font-semibold">CALLS</p>
          </div>
          <div
            onClick={() => setActiveTab("users")}
            className={`flex flex-col justify-center items-center ${activeTab == "users" && "text-violet-700"} gap-y-1 leading-tight`}
          >
            <FaUserFriends size={20} />
            <p className="text-sm font-semibold">USERS</p>
          </div>
          <div
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col justify-center items-center ${activeTab == "settings" && "text-violet-700"} gap-y-1 leading-tight`}
          >
            <IoMdSettings size={20} />
            <p className="text-sm font-semibold">SETTINGS</p>
          </div>
        </div> */}

        {/* DropDown UI */}
        <div className="absolute top-14  right-5 shadow-2xl rounded-2xl">
          {dropDown && <DropDown />}
        </div>
        <div className="absolute top-0 w-full right-0 shadow-2xl rounded-2xl">
          {newGroup && <NewGroup />}
        </div>
        <div className="absolute top-0 w-full right-0 shadow-2xl rounded-2xl">
          {settings && <Settings />}
        </div>
        <div className="absolute w-full top-0 right-0">
          {profile && <MyProfile setProfile={setProfile} />}
        </div>
      </div>
    </>
  );
};
