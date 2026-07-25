import React from "react";
import { MessageItem } from "./MessageItem";

const MessageSkeleton = ({ darkmode }) => (
  <div className="animate-pulse space-y-4 px-2 py-4">
    <div className="flex justify-start">
      <div className="h-10 w-48 bg-surface-2 rounded-xl"></div>
    </div>
    <div className="flex justify-end">
      <div className="h-12 w-64 bg-primary-light rounded-xl"></div>
    </div>
    <div className="flex justify-start">
      <div className="h-8 w-36 bg-surface-2 rounded-xl"></div>
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-44 bg-primary-light rounded-xl"></div>
    </div>
  </div>
);

// Returns "Today", "Yesterday", or "DD MMM YYYY"
const getDateLabel = (dateStr) => {
  const messageDate = new Date(dateStr);
  const today = new Date();

  const toMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = (toMidnight(today) - toMidnight(messageDate)) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return messageDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isSameDay = (dateA, dateB) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const DateDivider = ({ label, darkmode }) => (
  <div className="flex items-center justify-center my-4">
    <div
      className="px-4 py-1 rounded-full text-xs font-semibold shadow-sm bg-surface text-text-muted border border-border-color"
    >
      {label}
    </div>
  </div>
);

export const MessageList = ({
  messages,
  messageLoading,
  loginUser,
  chatRef,
  userId,
  users,
  currentRightWindowType,
  onForwardMessage,
  group,
  searchMessageQuery,
  onReactToMessage,
}) => {
  // Filter messages based on search query
  const filteredMessages = messages.filter((message) => {
    if (!searchMessageQuery) return true;
    if (message.isMedia || message.isAudio) return false;
    return message.message?.toLowerCase().includes(searchMessageQuery.toLowerCase());
  });

  return (
    <div
      ref={chatRef}
      className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-chat-bg transition-all duration-500"
    >
      {messageLoading ? (
        <MessageSkeleton darkmode={loginUser?.darkmode} />
      ) : filteredMessages.length === 0 ? (
        <p className="text-center py-10 text-sm text-text-muted">
          {searchMessageQuery ? "No messages match your search." : "You haven't started conversation yet"}
        </p>
      ) : (
        filteredMessages.map((message, index) => {
          const prevMessage = filteredMessages[index - 1];

          // Show date divider if first message OR day changes from previous message
          const showDivider =
            index === 0 ||
            !isSameDay(message.createdAt, prevMessage?.createdAt);

          return (
            <React.Fragment key={message._id || index}>
              {showDivider && (
                <DateDivider
                  label={getDateLabel(message.createdAt)}
                  darkmode={loginUser?.darkmode}
                />
              )}
              <MessageItem
                message={message}
                index={index}
                messages={filteredMessages}
                userId={userId}
                users={users}
                currentRightWindowType={currentRightWindowType}
                onForwardMessage={onForwardMessage}
                group={group}
                onReactToMessage={onReactToMessage}
              />
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};
