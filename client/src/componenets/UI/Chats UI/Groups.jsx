import React from "react";
import { useCC } from "../../../context/Context";
import { useEffect } from "react";
import { SearchChats } from "../../../config/SearchChats";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

export const Groups = ({ tabData, tab }) => {
  const {
    setCurrentRightWindow,
    setCurrentRightWindowType,
    currentRightWindow,
    onlineUsers,
    loginUser,
    lastGroupChats,
    users,
    query,
    unreadCounts,
    typingUsers,
    avatarShapeClass,
  } = useCC();

  const userMap = {};

  users.forEach((user) => {
    userMap[user._id] = user.username;
  });

  const sortedGroups = [...tabData].sort((a, b) => {
    const chatA = lastGroupChats.find(
      (chat) => chat.groupId?.toString() === a._id?.toString()
    );

    const chatB = lastGroupChats.find(
      (chat) => chat.groupId?.toString() === b._id?.toString()
    );

    const timeA = chatA?.lastMessageTime
      ? new Date(chatA.lastMessageTime).getTime()
      : 0;

    const timeB = chatB?.lastMessageTime
      ? new Date(chatB.lastMessageTime).getTime()
      : 0;

    return timeB - timeA; // latest on top
  });

  const filteredGroups = query
    ? SearchChats(sortedGroups, query).map((r) => r.item)
    : sortedGroups;

  return (
    <>
      <div className="flex flex-col">
        {filteredGroups.length === 0 ? (
          <p className="text-center text-text-muted mt-20 mr-3">
            No groups found
          </p>
        ) : (
          filteredGroups.map((group) => {
            const chat = lastGroupChats.find(
              (chat) => chat.groupId?.toString() === group._id?.toString()
            );

            const unreadCount = unreadCounts[group._id] || 0;

            const senderName =
              chat?.lastMessageSenderId === loginUser?._id
                ? "You"
                : userMap[chat?.lastMessageSenderId];

            const message = !chat
              ? "No messages yet"
              : chat.isMedia
              ? "sent a photo"
              : chat.isAudio
              ? "sent an audio"
              : chat.lastMessage.length <= 15
              ? chat.lastMessage
              : chat.lastMessage.substring(0, 15) + "...";

            const formatDateLabel = (chat) => {
              if (!chat || !chat.lastMessageTime) return "";

              const messageDate = new Date(chat.lastMessageTime);
              const today = new Date();

              const todayDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );
              const msgDate = new Date(
                messageDate.getFullYear(),
                messageDate.getMonth(),
                messageDate.getDate()
              );

              const diffTime = todayDate - msgDate;
              const diffDays = diffTime / (1000 * 60 * 60 * 24);

              if (diffDays === 0)
                return new Date(chat?.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              if (diffDays === 1) return "Yesterday";

              return messageDate.toLocaleDateString("en-GB");
            };
            const time = formatDateLabel(chat);

            const isLastMessageSeen = (() => {
              if (!chat || String(chat.lastMessageSenderId) !== String(loginUser?._id)) return false;
              if (!group.members) return false;
              const otherMembers = group.members.filter((id) => String(id) !== String(loginUser?._id));
              return otherMembers.length > 0 && otherMembers.every((id) => chat.lastMessageSeenBy?.some(m => String(m) === String(id)));
            })();

            const groupTyping = typingUsers[group._id] || {};
            const isItemTyping = Object.values(groupTyping).some((u) => u.isTyping);

            return (
              <div
                onClick={() => {
                  setCurrentRightWindow(group._id);
                  setCurrentRightWindowType("group");
                }}
                key={group._id}
                className={`flex items-center gap-x-3 hover:bg-sidebar-hover p-2 rounded-xl hover:cursor-pointer transition-all duration-100 ${
                  currentRightWindow === group._id && "bg-primary-light"
                }`}
              >
                <div className="flex flex-col leading-tight flex-shrink-0">
                  <img
                    src={group.profileImage}
                    alt=""
                    className={`h-12 w-12 object-cover overflow-hidden hover:scale-105 transition border border-primary ${avatarShapeClass}`}
                  />
                </div>
                <div className="flex flex-col w-full font-medium">
                  <div className="flex justify-between w-full">
                    <p className={`text-lg font-semibold ${unreadCount > 0 ? "text-secondary font-bold" : "text-text-base"}`}>
                      {group.groupName}
                    </p>
                    {time && (
                      <p className={`text-[12px] whitespace-nowrap mt-1 ${unreadCount > 0 ? "text-primary font-bold" : "text-text-muted"}`}>
                        {time}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center w-full mt-0.5">
                    <div className={`text-md flex items-center gap-x-1 ${unreadCount > 0 ? "font-semibold text-text-base" : "text-text-muted"}`}>
                      {isItemTyping ? (
                        <span className="text-emerald-500 font-semibold italic">typing...</span>
                      ) : (
                        <>
                          {chat && chat.lastMessageSenderId === loginUser?._id && (
                            <IoCheckmarkDoneSharp
                              className={`text-base flex-shrink-0 ${
                                isLastMessageSeen ? "text-seen-tick" : "text-text-muted"
                              }`}
                            />
                          )}
                          <span className="truncate">
                            {chat
                              ? chat.lastMessageSenderId === loginUser?._id
                                ? message
                                : `${senderName || "Unknown"}: ${message}`
                              : "No messages yet"}
                          </span>
                        </>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ml-2 shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
