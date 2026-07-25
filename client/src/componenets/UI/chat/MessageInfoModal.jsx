import React, { useEffect, useState } from "react";
import { IoClose, IoCheckmarkDoneSharp, IoTimeOutline } from "react-icons/io5";
import { useCC } from "../../../context/Context";
import axios from "axios";
import { BACKEND_URL } from "../../../constants";

export const MessageInfoModal = ({ message, group, onClose }) => {
  const { users, loginUser } = useCC();
  const [seenBy, setSeenBy] = useState(message?.seenBy || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!message?._id) return;

    const fetchLatestSeenBy = async () => {
      try {
        const res = await axios.get(BACKEND_URL + "/message/getMessageSeenBy", {
          params: { messageId: message._id },
        });
        setSeenBy(res.data.seenBy || []);
      } catch (error) {
        console.log("Error fetching seenBy:", error);
        setSeenBy(message?.seenBy || []);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSeenBy();
  }, [message?._id]);

  if (!message || !group) return null;

  const groupMembers = group.members || [];

  // Members who read the message (excluding the sender)
  const readByUsers = groupMembers
    .filter(
      (memberId) =>
        seenBy.includes(memberId) && memberId !== message.senderId
    )
    .map((memberId) => users.find((u) => u._id === memberId))
    .filter(Boolean);

  // Members who haven't read the message yet (excluding the sender)
  const notReadByUsers = groupMembers
    .filter(
      (memberId) =>
        !seenBy.includes(memberId) && memberId !== message.senderId
    )
    .map((memberId) => users.find((u) => u._id === memberId))
    .filter(Boolean);

  const messagePreview = message.isMedia
    ? "📷 Photo"
    : message.isAudio
    ? "🎤 Voice note"
    : message.message?.length > 40
    ? message.message.substring(0, 40) + "..."
    : message.message;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-surface text-text-base border border-border-color"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-color">
          <h2 className="text-base font-bold">Message Info</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sidebar-hover text-text-base transition"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Message Preview */}
        <div className="px-5 py-3 border-b border-border-color">
          <p className="text-xs text-text-muted mb-1">Message</p>
          <p
            className="text-sm font-medium text-text-base"
          >
            {messagePreview}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-96">
            {/* Read By */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-x-2 mb-3">
                <IoCheckmarkDoneSharp className="text-blue-500 text-lg" />
                <p className="text-xs font-bold uppercase text-blue-500 tracking-wide">
                  Read by ({readByUsers.length})
                </p>
              </div>

              {readByUsers.length === 0 ? (
                <p className="text-sm text-text-muted pl-1 mb-2">No one has read this yet</p>
              ) : (
                <div className="space-y-2">
                  {readByUsers.map((user) => (
                    <div key={user._id} className="flex items-center gap-x-3 py-1">
                      <img
                        src={
                          user.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={user.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <p className="text-sm font-medium">{user.username}</p>
                      <IoCheckmarkDoneSharp className="ml-auto text-blue-500 text-base" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mx-5 border-t border-border-color my-1" />

            {/* Not Read Yet */}
            <div className="px-5 pt-3 pb-5">
              <div className="flex items-center gap-x-2 mb-3">
                <IoTimeOutline className="text-text-muted text-lg" />
                <p className="text-xs font-bold uppercase text-text-muted tracking-wide">
                  Not read yet ({notReadByUsers.length})
                </p>
              </div>

              {notReadByUsers.length === 0 ? (
                <p className="text-sm text-text-muted pl-1">Everyone has read this!</p>
              ) : (
                <div className="space-y-2">
                  {notReadByUsers.map((user) => (
                    <div key={user._id} className="flex items-center gap-x-3 py-1">
                      <img
                        src={
                          user.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={user.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <p className="text-sm font-medium">{user.username}</p>
                      <IoCheckmarkDoneSharp className="ml-auto text-text-dim text-base" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
