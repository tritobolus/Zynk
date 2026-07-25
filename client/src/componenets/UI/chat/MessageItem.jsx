import React, { useState, useRef, useEffect } from "react";
import {
  IoCheckmarkDoneSharp,
  IoArrowRedoOutline,
  IoArrowRedo,
  IoInformationCircleOutline,
  IoEllipsisVertical,
  IoHappyOutline,
} from "react-icons/io5";
import { VoicePlayer } from "./VoicePlayer";
import { ImageModal } from "./ImageModal";
import { MessageInfoModal } from "./MessageInfoModal";
import { ReactionDetailsModal } from "./ReactionDetailsModal";

const linkifyText = (text, isMyMessage) => {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all font-medium ${
            isMyMessage
              ? "text-white hover:text-gray-200"
              : "text-blue-600 hover:text-blue-800"
          }`}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const isOnlyEmojis = (str) => {
  if (!str) return false;
  const cleanStr = str.replace(/\s+/g, "");
  if (!cleanStr) return false;
  
  // Exclude standard ASCII symbols/digits and alphabetic chars
  const hasNormalText = /[a-zA-Z0-9\p{L}]/u.test(cleanStr);
  if (hasNormalText) return false;
  
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Component}|\p{Extended_Pictographic})+$/u;
  return emojiRegex.test(cleanStr);
};

const getEmojiCount = (str) => {
  if (!str) return 0;
  const cleanStr = str.replace(/\s+/g, "");
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(cleanStr)).length;
  }
  return Array.from(cleanStr).length;
};

export const MessageItem = ({
  message,
  index,
  messages,
  userId,
  users,
  currentRightWindowType,
  onForwardMessage,
  group,
  onReactToMessage,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [showReactions, setShowReactions] = useState(false);
  const reactionsContainerRef = useRef(null);

  // Close reactions popover when clicking outside
  useEffect(() => {
    if (!showReactions) return;
    const handleOutsideClick = (e) => {
      if (
        reactionsContainerRef.current &&
        !reactionsContainerRef.current.contains(e.target)
      ) {
        setShowReactions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showReactions]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const prevMessage = messages[index - 1];
  const isMyMessage = message.senderId === userId;

  const isPrevSameSender = prevMessage?.senderId === message.senderId;
  const isNextSameSender = messages[index + 1]?.senderId === message.senderId;

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

  const senderUser = users?.find((u) => u._id == message.senderId);

  // Group blue ticks: all members (except sender) have seen the message
  const isGroupAllSeen = (() => {
    if (currentRightWindowType !== "group" || !isMyMessage || !group?.members) return false;
    const otherMembers = group.members.filter((id) => id !== userId);
    return otherMembers.every((id) => message.seenBy?.includes(id));
  })();

  const emojiOnlyCheck = !message.isMedia && !message.isAudio && isOnlyEmojis(message.message);
  const emojiCount = emojiOnlyCheck ? getEmojiCount(message.message) : 0;
  const isEmojiOnly = emojiOnlyCheck && emojiCount <= 3;

  let emojiSizeClass = "";
  if (isEmojiOnly) {
    if (emojiCount === 1) emojiSizeClass = "text-5xl py-1 px-2";
    else if (emojiCount === 2) emojiSizeClass = "text-4xl py-1 px-2";
    else if (emojiCount === 3) emojiSizeClass = "text-3xl py-1 px-2";
  }

  const hasReactions = message.reactions && message.reactions.length > 0;
  const uniqueEmojis = hasReactions
    ? Array.from(new Set(message.reactions.map((r) => r.emoji)))
    : [];

  return (
    <>
      <div
        className={`group flex items-center gap-x-1 ${
          isMyMessage ? "justify-end" : "justify-start"
        } ${hasReactions ? "mb-3.5" : ""}`}
      >
        {/* ── Incoming message: forward button on the LEFT of bubble ── */}
        {!isMyMessage && (
          <button
            onClick={() => onForwardMessage && onForwardMessage(message)}
            title="Forward"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-sidebar-hover text-text-muted hover:text-text-base cursor-pointer"
          >
            <IoArrowRedoOutline size={15} />
          </button>
        )}

        {/* ── Outgoing message: reaction emoji picker on the LEFT of bubble ── */}
        {isMyMessage && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity" ref={reactionsContainerRef}>
            <button
              onClick={() => setShowReactions((prev) => !prev)}
              title="React"
              className="p-1.5 rounded-full hover:bg-sidebar-hover text-text-muted hover:text-text-base cursor-pointer"
            >
              <IoHappyOutline size={15} />
            </button>

            {showReactions && (
              <div className="absolute bottom-full left-0 mb-2 z-40 bg-surface border border-border-color shadow-lg rounded-full py-1 px-2.5 flex gap-x-1.5 animate-fade-in">
                {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReactToMessage && onReactToMessage(message._id, emoji);
                      setShowReactions(false);
                    }}
                    className="text-base hover:scale-130 transition active:scale-95 duration-100 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Message Bubble ── */}
        <div
          className={
            isEmojiOnly
              ? `relative max-w-xs flex flex-col ${
                  isMyMessage ? "items-end mr-2" : "items-start ml-2"
                } ${prevMessage?.senderId !== message.senderId ? "mt-2" : ""}`
              : `relative shadow text-sm max-w-xs ${
                  message.isMedia
                    ? "p-1.5 bg-primary text-white mr-2"
                    : isMyMessage
                    ? "bg-primary text-white mr-2 px-4 py-2 pb-2 pr-14"
                    : "bg-bubble-in text-bubble-in-text ml-2 px-4 py-2 pr-14 pb-2"
                } ${bubbleShape} ${prevMessage?.senderId !== message.senderId ? "mt-2" : ""}`
          }
        >
          {/* Forwarded label */}
          {message.isForwarded && (
            <div
              className={`flex items-center gap-x-1 text-[11px] italic font-medium mb-1 ${
                isMyMessage ? "text-primary-light/80" : "text-text-muted"
              }`}
            >
              <IoArrowRedo className="text-xs" />
              <span>Forwarded</span>
            </div>
          )}

          {/* Group sender name */}
          {message.senderId !== userId &&
            prevMessage?.senderId !== message.senderId &&
            currentRightWindowType === "group" && (
              <p className="font-semibold text-primary mb-1 text-xs">
                {senderUser?.username}
              </p>
            )}

          {/* Content */}
          {isEmojiOnly ? (
            <>
              {/* Big Emojis */}
              <div className={`select-none leading-none select-all ${emojiSizeClass}`}>
                {message.message}
              </div>
              {/* Small Timestamp Pill */}
              <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[9px] flex items-center gap-x-1 shadow-xs ${
                isMyMessage ? "bg-primary text-white" : "bg-bubble-in text-bubble-in-text"
              }`}>
                <span>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMyMessage && (
                  <IoCheckmarkDoneSharp
                    className={`text-[10px] ${
                      currentRightWindowType === "group"
                        ? isGroupAllSeen
                          ? "text-seen-tick"
                          : "text-white/60"
                        : message.isSeen
                        ? "text-seen-tick"
                        : "text-white/60"
                    }`}
                  />
                )}
              </div>
            </>
          ) : message.isMedia ? (
            <div
              onClick={() => setSelectedImage(message.message)}
              className="relative overflow-hidden rounded-lg cursor-pointer group/img max-w-[260px] sm:max-w-xs"
            >
              <img
                src={message.message}
                alt="attachment"
                className="w-full max-h-64 object-cover rounded-lg transition duration-300 border border-primary/40"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition" />
              <div className="absolute bottom-1.5 right-1.5 bg-black/55 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-md flex items-center gap-x-1 shadow-sm">
                <span>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMyMessage && (
                  <IoCheckmarkDoneSharp
                    className={`text-xs ${
                      currentRightWindowType === "group"
                        ? isGroupAllSeen
                          ? "text-seen-tick"
                          : "text-gray-300"
                        : message.isSeen
                        ? "text-seen-tick"
                        : "text-gray-300"
                    }`}
                  />
                )}
              </div>
            </div>
          ) : message.isAudio ? (
            <VoicePlayer audioUrl={message.message} isMyMessage={isMyMessage} />
          ) : (
            <p className="break-words">{linkifyText(message.message, isMyMessage)}</p>
          )}

          {/* Bubble tail */}
          {!isEmojiOnly && (
            <div
              className={`absolute top-0 rounded-t-md h-3 w-5 ${
                message.senderId === userId
                  ? `bg-primary rounded-l-xl mr-2 ${
                      messages[index - 1] && messages[index - 1].senderId === userId
                        ? "hidden"
                        : "-right-4 rounded-br-3xl"
                    }`
                  : `bg-bubble-in rounded-r-xl ml-2 ${
                      messages[index - 1] &&
                      messages[index - 1].senderId == message.senderId
                        ? "hidden"
                        : "-left-4 rounded-bl-3xl"
                    }`
              }`}
            />
          )}

          {/* Timestamp + ticks (non-media) */}
          {!message.isMedia && !isEmojiOnly && (
            <div className="absolute bottom-0 right-2 flex items-center gap-x-1">
              <p
                className={`text-[9px] ${
                  isMyMessage ? "text-white/70" : "text-text-muted"
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {isMyMessage && (
                <IoCheckmarkDoneSharp
                  className={`text-xs ${
                    currentRightWindowType === "group"
                      ? isGroupAllSeen
                        ? "text-seen-tick"
                        : "text-white/40"
                      : message.isSeen
                      ? "text-seen-tick"
                      : "text-white/40"
                  }`}
                />
              )}
            </div>
          )}

          {/* Reactions Pill overlay */}
          {hasReactions && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (currentRightWindowType === "group") {
                  setShowReactionModal(true);
                } else {
                  const myReaction = message.reactions.find((r) => r.senderId === userId);
                  if (myReaction) {
                    onReactToMessage && onReactToMessage(message._id, myReaction.emoji);
                  }
                }
              }}
              title={message.reactions.map((r) => {
                const reactant = users.find((u) => u._id === r.senderId);
                return `${reactant?.username || "Someone"} reacted ${r.emoji}`;
              }).join("\n")}
              className={`absolute -bottom-3.5 flex items-center gap-x-0.5 text-base select-none hover:scale-115 transition cursor-pointer z-20 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] ${
                isMyMessage ? "left-2" : "right-2"
              }`}
            >
              <span className="flex items-center">
                {uniqueEmojis.slice(0, 3).join("")}
              </span>
              {message.reactions.length > 1 && (
                <span className="text-[10px] font-bold text-text-base opacity-90 pl-0.5">
                  {message.reactions.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Incoming message: reaction emoji picker on the RIGHT of bubble ── */}
        {!isMyMessage && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity" ref={reactionsContainerRef}>
            <button
              onClick={() => setShowReactions((prev) => !prev)}
              title="React"
              className="p-1.5 rounded-full hover:bg-sidebar-hover text-text-muted hover:text-text-base cursor-pointer"
            >
              <IoHappyOutline size={15} />
            </button>

            {showReactions && (
              <div className="absolute bottom-full right-0 mb-2 z-40 bg-surface border border-border-color shadow-lg rounded-full py-1 px-2.5 flex gap-x-1.5 animate-fade-in">
                {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReactToMessage && onReactToMessage(message._id, emoji);
                      setShowReactions(false);
                    }}
                    className="text-base hover:scale-130 transition active:scale-95 duration-100 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Outgoing message: option button on the RIGHT of bubble ── */}
        {isMyMessage && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              title="Options"
              className="p-1.5 rounded-full hover:bg-sidebar-hover text-text-muted hover:text-text-base cursor-pointer"
            >
              <IoEllipsisVertical size={17} />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute bottom-0 right-7 z-30 bg-surface shadow-lg rounded-xl py-1 w-44 border border-border-color text-sm text-text-base animate-fade-in">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onForwardMessage && onForwardMessage(message);
                  }}
                  className="flex items-center gap-x-2 w-full px-4 py-2.5 hover:bg-sidebar-hover transition cursor-pointer"
                >
                  <IoArrowRedoOutline size={16} className="text-gray-500" />
                  Forward
                </button>

                {currentRightWindowType === "group" && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowInfoModal(true);
                    }}
                    className="flex items-center gap-x-2 w-full px-4 py-2.5 hover:bg-sidebar-hover transition cursor-pointer"
                  >
                    <IoInformationCircleOutline size={16} className="text-gray-500" />
                    Message Info
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* Message Info Modal */}
      {showInfoModal && (
        <MessageInfoModal
          message={message}
          group={group}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* Reaction Details Modal */}
      {showReactionModal && (
        <ReactionDetailsModal
          message={message}
          users={users}
          userId={userId}
          onReactToMessage={onReactToMessage}
          onClose={() => setShowReactionModal(false)}
        />
      )}
    </>
  );
};
