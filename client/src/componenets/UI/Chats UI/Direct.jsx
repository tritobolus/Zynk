import React, { useEffect } from "react";
import { useCC } from "../../../context/Context";
import { SearchChats } from "../../../config/SearchChats";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

export const Direct = ({ tabData, tab }) => {
  const {
    setCurrentRightWindow,
    setCurrentRightWindowType,
    currentRightWindow,
    onlineUsers,
    loginUser,
    userId,
    lastPrivateChats,
    setChatId,
    query,
    unreadCounts,
    typingUsers,
    avatarShapeClass,
  } = useCC();

  // Create a fast lookup map for chats (optimization)
  const chatMap = new Map();

  lastPrivateChats?.forEach((chat) => {
    chat.members?.forEach((id) => {
      chatMap.set(id, chat);
    });
  });

  // Sort users by latest message time
  const sortedUsers = [...tabData]
    .filter((user) => user._id !== userId)
    .sort((a, b) => {
      const chatA = chatMap.get(a._id);
      const chatB = chatMap.get(b._id);

      const timeA = chatA?.lastMessageTime
        ? new Date(chatA.lastMessageTime).getTime()
        : 0;

      const timeB = chatB?.lastMessageTime
        ? new Date(chatB.lastMessageTime).getTime()
        : 0;

      return timeB - timeA; // newest first
    });

  const filteredUsers = query
    ? SearchChats(sortedUsers, query).map((r) => r.item)
    : sortedUsers;

  return (
    <>
      <div className="flex flex-col">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-text-muted mt-20 mr-3">No users found</p>
        ) : (
          filteredUsers.map((user) => {
            const chat = lastPrivateChats.find((c) =>
              c.members?.includes(user._id)
            );

            const unreadCount = unreadCounts[user._id] || 0;

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

            const isLastMessageSeen = chat && String(chat.lastMessageSenderId) === String(userId) ? chat.lastMessageSeen : false;
            const isItemTyping = typingUsers[user._id]?.isTyping;

            return (
              <div
                onClick={() => {
                  setCurrentRightWindow(user._id);
                  setCurrentRightWindowType("private");
                }}
                key={user._id}
                className={`flex items-center gap-x-3 hover:bg-sidebar-hover ${currentRightWindow === user._id && "bg-primary-light"} p-2 rounded-xl hover:cursor-pointer transition-all duration-100`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profileImage}
                    alt=""
                    className={`h-12 w-12 object-cover overflow-hidden hover:scale-105 transition border border-primary ${avatarShapeClass}`}
                  />

                  <div className="absolute top-8 right-0 flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full border-2 ${
                        onlineUsers.includes(user._id)
                          ? "bg-green-500"
                          : "bg-text-dim"
                      } border-sidebar`}
                    ></span>
                  </div>
                </div>

                <div className="flex flex-col w-full font-medium">
                  <div className="flex justify-between w-full">
                    <p className={`text-lg font-semibold ${unreadCount > 0 ? "text-secondary font-bold" : "text-text-base"}`}>
                      {user.username}
                    </p>

                    {time && (
                      <p className={`text-[12px] whitespace-nowrap mt-1 ${unreadCount > 0 ? "text-primary font-bold" : "text-text-muted"}`}>
                        {time}
                      </p>
                    )}
                  </div>

                  {/* Last Message and Unread Badge */}
                  <div className="flex justify-between items-center w-full mt-0.5">
                    <div className={`text-md flex items-center gap-x-1 ${unreadCount > 0 ? "font-semibold text-text-base" : "text-text-muted"}`}>
                      {isItemTyping ? (
                        <span className="text-emerald-500 font-semibold italic">typing...</span>
                      ) : (
                        <>
                          {chat && chat.lastMessageSenderId === userId && (
                            <IoCheckmarkDoneSharp
                              className={`text-base flex-shrink-0 ${
                                isLastMessageSeen ? "text-seen-tick" : "text-text-muted"
                              }`}
                            />
                          )}
                          <span className="truncate">
                            {chat ? message : "No messages yet"}
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
