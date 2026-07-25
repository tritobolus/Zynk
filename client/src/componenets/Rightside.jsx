import { useCC } from "../context/Context";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import { BACKEND_URL } from "../constants";
import { socket } from "../socket/socket";
import { Profile } from "./UI/Profile";
import { GroupProfile } from "./UI/GroupProfile";
import { Emoji } from "./UI/Emoji_Picker/Emoji";
import { Loading } from "./UI/Loading";
import { RightSideTemp } from "./UI/RightSideTemp";

import { ChatHeader } from "./UI/chat/ChatHeader";
import { MessageList } from "./UI/chat/MessageList";
import { BlockedBanner } from "./UI/chat/BlockedBanner";
import { ChatInput } from "./UI/chat/ChatInput";
import { ForwardModal } from "./UI/chat/ForwardModal";
import { playSendSound, playReceiveSound } from "../utils/sound";

export const Rightside = ({ setShowProfile, showProfile }) => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);

  const [attachment, setAttachment] = useState(null);
  const [profile, setProfile] = useState(false);

  const [isMediaLoding, setIsMediaLoading] = useState(false);
  const [isEmoji, setIsEmoji] = useState(false);

  // Message Forwarding Modal State
  const [forwardMessage, setForwardMessage] = useState(null);

  // Message Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchMessageQuery, setSearchMessageQuery] = useState("");

  // For voice messages
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
    setUnreadCounts,
    chatId,
    typingUsers,
    setTypingUsers,
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

  const startRecording = async () => {
    setAudioURL(null);
    isCancelledRef.current = false;
    setRecordingTime(0);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      if (isCancelledRef.current) {
        audioChunks.current = [];
        return;
      }
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      audioChunks.current = [];
      clearInterval(timerRef.current);

      await sendMessage(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = (cancel = false) => {
    isCancelledRef.current = cancel;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Reset state instantly when switching active chat window
  useEffect(() => {
    setProfile(false);
    setIsEmoji(false);
    setMessages([]);
    setMessageLoading(true);
    setIsSearchOpen(false);
    setSearchMessageQuery("");
    if (currentRightWindow) {
      setUnreadCounts((prev) => ({ ...prev, [currentRightWindow]: 0 }));
    }
  }, [currentRightWindow, setUnreadCounts]);

  // Get selected user or group
  useEffect(() => {
    if (currentRightWindowType === "private") {
      const selectedUser = users.find((user) => user._id == currentRightWindow);
      setUser(selectedUser);
    }

    if (currentRightWindowType === "group") {
      const selectedGroup = groups.find(
        (group) => group._id == currentRightWindow
      );
      setUser(selectedGroup);
    }
  }, [currentRightWindow, users, groups, currentRightWindowType]);

  // Emit markAsSeen / markGroupAsSeen when active chat is open
  useEffect(() => {
    if (user?._id && userId) {
      if (currentRightWindowType === "private") {
        socket.emit("markAsSeen", { senderId: user._id, receiverId: userId });
        setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
      } else if (currentRightWindowType === "group") {
        socket.emit("markGroupAsSeen", { groupId: user._id, userId });
        setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
      }
    }
  }, [user, userId, currentRightWindowType, setUnreadCounts]);

  // Send message
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

      // Upload Image
      if (attachment) {
        const imageData = new FormData();
        imageData.append("file", attachment);
        imageData.append("upload_preset", "MyImages");
        imageData.append("cloud_name", "dqxfpedkq");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dqxfpedkq/image/upload",
          imageData
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
          audioData
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
          }
        );

        socket.emit("sendMessage", res.data.responce);
        setMessages((prev) => [...prev, res.data.responce]);
        playSendSound();

        setLastPrivateChats((prev) => {
          const exists = prev.find(
            (chat) => chat._id === res.data.responce.chatId
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
                    lastMessageSeen: false,
                    lastMessageSeenBy: [userId],
                  }
                : chat
            );
          }
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
              lastMessageSeen: false,
              lastMessageSeenBy: [userId],
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
          }
        );

        socket.emit("sendMessage", res.data.responce);
        playSendSound();

        setLastGroupChats((prev) => {
          const exists = prev.find(
            (chat) => chat._id === res.data.updatedChat._id
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
                    lastMessageSeenBy: [userId],
                  }
                : chat
            );
          }
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
              lastMessageSeenBy: [userId],
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
    const activeWindow = currentRightWindow;
    if (!activeWindow) return;

    if (currentRightWindowType === "private") {
      try {
        if (!userId || !user?._id) return;
        setMessageLoading(true);
        const res = await axios.get(BACKEND_URL + "/message/getmessages", {
          params: {
            userA: userId,
            userB: user._id,
          },
        });

        if (activeWindow === currentRightWindow) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (activeWindow === currentRightWindow) {
          setMessageLoading(false);
        }
      }
    } else if (currentRightWindowType === "group") {
      try {
        setMessageLoading(true);
        const res = await axios.get(
          BACKEND_URL + "/message/getGroupMessages",
          {
            params: {
              groupId: currentRightWindow,
              userId: userId,
            },
          }
        );

        if (activeWindow === currentRightWindow) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (activeWindow === currentRightWindow) {
          setMessageLoading(false);
        }
      }
    }
  };

  // Socket join user and handle auto-reconnect
  useEffect(() => {
    if (!userId) return;

    const joinRooms = () => {
      socket.emit("join", userId);
      if (groups && groups.length > 0) {
        groups.forEach((group) => {
          socket.emit("joinGroup", group._id);
        });
      }
    };

    joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
    };
  }, [userId, groups]);

  // Fetch messages when user/window changes
  useEffect(() => {
    if (user && userId) {
      getMessages();
    }
  }, [user, userId]);

  // Listen for messagesSeen event (when receiver opens sender's messages)
  useEffect(() => {
    const handleMessagesSeen = ({ senderId, receiverId, chatId }) => {
      if (String(senderId) === String(userId)) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.senderId) === String(userId)
              ? { ...msg, isSeen: true }
              : msg
          )
        );
        setLastPrivateChats((prev) =>
          prev.map((chat) => {
            const matchesId = chatId && String(chat._id) === String(chatId);
            const matchesMembers = chat.members?.some(
              (m) => String(m) === String(receiverId)
            );
            if (matchesId || matchesMembers) {
              return { ...chat, lastMessageSeen: true };
            }
            return chat;
          })
        );
      }
    };

    socket.on("messagesSeen", handleMessagesSeen);
    return () => socket.off("messagesSeen", handleMessagesSeen);
  }, [userId]);

  // Listen for group messages seen — update seenBy on individual messages in state
  useEffect(() => {
    const handleGroupMessagesSeen = ({ groupId, seenByUserId, updatedMessages }) => {
      if (String(groupId) === String(currentRightWindow)) {
        setMessages((prev) =>
          prev.map((msg) => {
            const updated = updatedMessages.find((u) => u._id === String(msg._id));
            if (updated) return { ...msg, seenBy: updated.seenBy };
            return msg;
          })
        );
      }
      setLastGroupChats((prev) =>
        prev.map((chat) => {
          if (String(chat.groupId) === String(groupId)) {
            const latestMsg = updatedMessages[updatedMessages.length - 1];
            if (latestMsg) {
              return { ...chat, lastMessageSeenBy: latestMsg.seenBy };
            }
          }
          return chat;
        })
      );
    };

    socket.on("groupMessagesSeen", handleGroupMessagesSeen);
    return () => socket.off("groupMessagesSeen", handleGroupMessagesSeen);
  }, [currentRightWindow]);

  // Listen for typing events
  useEffect(() => {
    const handleUserTyping = ({ senderId, senderName, chatType, targetId, isTyping }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        if (chatType === "private") {
          if (isTyping) {
            copy[targetId] = { isTyping: true, username: senderName };
          } else {
            delete copy[targetId];
          }
        } else if (chatType === "group") {
          const groupTyping = { ...(copy[targetId] || {}) };
          if (isTyping) {
            groupTyping[senderId] = { isTyping: true, username: senderName };
          } else {
            delete groupTyping[senderId];
          }
          if (Object.keys(groupTyping).length > 0) {
            copy[targetId] = groupTyping;
          } else {
            delete copy[targetId];
          }
        }
        return copy;
      });
    };

    socket.on("userTyping", handleUserTyping);
    return () => socket.off("userTyping", handleUserTyping);
  }, [setTypingUsers]);

  // Receive socket message in real-time
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("Socket received message:", data);

      if (String(data.senderId) !== String(userId)) {
        playReceiveSound();
      }

      if (data.messageType === "privateMessage") {
        const isCurrentChat =
          (String(data.senderId) === String(currentRightWindow) &&
            String(data.receiverId) === String(userId)) ||
          (String(data.senderId) === String(userId) &&
            String(data.receiverId) === String(currentRightWindow));

        if (isCurrentChat) {
          setMessages((prev) => [...prev, data]);
          socket.emit("markAsSeen", { senderId: data.senderId, receiverId: userId });
        } else {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1,
          }));
        }

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
                    lastMessageSeen: isCurrentChat,
                    lastMessageSeenBy: isCurrentChat ? [userId, data.senderId] : [data.senderId],
                  }
                : chat
            );
          }

          return [
            {
              _id: data.chatId,
              members: [data.senderId, data.receiverId],
              lastMessage: data.message,
              lastMessageSenderId: data.senderId,
              isMedia: data.isMedia,
              isAudio: data.isAudio,
              isGroup: false,
              lastMessageTime: new Date(),
              lastMessageSeen: isCurrentChat,
              lastMessageSeenBy: isCurrentChat ? [userId, data.senderId] : [data.senderId],
            },
            ...prev,
          ];
        });
      }

      if (data.messageType === "groupMessage") {
        const isCurrentGroup =
          String(data.groupId) === String(currentRightWindow);

        if (isCurrentGroup) {
          setMessages((prev) => [...prev, data]);
          socket.emit("markGroupAsSeen", { groupId: data.groupId, userId });
        } else if (String(data.senderId) !== String(userId)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.groupId]: (prev[data.groupId] || 0) + 1,
          }));
        }

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
                    lastMessageSeenBy: isCurrentGroup ? [userId, data.senderId] : [data.senderId],
                  }
                : chat
            );
          }

          return [
            {
              _id: data.chatId,
              groupId: data.groupId,
              lastMessage: data.message,
              lastMessageSenderId: data.senderId,
              isMedia: data.isMedia,
              isAudio: data.isAudio,
              isGroup: true,
              lastMessageTime: new Date(),
              lastMessageSeenBy: isCurrentGroup ? [userId, data.senderId] : [data.senderId],
            },
            ...prev,
          ];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [currentRightWindow, userId, setLastPrivateChats, setLastGroupChats, setUnreadCounts]);

  // Remove group member notification
  useEffect(() => {
    socket.on("removedFromGroup", ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId));

      if (
        currentRightWindowType === "group" &&
        currentRightWindow === groupId
      ) {
        alert("You were removed from this group");

        setCurrentRightWindow(null);
        setCurrentRightWindowType(null);
        setUser(null);
        setMessages([]);
      }
    });

    return () => socket.off("removedFromGroup");
  }, [currentRightWindow, currentRightWindowType]);

  // Notify user who was added to a group
  useEffect(() => {
    socket.on("addedToGroup", ({ group }) => {
      setGroups((prev) => {
        const exists = prev.some((g) => g._id === group._id);
        if (exists) return prev;

        return [...prev, group];
      });

      socket.emit("joinGroup", group._id);
    });

    return () => socket.off("addedToGroup");
  }, []);

  // Update all existing users when a group is updated
  useEffect(() => {
    socket.on("groupUpdated", (updatedGroup) => {
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
    });

    return () => socket.off("groupUpdated");
  }, []);

  // Listen for message reactions in real-time
  useEffect(() => {
    const handleReceiveMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    };

    socket.on("receiveMessageReaction", handleReceiveMessageReaction);
    return () => socket.off("receiveMessageReaction", handleReceiveMessageReaction);
  }, []);

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      const res = await axios.post(BACKEND_URL + "/message/reactToMessage", {
        messageId,
        senderId: userId,
        emoji,
      });

      // Update state
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: res.data.reactions } : msg
        )
      );

      // Find the message in state to get receiverId/groupId
      const msg = messages.find((m) => m._id === messageId);
      if (msg) {
        // Emit to socket
        socket.emit("sendMessageReaction", {
          messageId,
          reactions: res.data.reactions,
          receiverId: msg.receiverId,
          groupId: msg.groupId,
          messageType: msg.messageType,
        });
      }
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const isBlockedOrBlockedBy =
    loginUser?.blocked?.includes(user?._id) ||
    loginUser?.blockedBy?.includes(user?._id);

  return (
    <div className="relative h-screen">
      {user ? (
        <div className="bg-chat-bg flex flex-col justify-between h-screen">
          {/* HEADER */}
          <ChatHeader
            user={user}
            currentRightWindowType={currentRightWindowType}
            onlineUsers={onlineUsers}
            users={users}
            loginUser={loginUser}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchMessageQuery={searchMessageQuery}
            setSearchMessageQuery={setSearchMessageQuery}
          />

          {/* CHAT AREA */}
          <MessageList
            messages={messages}
            messageLoading={messageLoading}
            loginUser={loginUser}
            chatRef={chatRef}
            userId={userId}
            users={users}
            currentRightWindowType={currentRightWindowType}
            onForwardMessage={(msg) => setForwardMessage(msg)}
            group={currentRightWindowType === "group" ? user : null}
            searchMessageQuery={searchMessageQuery}
            onReactToMessage={handleReactToMessage}
          />

          {/* MESSAGE INPUT or BLOCKED BANNER */}
          {isBlockedOrBlockedBy ? (
            <BlockedBanner
              loginUser={loginUser}
              user={user}
              unBlockUser={unBlockUser}
            />
          ) : (
            <ChatInput
              loginUser={loginUser}
              attachment={attachment}
              setAttachment={setAttachment}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              recordingTime={recordingTime}
              formatTime={formatTime}
              stopRecording={stopRecording}
              startRecording={startRecording}
              isMediaLoding={isMediaLoding}
              message={message}
              setMessage={setMessage}
              isEmoji={isEmoji}
              setIsEmoji={setIsEmoji}
              audioBlob={audioBlob}
              sendMessage={sendMessage}
            />
          )}
        </div>
      ) : (
        <div
          className="flex-1 flex justify-center items-center bg-chat-bg text-text-base h-full"
        >
          <RightSideTemp />
        </div>
      )}

      {/* PROFILES */}
      <div className="absolute top-0 right-0">
        {profile && currentRightWindowType === "private" && (
          <Profile setProfile={setProfile} user={user} />
        )}
        {profile && currentRightWindowType === "group" && (
          <GroupProfile setProfile={setProfile} group={user} />
        )}
      </div>

      {/* EMOJI PICKER */}
      <div className="absolute bottom-16 right-20">
        {isEmoji && <Emoji setMessage={setMessage} />}
      </div>

      {/* FORWARD MESSAGE MODAL */}
      {forwardMessage && (
        <ForwardModal
          messageToForward={forwardMessage}
          onClose={() => setForwardMessage(null)}
        />
      )}
    </div>
  );
};
