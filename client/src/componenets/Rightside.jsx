import { useCC } from "../context/Context";
import { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { ImAttachment } from "react-icons/im";
import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { CgUnblock } from "react-icons/cg";

import axios from "axios";

import { BACKEND_URL } from "../constants";

import { socket } from "../socket/socket";
import { Profile } from "./UI/Profile";
import { GroupProfile } from "./UI/GroupProfile";
import { Emoji } from "./UI/Emoji_Picker/Emoji";
import { Loading } from "./UI/Loading";
import { RightSideTemp } from "./UI/RightSideTemp";

export const Rightside = ({ setShowProfile, showProfile }) => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);

  const [attachment, setAttachment] = useState(null);

  const [profile, setProfile] = useState(false);

  const [isMediaLoding, setIsMediaLoading] = useState(false);
  const [isEmoji, setIsEmoji] = useState(false);

  //for voice messages
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const isCancelledRef = useRef(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const chatRef = useRef(null);

  const {
    users,
    groups,
    userId,
    onlineUsers,
    currentRightWindow,
    setCurrentRightWindow,
    currentRightWindowType,
    setCurrentRightWindowType,
    loginUser,
    username,
    setGroups,
    setLastPrivateChats,
    setLastGroupChats,
    chatId,
  } = useCC();

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

  const linkifyText = (text, isMyMessage) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline break-all font-medium
            ${
              isMyMessage
                ? "text-white hover:text-gray-200" // purple bg
                : "text-blue-600 hover:text-blue-800" // white bg
            }`}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const startRecording = async () => {
    setAudioURL(null);
    isCancelledRef.current = false; // reset
    setRecordingTime(0); // reset timer

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      if (isCancelledRef.current) {
        audioChunks.current = []; // discard audio
        return; //  DO NOT SEND
      }
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      audioChunks.current = [];
      clearInterval(timerRef.current); // stop timer

      await sendMessage(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);

    // START TIMER
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = (cancel = false) => {
    isCancelledRef.current = cancel; // ✅ correct
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    setProfile(false);
    setIsEmoji(false);
  }, [currentRightWindow]);

  const handleProfile = () => {
    if (profile) {
      setProfile(false);
    } else {
      setProfile(true);
    }
  };

  // get selected user
  useEffect(() => {
    if (currentRightWindowType == "private") {
      const selectedUser = users.find((user) => user._id == currentRightWindow);
      setUser(selectedUser);
    }

    if (currentRightWindowType == "group") {
      const selectedGroup = groups.find(
        (group) => group._id == currentRightWindow,
      );
      setUser(selectedGroup);
    }
  }, [currentRightWindow, users, groups, currentRightWindowType]);

  // send message
  const sendMessage = async (audioBlobParam = null) => {
    if (currentRightWindowType === "group") {
      const currentGroup = groups.find((g) => g._id === currentRightWindow);

      const isMember = currentGroup?.members
        ?.map((id) => id.toString())
        .includes(userId?.toString());

      if (!isMember) {
        alert("You are no longer in this group");
        return;
      }
    }

    let imageUrl;
    let audioUrl;

    try {
      setIsMediaLoading(true);

      //Upload Image
      if (attachment) {
        const imageData = new FormData();
        imageData.append("file", attachment);
        imageData.append("upload_preset", "MyImages");
        imageData.append("cloud_name", "dqxfpedkq");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dqxfpedkq/image/upload",
          imageData,
        );

        imageUrl = res.data.secure_url;
      }

      // Upload Audio
      if (audioBlobParam) {
        const audioData = new FormData();
        audioData.append("file", audioBlobParam);
        audioData.append("upload_preset", "MyImages");
        audioData.append("cloud_name", "dqxfpedkq");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dqxfpedkq/video/upload",
          audioData,
        );

        audioUrl = res.data.secure_url;
      }

      // Prepare message
      let data;
      let isMedia = false;
      let isAudio = false;

      if (attachment) {
        data = imageUrl;
        isMedia = true;
      } else if (audioBlobParam) {
        data = audioUrl;
        isAudio = true;
      } else {
        data = message;
      }

      // Send Private Message
      if (currentRightWindowType === "private") {
        const res = await axios.post(
          BACKEND_URL + "/message/sendPrivateMessage",
          {
            senderId: userId,
            receiverId: user._id,
            message: data,
            messageType: "privateMessage",
            isMedia: isMedia,
            isAudio: isAudio,
          },
        );

        socket.emit("sendMessage", res.data.responce);
        setMessages((prev) => [...prev, res.data.responce]);

        //updating last messages
        setLastPrivateChats((prev) => {
          const exists = prev.find(
            (chat) => chat._id === res.data.responce.chatId,
          );

          if (exists) {
            return prev.map((chat) =>
              chat._id === res.data.responce.chatId
                ? {
                    ...chat,
                    lastMessage: data,
                    lastMessageSenderId: userId,
                    isMedia,
                    isGroup: false,
                    isAudio,
                    lastMessageTime: new Date(),
                  }
                : chat,
            );
          }
          //it is importtant when user start the chat for the first time
          return [
            {
              _id: res.data.responce.chatId,
              members: [
                res.data.responce.senderId,
                res.data.responce.receiverId,
              ],
              lastMessage: res.data.responce.message,
              lastMessageSenderId: res.data.responce.senderId,
              isMedia,
              isAudio,
              isGroup: false,
              lastMessageTime: new Date(),
            },
            ...prev,
          ];
        });
      }

      // Send Group Message
      if (currentRightWindowType === "group") {
        const res = await axios.post(
          BACKEND_URL + "/message/sendGroupMessage",
          {
            senderId: userId,
            groupId: currentRightWindow,
            message: data,
            messageType: "groupMessage",
            isMedia: isMedia,
            isAudio: isAudio,
          },
        );

        socket.emit("sendMessage", res.data.responce);

        //updating last messages
        setLastGroupChats((prev) => {
          const exists = prev.find(
            (chat) => chat._id === res.data.updatedChat._id,
          );

          if (exists) {
            return prev.map((chat) =>
              chat._id === res.data.updatedChat._id
                ? {
                    ...chat,
                    lastMessage: data,
                    lastMessageSenderId:
                      res.data.updatedChat.lastMessageSenderId,
                    isMedia: res.data.updatedChat.isMedia,
                    isAudio: res.data.updatedChat.isAudio,
                    isGroup: true,
                    lastMessageTime: res.data.updatedChat.lastMessageTime,
                  }
                : chat,
            );
          }
          //it is importtant when user start the chat for the first time
          return [
            {
              _id: res.data.updatedChat._id,
              groupId: res.data.updatedChat.groupId,
              lastMessage: res.data.responce.message,
              lastMessageSenderId: res.data.updatedChat.lastMessageSenderId,
              isMedia: res.data.updatedChat.isMedia,
              isAudio: res.data.updatedChat.isAudio,
              isGroup: true,
              lastMessageTime: res.data.updatedChat.lastMessageTime,
            },
            ...prev,
          ];
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsMediaLoading(false);
      setAttachment(null);
      setAudioBlob(null);
      setAudioURL(null);
      setMessage("");
    }
  };

  const getMessages = async () => {
    if (currentRightWindowType == "private") {
      try {
        if (!userId && !user._id) {
          alert("both are required!");
        }
        setMessageLoading(true);
        const res = await axios.get(
          BACKEND_URL + "/message/getmessages",
          {
            params: {
              userA: userId,
              userB: user._id,
            },
          },
        );
        setMessages(res.data.messages);
        setMessageLoading(false);
      } catch (error) {
        console.log(error);
      }
    } else if (currentRightWindowType == "group") {
      try {
        setMessageLoading(true);
        const res = await axios.get(
          BACKEND_URL + "/message/getGroupMessages",
          {
            params: {
              groupId: currentRightWindow,
            },
          },
        );
        setMessages(res.data.messages);
        setMessageLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // socket join
  useEffect(() => {
    if (userId) {
      socket.emit("join", userId);
    }
  }, [userId]);

  //join to all groups
  useEffect(() => {
    const myGroups = groups.filter(
      (group) => group.adminId === userId || group.members.includes(userId),
    );

    if (myGroups.length > 0) {
      myGroups.forEach((group) => {
        socket.emit("joinGroup", group._id);
      });
    }
  }, [groups]);

  // fetch messages when user changes
  useEffect(() => {
    if (user && userId) {
      // console.log(" Calling getMessages with:", userId, user._id);
      getMessages();
    }
  }, [user, userId]);

  // receive socket message
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      console.log(data);
      if (data.messageType === "privateMessage") {
        if (
          data.senderId === currentRightWindow &&
          data.receiverId === userId
        ) {
          // only tokhon UI te show korbe
          setMessages((prev) => [...prev, data]);
        }

        //updating last  messagwe state when a message received
        setLastPrivateChats((prev) => {
          const exists = prev.find((chat) => chat._id === data.chatId);

          if (exists) {
            return prev.map((chat) =>
              chat._id === data.chatId
                ? {
                    ...chat,
                    lastMessage: data.message,
                    lastMessageSenderId: data.senderId,
                    isMedia: data.isMedia,
                    isAudio: data.isAudio,
                    lastMessageTime: new Date(),
                  }
                : chat,
            );
          }

          // if chat doesn't exist (first message case)
          return [
            {
              _id: data.chatId,
              members: [data.senderId, data.receiverId],
              lastMessage: data.message,
              lastMessageSenderId: data.senderId,
              isMedia: data.isMedia,
              isAudio: data.isAudio,
              lastMessageTime: new Date(),
            },
            ...prev,
          ];
        });
      }

      if (data.messageType === "groupMessage") {
        const currentGroup = groups.find((group) => group._id === data.groupId);

        if (!currentGroup) return;

        if (
          (currentGroup.adminId === userId ||
            currentGroup.members.includes(userId)) &&
          data.groupId == currentRightWindow
        ) {
          setMessages((prev) => [...prev, data]);
        }

        //updating last messages
        setLastGroupChats((prev) => {
          const exists = prev.find((chat) => chat._id === data.chatId);

          if (exists) {
            return prev.map((chat) =>
              chat._id === data.chatId
                ? {
                    ...chat,
                    lastMessage: data.message,
                    lastMessageSenderId: data.senderId,
                    isMedia: data.isMedia,
                    isAudio: data.isAudio,
                    isGroup: true,
                    lastMessageTime: new Date(),
                  }
                : chat,
            );
          }
          //it is importtant when user start the chat for the first time
          return [
            {
              _id: data.chatId,
              groupId: data.groupId,
              lastMessage: data.message,
              lastMessageSenderId: data.SenderId,
              isMedia: data.isMedia,
              isAudio: data.isAudio,
              isGroup: true,
              lastMessageTime: new Date(),
            },
            ...prev,
          ];
        });
      }

      // //updating last  messagwe state when a message received
      // setLastPrivateChats((prev) => {
      //   const exists = prev.find((chat) => chat._id === data.chatId);

      //   if (exists) {
      //     return prev.map((chat) =>
      //       chat._id === data.chatId
      //         ? {
      //             ...chat,
      //             lastMessage: data.message,
      //             lastMessageSenderId: data.senderId,
      //             isMedia: data.isMedia,
      //             isAudio: data.isAudio,
      //             lastMessageTime: new Date(),
      //           }
      //         : chat,
      //     );
      //   }

      //   // if chat doesn't exist (first message case)
      //   return [
      //     {
      //       _id: data.chatId,
      //       members: [data.senderId, data.receiverId],
      //       lastMessage: data.message,
      //       lastMessageSenderId: data.senderId,
      //       isMedia: data.isMedia,
      //       isAudio: data.isAudio,
      //       lastMessageTime: new Date(),
      //     },
      //     ...prev,
      //   ];
      // });
    });

    return () => socket.off("receiveMessage");
  }, [currentRightWindow]);

  //remove group member
  useEffect(() => {
    socket.on("removedFromGroup", ({ groupId }) => {
      // console.log("Removed from group:", groupId);

      // Remove group from list
      setGroups((prev) => prev.filter((g) => g._id !== groupId));

      // If user is currently inside that group
      if (
        currentRightWindowType === "group" &&
        currentRightWindow === groupId
      ) {
        alert("You were removed from this group");

        // 🔥 Clear UI
        setCurrentRightWindow(null);
        setCurrentRightWindowType(null);
        setUser(null);
        setMessages([]);
      }
    });

    return () => socket.off("removedFromGroup");
  }, [currentRightWindow, currentRightWindowType]);

  // notify user who added to a group
  useEffect(() => {
    socket.on("addedToGroup", ({ group }) => {
      console.log("Added to group:", group);

      setGroups((prev) => {
        const exists = prev.some((g) => g._id === group._id);
        if (exists) return prev;

        return [...prev, group];
      });

      // join socket room
      socket.emit("joinGroup", group._id);
    });

    return () => socket.off("addedToGroup");
  }, []);

  //update all existing users when a new user removed or added
  useEffect(() => {
    socket.on("groupUpdated", (updatedGroup) => {
      console.log("Group updated:", updatedGroup);

      // Update group in state
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)),
      );
    });

    return () => socket.off("groupUpdated");
  }, []);

  // auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="relative h-screen">
        {user ? (
          <div className="bg-violet-100 flex flex-col justify-between h-screen">
            {/* HEADER */}
            <div
              className={`flex justify-between ${loginUser.darkmode ? "bg-black border-gray-900" : "bg-white border-gray-200"} border-b-2  shadow-xl p-2 transition-all duration-500`}
            >
              {/* <button
                onClick={() => setCurrentRightWindow(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <IoIosArrowBack size={24} className="text-violet-700" />
              </button> */}
              <div
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-x-2 hover:cursor-pointer"
              >
                <img
                  src={user?.profileImage}
                  alt=""
                  className="h-12 w-12 object-cover overflow-hidden rounded-[40%_60%_60%_40%/60%_40%_60%_40%] hover:scale-105 transition"
                />
                <div className="flex flex-col leading-tight">
                  <p
                    className={`${loginUser.darkmode ? "text-white" : "text-black"} font-bold transition-all duration-500`}
                  >
                    {currentRightWindowType == "private"
                      ? user?.username
                      : user?.groupName}
                  </p>
                  {currentRightWindowType == "private" ? (
                    <div className="text-sm">
                      {onlineUsers.includes(user._id) ? (
                        <p className=" text-green-500">Online</p>
                      ) : (
                        <p className=" text-gray-500">Offline</p>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`text-sm flex gap-x-1 ${loginUser.darkmode ? "text-gray-200" : "text-black"} animation`}
                    >
                      {user?.members?.map((memberId, index) => {
                        const member = users.find((u) => u._id === memberId);
                        return <p key={memberId}>{member?.username},</p>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CHAT AREA */}
            <div
              ref={chatRef}
              className={`hide-scrollbar flex-1 overflow-y-auto px-4 py-4 space-y-1 ${loginUser.darkmode ? "bg-gray-900/99" : "bg-gray-100"} bg-black transition-all duration-500`}
            >
              {messages.length == 0 ? (
                <p>You haven't started conversation yet</p>
              ) : (
                messages.map((message, index) => {
                  // Detect previous and next messages
                  const prevMessage = messages[index - 1];
                  const nextMessage = messages[index + 1];

                  // Check if message belongs to current user
                  const isMyMessage = message.senderId === userId;

                  // Detect grouping
                  const isPrevSameSender =
                    prevMessage?.senderId === message.senderId;

                  const isNextSameSender =
                    nextMessage?.senderId === message.senderId;

                  // Determine bubble shape
                  let bubbleShape = "";

                  if (!isPrevSameSender && !isNextSameSender) {
                    bubbleShape = "rounded-xl mt-2";
                  } else if (!isPrevSameSender && isNextSameSender) {
                    bubbleShape = isMyMessage
                      ? "rounded-t-xl rounded-bl-xl rounded-b"
                      : "rounded-t-xl rounded-br-xl rounded-b";
                  } else if (isPrevSameSender && isNextSameSender) {
                    bubbleShape = isMyMessage
                      ? "rounded-l-xl rounded-t rounded-br"
                      : "rounded-r-xl rounded-t rounded-bl";
                  } else if (isPrevSameSender && !isNextSameSender) {
                    bubbleShape = isMyMessage
                      ? "rounded-b-xl rounded-l-xl rounded-t"
                      : "rounded-b-xl rounded-r-xl rounded-t";
                  }

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isMyMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={` relative px-4 py-2 shadow text-sm max-w-xs 
                    ${isMyMessage ? "bg-violet-700 text-white mr-2 pb-2 pr-15" : "bg-white ml-2 pr-15 pb-2 "}
                    ${bubbleShape} ${prevMessage?.senderId !== message.senderId ? "mt-2" : ""}`}
                      >
                        {message.senderId !== userId &&
                          prevMessage?.senderId !== message.senderId &&
                          currentRightWindowType == "group" && (
                            <p className="font-semibold text-purple-600">
                              {
                                users.find(
                                  (user) => user._id == message.senderId,
                                ).username
                              }
                            </p>
                          )}

                        {message.isMedia ? (
                          <img
                            src={message.message}
                            className="h-40 rounded-xl "
                          />
                        ) : message.isAudio ? (
                          <audio
                            className="mb-3"
                            controls
                            src={message.message}
                          ></audio>
                        ) : (
                          <p className="break-words">
                            {linkifyText(message.message, isMyMessage)}
                          </p>
                        )}
                        {/* message sender indicator */}
                        <div
                          className={`absolute top-0 rounded-t-md h-3 w-5 
                       ${
                         message.senderId === userId
                           ? `bg-violet-700 rounded-l-xl mr-2
                            ${
                              messages[index - 1] &&
                              messages[index - 1].senderId === userId
                                ? "hidden"
                                : "-right-4 rounded-br-3xl"
                            }`
                           : `bg-white rounded-r-xl ml-2
                            ${
                              messages[index - 1] &&
                              messages[index - 1].senderId == message.senderId
                                ? "hidden"
                                : "-left-4  rounded-bl-3xl"
                            }
                        `
                       } 
                    `}
                        ></div>
                        {/* message time */}
                        <div className="absolute bottom-1 right-2">
                          <p
                            className={` text-[9px]  ${isMyMessage ? "text-gray-300" : "text-gray-600 "}`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* MESSAGE INPUT and chceking user blocked or not */}
            {loginUser?.blocked?.includes(user._id) ? (
              <div className="flex gap-x-5  justify-center items-center px-4 py-4">
                <div className="flex gap-x-1">
                  <p>You blocked</p>
                  <p className="font-semibold ">{user.username}</p>
                </div>
                <button onClick={() => unBlockUser(user._id)} className="flex gap-x-1 items-center px-2 py-1 bg-gray-300 rounded-2xl hover:cursor-pointer hover:scale-102">
                  <CgUnblock/>
                  <p>Unblock</p>
                </button>
              </div>
            ): loginUser?.blockedBy?.includes(user._id) ?(
              <div className="flex gap-x-5  justify-center items-center px-4 py-5">
                <div className="flex gap-x-1">
                  <p className="font-semibold ">{user.username}</p>
                  <p>blocked you</p>
                </div>
               
              </div>
            ) : (
                <div
              className={` flex gap-x-4 justify-center items-center ${loginUser.darkmode ? "bg-black" : "bg-white"}  px-4 py-3 transition-all duration-500`}
            >
              {/* attachment */}
              <label className={`${isRecording && "hidden"} cursor-pointer`}>
                <ImAttachment size={20} className="text-gray-500" />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
              </label>

              {/* input */}
              <div className="relative w-full">
                {attachment ? (
                  <div className="flex gap-x-5 items-center px-2">
                    <img
                      src={URL.createObjectURL(attachment)}
                      alt="preview"
                      className="h-10  "
                    />
                    <MdOutlineClose
                      className={`hover:cursor-pointer ${loginUser?.darkmode ? "text-white" : "text-black"} animation`}
                      size={25}
                      onClick={() => {
                        (setAttachment(false), setAttachment(false));
                      }}
                    />
                    {isMediaLoding && (
                      <p className="text-red-500">wait image is sending...</p>
                    )}
                  </div>
                ) : isRecording ? (
                  <div className="flex gap-x-5">
                    <span className="animate-pulse">🔴</span>
                    <p className={`${loginUser.darkmode && "text-white"}`}>
                      {formatTime(recordingTime)}
                    </p>
                    <button
                      className="text-red-500 hover:cursor-pointer "
                      onClick={() => stopRecording(true)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={message}
                    placeholder="Type a message..."
                    onChange={(e) => setMessage(e.target.value)}
                    className={`rounded-full w-full  px-6 py-2 ${loginUser.darkmode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"} transition-all duration-500 focus:outline-none`}
                  />
                )}

                {!attachment && (
                  <BsEmojiSmile
                    onClick={() => setIsEmoji(!isEmoji)}
                    size={20}
                    className={`${isRecording && "hidden"} absolute right-3 top-[11px]  hover:cursor-pointer ${isEmoji ? "text-purple-600 font-semibold" : "text-gray-500"}`}
                  />
                )}
              </div>

              {/* conditionally manage the icons of send message and record voice */}
              {message.trim().length < 1 && !attachment && !audioBlob ? (
                <button
                  className={`  p-3 rounded-full bg-violet-700  hover:cursor-pointer`}
                >
                  {isRecording ? (
                    <IoSend
                      size={17}
                      className="text-xl text-white"
                      onClick={() => stopRecording(false)}
                    />
                  ) : (
                    <FaMicrophone
                      size={17}
                      onClick={() => {
                        (setIsRecording(true), startRecording());
                      }}
                      className="text-xl text-white"
                    />
                  )}
                </button>
              ) : (
                <button
                  disabled={message.trim().length < 1 && !attachment}
                  onClick={() => {
                    sendMessage();
                    setMessage("");
                    setIsEmoji(false);
                  }}
                  className={`  p-3 rounded-full bg-violet-700 ${message.trim().length < 1 && !attachment && "opacity-50 hover:cursor-not-allowed"} hover:cursor-pointer`}
                >
                  <IoSend size={17} className="text-xl text-white" />
                </button>
              )}
            </div>
            )}
          

          </div>
        ) : (
          <div
            className={`flex-1 flex justify-center items-center ${loginUser?.darkmode ? "bg-black text-white" : "bg-white text-black"} h-full`}
          >
            <RightSideTemp />
          </div>
        )}

        {/* profiles */}
        <div className="absolute top-0 right-0">
          {profile && currentRightWindowType == "private" && (
            <Profile setProfile={setProfile} user={user} />
          )}
          {profile && currentRightWindowType == "group" && (
            <GroupProfile setProfile={setProfile} group={user} />
          )}
        </div>

        {/* emoji picker */}
        <div className="absolute bottom-16 right-20">
          {isEmoji && <Emoji setMessage={setMessage} />}
        </div>
        
      </div>
    </>
  );
};
