import React, { useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { IoArrowRedo } from "react-icons/io5";
import { useCC } from "../../../context/Context";
import { SearchChats } from "../../../config/SearchChats";
import axios from "axios";
import { BACKEND_URL } from "../../../constants";
import { socket } from "../../../socket/socket";
import { playSendSound } from "../../../utils/sound";

export const ForwardModal = ({ messageToForward, onClose }) => {
  const { users, groups, userId, loginUser, setLastPrivateChats, setLastGroupChats } = useCC();
  const [query, setQuery] = useState("");
  const [selectedTargets, setSelectedTargets] = useState([]); // [{ id, type }]
  const [isSending, setIsSending] = useState(false);

  // Combine users and groups for selection with keys compatible with SearchChats
  const allTargets = [
    ...users
      .filter((u) => u._id !== userId)
      .map((u) => ({ id: u._id, username: u.username, name: u.username, image: u.profileImage, type: "private" })),
    ...groups
      .filter((g) => g.adminId === userId || g.members?.includes(userId))
      .map((g) => ({ id: g._id, groupName: g.groupName, name: g.groupName, image: g.profileImage, type: "group" })),
  ];

  const filteredTargets = query
    ? SearchChats(allTargets, query).map((r) => r.item)
    : allTargets;

  const toggleSelectTarget = (target) => {
    setSelectedTargets((prev) => {
      const exists = prev.some((t) => t.id === target.id);
      if (exists) {
        return prev.filter((t) => t.id !== target.id);
      } else {
        return [...prev, target];
      }
    });
  };

  const handleForward = async () => {
    if (selectedTargets.length === 0) return;
    setIsSending(true);

    // Only mark as forwarded if message originated from someone else or was already forwarded
    const isForwardedFlag =
      messageToForward?.senderId !== userId || messageToForward?.isForwarded === true;

    try {
      for (const target of selectedTargets) {
        if (target.type === "private") {
          const res = await axios.post(BACKEND_URL + "/message/sendPrivateMessage", {
            senderId: userId,
            receiverId: target.id,
            message: messageToForward.message,
            messageType: "privateMessage",
            isMedia: messageToForward.isMedia || false,
            isAudio: messageToForward.isAudio || false,
            isForwarded: isForwardedFlag,
          });

          socket.emit("sendMessage", res.data.responce);

          setLastPrivateChats((prev) => {
            const exists = prev.find((chat) => chat._id === res.data.responce.chatId);
            if (exists) {
              return prev.map((chat) =>
                chat._id === res.data.responce.chatId
                  ? {
                      ...chat,
                      lastMessage: messageToForward.message,
                      lastMessageSenderId: userId,
                      isMedia: messageToForward.isMedia,
                      isAudio: messageToForward.isAudio,
                      lastMessageTime: new Date(),
                    }
                  : chat
              );
            }
            return [
              {
                _id: res.data.responce.chatId,
                members: [res.data.responce.senderId, res.data.responce.receiverId],
                lastMessage: messageToForward.message,
                lastMessageSenderId: res.data.responce.senderId,
                isMedia: messageToForward.isMedia,
                isAudio: messageToForward.isAudio,
                isGroup: false,
                lastMessageTime: new Date(),
              },
              ...prev,
            ];
          });
        } else if (target.type === "group") {
          const res = await axios.post(BACKEND_URL + "/message/sendGroupMessage", {
            senderId: userId,
            groupId: target.id,
            message: messageToForward.message,
            messageType: "groupMessage",
            isMedia: messageToForward.isMedia || false,
            isAudio: messageToForward.isAudio || false,
            isForwarded: isForwardedFlag,
          });

          socket.emit("sendMessage", res.data.responce);

          setLastGroupChats((prev) => {
            const exists = prev.find((chat) => chat._id === res.data.updatedChat._id);
            if (exists) {
              return prev.map((chat) =>
                chat._id === res.data.updatedChat._id
                  ? {
                      ...chat,
                      lastMessage: messageToForward.message,
                      lastMessageSenderId: userId,
                      isMedia: messageToForward.isMedia,
                      isAudio: messageToForward.isAudio,
                      lastMessageTime: new Date(),
                    }
                  : chat
              );
            }
            return [
              {
                _id: res.data.updatedChat._id,
                groupId: target.id,
                lastMessage: messageToForward.message,
                lastMessageSenderId: userId,
                isMedia: messageToForward.isMedia,
                isAudio: messageToForward.isAudio,
                isGroup: true,
                lastMessageTime: new Date(),
              },
              ...prev,
            ];
          });
        }
      }

      playSendSound();
      onClose();
    } catch (error) {
      console.log("Error forwarding message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4 animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden bg-surface text-text-base border border-border-color"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-color">
          <div className="flex items-center gap-x-2">
            <IoArrowRedo className="text-primary text-xl" />
            <h2 className="text-lg font-bold">Forward message to...</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sidebar-hover text-text-base transition"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Message Preview */}
        <div className="px-5 py-2.5 bg-primary-light/10 border-b border-border-color flex items-center gap-x-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <div className="text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            <span className="font-semibold text-primary">Forwarding: </span>
            {messageToForward?.isMedia ? (
              <span className="italic text-text-muted">📷 Photo</span>
            ) : messageToForward?.isAudio ? (
              <span className="italic text-text-muted">🎤 Voice note</span>
            ) : (
              <span className="text-text-base">
                "{messageToForward?.message}"
              </span>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts or groups..."
              className="w-full py-2 pl-9 pr-4 text-sm rounded-xl border border-border-color bg-input-bg text-text-base focus:outline-none focus:border-primary transition"
            />
            <IoSearch className="absolute left-3 top-2.5 text-text-dim text-base" />
          </div>
        </div>

        {/* List of Contacts */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 hide-scrollbar flex flex-col">
          {filteredTargets.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-sm text-text-muted">
              No contacts or groups found
            </div>
          ) : (
            filteredTargets.map((target) => {
              const isSelected = selectedTargets.some((t) => t.id === target.id);
              return (
                <div
                  key={target.id}
                  onClick={() => toggleSelectTarget(target)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? "bg-primary-light/20"
                      : "hover:bg-sidebar-hover"
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <img
                      src={
                        target.image ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={target.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{target.name}</p>
                      <span className="text-[10px] uppercase font-bold text-text-dim">
                        {target.type}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border-color flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-text-muted hover:bg-sidebar-hover transition"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedTargets.length === 0 || isSending}
            className={`px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all flex items-center gap-x-2 ${
              selectedTargets.length === 0 || isSending
                ? "bg-text-dim cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark active:scale-95 shadow-md"
            }`}
          >
            <IoArrowRedo />
            {isSending ? "Sending..." : `Send (${selectedTargets.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
