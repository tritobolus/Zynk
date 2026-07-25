import React, { useEffect, useRef } from "react";
import { ImAttachment } from "react-icons/im";
import { MdOutlineClose } from "react-icons/md";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import { useCC } from "../../../context/Context";
import { socket } from "../../../socket/socket";

export const ChatInput = ({
  loginUser: propLoginUser,
  attachment,
  setAttachment,
  isRecording,
  setIsRecording,
  recordingTime,
  formatTime,
  stopRecording,
  startRecording,
  isMediaLoding,
  message,
  setMessage,
  isEmoji,
  setIsEmoji,
  audioBlob,
  sendMessage,
}) => {
  const { currentRightWindow, currentRightWindowType, userId, loginUser } = useCC();
  const lastEmitRef = useRef(false);

  // Monitor message changes to emit typing status
  useEffect(() => {
    if (!userId || !currentRightWindow) return;

    const isCurrentlyTyping = message.trim().length > 0;

    if (isCurrentlyTyping !== lastEmitRef.current) {
      socket.emit("typing", {
        senderId: userId,
        senderName: loginUser?.username,
        chatType: currentRightWindowType,
        targetId: currentRightWindow,
        isTyping: isCurrentlyTyping,
      });
      lastEmitRef.current = isCurrentlyTyping;
    }

    let timeout;
    if (isCurrentlyTyping) {
      timeout = setTimeout(() => {
        socket.emit("typing", {
          senderId: userId,
          senderName: loginUser?.username,
          chatType: currentRightWindowType,
          targetId: currentRightWindow,
          isTyping: false,
        });
        lastEmitRef.current = false;
      }, 2500);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [message, currentRightWindow, currentRightWindowType, userId, loginUser]);

  // Clean up typing status when chat window switches or component unmounts
  useEffect(() => {
    return () => {
      if (userId && currentRightWindow) {
        socket.emit("typing", {
          senderId: userId,
          senderName: loginUser?.username,
          chatType: currentRightWindowType,
          targetId: currentRightWindow,
          isTyping: false,
        });
        lastEmitRef.current = false;
      }
    };
  }, [currentRightWindow, currentRightWindowType, userId, loginUser]);
  return (
    <div
      className="flex gap-x-4 justify-center items-center bg-surface border-t border-border-color px-4 py-3 transition-all duration-500"
    >
      {/* attachment */}
      <label className={`${isRecording && "hidden"} cursor-pointer`}>
        <ImAttachment size={20} className="text-text-muted" />
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
              className="h-10"
            />
            <MdOutlineClose
              className="hover:cursor-pointer text-text-base animation"
              size={25}
              onClick={() => {
                setAttachment(null);
              }}
            />
            {isMediaLoding && (
              <p className="text-red-500">wait image is sending...</p>
            )}
          </div>
        ) : isRecording ? (
          <div className="flex gap-x-5">
            <span className="animate-pulse">🔴</span>
            <p className="text-text-base">
              {formatTime(recordingTime)}
            </p>
            <button
              className="text-red-500 hover:cursor-pointer"
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (message.trim().length > 0 || attachment) {
                  sendMessage();
                  setMessage("");
                  setIsEmoji(false);
                }
              }
            }}
            className="rounded-full w-full px-6 py-2 bg-input-bg text-text-base transition-all duration-500 focus:outline-none"
          />
        )}

        {!attachment && (
          <BsEmojiSmile
            onClick={() => setIsEmoji(!isEmoji)}
            size={20}
            className={`${
              isRecording && "hidden"
            } absolute right-3 top-[11px] hover:cursor-pointer ${
              isEmoji ? "text-primary font-semibold" : "text-text-muted"
            }`}
          />
        )}
      </div>

      {/* Conditionally manage the icons of send message and record voice */}
      {message.trim().length < 1 && !attachment && !audioBlob ? (
        <button
          className="p-3 rounded-full bg-primary hover:cursor-pointer"
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
                setIsRecording(true);
                startRecording();
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
          className={`p-3 rounded-full bg-primary ${
            message.trim().length < 1 &&
            !attachment &&
            "opacity-50 hover:cursor-not-allowed"
          } hover:cursor-pointer`}
        >
          <IoSend size={17} className="text-xl text-white" />
        </button>
      )}
    </div>
  );
};
