import React from "react";
import { IoClose, IoTrashOutline } from "react-icons/io5";

export const ReactionDetailsModal = ({
  message,
  users,
  userId,
  onReactToMessage,
  onClose,
}) => {
  if (!message || !message.reactions || message.reactions.length === 0) return null;

  const messageDate = new Date(message.createdAt);
  const formattedTime = messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = messageDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-surface text-text-base border border-border-color"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-color">
          <h2 className="text-base font-bold">Reactions</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sidebar-hover text-text-base transition cursor-pointer"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Message Preview */}
        <div className="px-5 py-3 bg-primary-light/5 border-b border-border-color flex flex-col gap-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Message Details</p>
          <div className="flex flex-col gap-y-1 bg-sidebar-hover/30 p-3 rounded-xl border border-border-color/40">
            {message.isMedia ? (
              <img
                src={message.message}
                alt="Media"
                className="max-h-24 w-auto object-contain rounded-lg self-start border border-border-color"
              />
            ) : message.isAudio ? (
              <p className="text-sm italic text-text-base flex items-center gap-x-2">
                🎤 Voice message
              </p>
            ) : (
              <p className="text-sm text-text-base break-words whitespace-pre-wrap leading-relaxed">
                {message.message}
              </p>
            )}
            <div className="flex items-center gap-x-1 text-[10px] text-text-muted mt-1.5">
              <span>{formattedDate}</span>
              <span className="opacity-60">•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Reactions List */}
        <div className="flex-1 overflow-y-auto max-h-96 p-4 space-y-3">
          {message.reactions.map((reaction, index) => {
            const reactant = users?.find((u) => u._id === reaction.senderId);
            const isMe = reaction.senderId === userId;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-hover transition"
              >
                <div className="flex items-center gap-x-3">
                  <img
                    src={
                      reactant?.profileImage ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={reactant?.username || "User"}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {reactant?.username || "Unknown User"}
                      {isMe && <span className="text-xs text-text-muted font-normal ml-1">(You)</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-x-3">
                  <span className="text-xl select-none">{reaction.emoji}</span>
                  {isMe && (
                    <button
                      onClick={() => {
                        onReactToMessage && onReactToMessage(message._id, reaction.emoji);
                        onClose();
                      }}
                      title="Remove Reaction"
                      className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-600 transition cursor-pointer"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
