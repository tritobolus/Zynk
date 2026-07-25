import React, { useEffect, useState } from "react";
import { useCC } from "../../context/Context";
import { All } from "./Chats UI/All";
import { Direct } from "./Chats UI/Direct";
import { Groups } from "./Chats UI/Groups";


export const Chats = ({setMobileView}) => {
  const {
    users,
    username,
    onlineUsers,
    setCurrentUser,
    currentUser,
    handleDropdown,
    dropDown,
    newGroup,
    groups,
    loginUser,
    userId,
  } = useCC();

  const [tab, setTab] = useState("all");

  let tabData;
  if (tab === "direct") {
    tabData = users;
  } else if (tab === "all"){
    tabData = [...users, ...groups];
  } else if (tab === "active") {
    tabData = users.filter((user) => onlineUsers.includes(user._id));
  } else {
    tabData = groups.filter(
      (group) => group.adminId === userId || group.members.includes(userId),
    );
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 gap-y-1 rounded-4xl border bg-sidebar border-border-color px-3 pt-3">
        {/* chat navigation*/}
        <div className="relative flex gap-x-6 text-sm font-semibold text-text-muted pb-1 justify-center items-center">
          <button
            onClick={() => setTab("all")}
            className={`hover:cursor-pointer ${tab === "all" && "text-primary border-b-2 border-primary"} `}
          >
            All
          </button>
          <button
            onClick={() => setTab("direct")}
            className={`hover:cursor-pointer ${tab === "direct" && "text-primary border-b-2 border-primary"} `}
          >
            Direct
          </button>
          
          <button
            onClick={() => setTab("groups")}
            className={`hover:cursor-pointer ${tab === "groups" && "text-primary border-b-2 border-primary"} `}
          >
            Groups
          </button>
          <hr className="border-t border-border-color my-2" />
        </div>

        <div className=" flex-1 min-h-0 overflow-y-auto hide-scrollbar  ">
          
          {tab === "all" && <All tab={tab} tabData={tabData}  />}
          {tab === "direct" && <Direct tab={tab} tabData={tabData} />}
          {/* {tab === "active" && <Active tab={tab} tabData={tabData} />} */}
          {tab === "groups" && <Groups tab={tab} tabData={tabData} />}
        </div>
      </div>
    </>
  );
};
