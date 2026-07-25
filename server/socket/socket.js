import Message from "../models/message.js";
import Chat from "../models/chat.js";

const onlineUsers = new Map(); // userId -> socketId

export default function socketHandler(io) {
  io.on("connection", (socket) => {

    // User joins their personal room
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    // User joins a group room
    socket.on("joinGroup", (groupId) => {
      socket.join(groupId);
    });

    // Sending message
    socket.on("sendMessage", (data) => {
      const { receiverId, messageType, groupId } = data;
      if (messageType === "privateMessage") {
        io.to(receiverId).emit("receiveMessage", data);
      }
      if (messageType === "groupMessage") {
        io.to(groupId).emit("receiveMessage", data);
      }
    });

    // Message reaction
    socket.on("sendMessageReaction", (data) => {
      const { receiverId, messageType, groupId } = data;
      if (messageType === "privateMessage") {
        io.to(receiverId).emit("receiveMessageReaction", data);
      }
      if (messageType === "groupMessage") {
        io.to(groupId).emit("receiveMessageReaction", data);
      }
    });

    // Mark private messages as seen
    socket.on("markAsSeen", async ({ senderId, receiverId }) => {
      try {
        if (!senderId || !receiverId) return;
        await Message.updateMany(
          { senderId: senderId, receiverId: receiverId, isSeen: false },
          { $set: { isSeen: true }, $addToSet: { seenBy: receiverId } }
        );
        // Find the chat to get the chatId
        const chat = await Chat.findOne({
          isGroup: false,
          members: { $all: [senderId, receiverId] }
        });
        const chatId = chat ? chat._id : null;
        // Notify original sender that their messages were seen
        io.to(senderId).emit("messagesSeen", { senderId, receiverId, chatId });
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // Mark group messages as seen for a specific user
    socket.on("markGroupAsSeen", async ({ groupId, userId }) => {
      try {
        if (!groupId || !userId) return;

        // Find all unseen messages for this user in this group
        const unreadMessages = await Message.find({
          groupId: groupId,
          seenBy: { $ne: userId },
        }).select("_id seenBy");

        if (unreadMessages.length === 0) return;

        // Add userId to seenBy for all those messages
        await Message.updateMany(
          { groupId: groupId, seenBy: { $ne: userId } },
          { $addToSet: { seenBy: userId } }
        );

        // Get updated messages with their new seenBy arrays
        const updatedMessages = await Message.find({
          _id: { $in: unreadMessages.map((m) => m._id) },
        }).select("_id seenBy");

        // Broadcast seenBy updates to all group members
        io.to(groupId).emit("groupMessagesSeen", {
          groupId,
          seenByUserId: userId,
          updatedMessages: updatedMessages.map((m) => ({
            _id: m._id.toString(),
            seenBy: m.seenBy,
          })),
        });
      } catch (error) {
        console.error("Error marking group messages as seen:", error);
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { senderId, senderName, chatType, targetId, isTyping } = data;
      if (chatType === "private") {
        io.to(targetId).emit("userTyping", { senderId, senderName, chatType, targetId: senderId, isTyping });
      } else if (chatType === "group") {
        socket.to(targetId).emit("userTyping", { senderId, senderName, chatType, targetId, isTyping });
      }
    });

    // Update online users
    socket.on("user-online", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
}
