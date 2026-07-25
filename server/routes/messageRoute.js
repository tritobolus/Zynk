import express from "express";
import Message from "../models/message.js";
import Chat from "../models/chat.js";
const router = express.Router();

router.post("/sendPrivateMessage", async (req, res) => {
  try {
    const { senderId, receiverId, message, messageType, isMedia, isAudio, isForwarded } =
      req.body;
    let chatId = "";
    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (chat) chatId = chat._id;

    if (!chat) {
      chat = await Chat.create({
        members: [senderId, receiverId],
        isMedia,
        isAudio,
      });
      chatId = chat._id;
    }

    const responce = await Message.create({
      senderId,
      receiverId,
      chatId,
      message,
      messageType,
      isMedia,
      isAudio,
      isSeen: false,
      isForwarded: isForwarded || false,
      seenBy: [senderId],
    });

    await Chat.findByIdAndUpdate(chat._id, {
      lastMessage: message,
      isMedia,
      isAudio,
      isGroup: false,
      lastMessageTime: new Date(),
      lastMessageSenderId: senderId,
    });

    return res.status(200).json({ message: "message sent", responce });
  } catch (error) {
    console.log(error);
  }
});

router.post("/sendGroupMessage", async (req, res) => {
  try {
    const { senderId, groupId, message, messageType, isMedia, isAudio, isForwarded } =
      req.body;

    let chatId = "";
    let chat = await Chat.findOne({ groupId: groupId });

    if (!chat) {
      chat = await Chat.create({
        groupId: groupId,
        isMedia: isMedia,
        isAudio: isAudio,
      });
    }

    if (chat) chatId = chat._id;

    const responce = await Message.create({
      senderId: senderId,
      groupId: groupId,
      chatId: chatId,
      message: message,
      messageType: messageType,
      isMedia: isMedia,
      isAudio: isAudio,
      isForwarded: isForwarded || false,
      seenBy: [senderId], // sender has already "seen" their own message
    });

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: message,
        isMedia: isMedia,
        isAudio: isAudio,
        isGroup: true,
        lastMessageTime: new Date(),
        lastMessageSenderId: senderId,
      },
      { new: true }
    );

    return res.status(200).json({ message: "message sent", responce, updatedChat });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getmessages", async (req, res) => {
  try {
    const { userA, userB } = req.query;

    // Mark all messages from userB to userA as seen
    await Message.updateMany(
      { senderId: userB, receiverId: userA, isSeen: false },
      { $set: { isSeen: true }, $addToSet: { seenBy: userA } }
    );

    const messages = await Message.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({ message: "get all messages", messages });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getLastChats", async (req, res) => {
  try {
    const { userId } = req.query;
    const privateChatsRaw = await Chat.find({
      members: userId,
    }).sort({ lastMessageTime: -1 });

    const groupChatsRaw = await Chat.find({
      isGroup: true,
    }).sort({ lastMessageTime: -1 });

    const privateChats = await Promise.all(
      privateChatsRaw.map(async (chat) => {
        const chatObj = chat.toObject();
        const latestMsg = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });
        if (latestMsg) {
          chatObj.lastMessageSeen = latestMsg.isSeen;
          chatObj.lastMessageSeenBy = latestMsg.seenBy || [];
        } else {
          chatObj.lastMessageSeen = false;
          chatObj.lastMessageSeenBy = [];
        }
        return chatObj;
      })
    );

    const groupChats = await Promise.all(
      groupChatsRaw.map(async (chat) => {
        const chatObj = chat.toObject();
        const latestMsg = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });
        if (latestMsg) {
          chatObj.lastMessageSeen = latestMsg.isSeen;
          chatObj.lastMessageSeenBy = latestMsg.seenBy || [];
        } else {
          chatObj.lastMessageSeen = false;
          chatObj.lastMessageSeenBy = [];
        }
        return chatObj;
      })
    );

    const unreadCounts = {};
    if (userId) {
      // Private unread: messages sent to userId that are not seen
      const unreadPrivate = await Message.aggregate([
        { $match: { receiverId: userId, isSeen: false } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]);
      unreadPrivate.forEach((item) => {
        unreadCounts[item._id] = item.count;
      });

      // Group unread: messages in groups the user hasn't seen (excluding their own)
      const unreadGroup = await Message.aggregate([
        {
          $match: {
            groupId: { $exists: true, $ne: null },
            senderId: { $ne: userId },
            seenBy: { $ne: userId },
          },
        },
        { $group: { _id: "$groupId", count: { $sum: 1 } } },
      ]);
      unreadGroup.forEach((item) => {
        unreadCounts[item._id] = item.count;
      });
    }

    return res.status(200).json({
      message: "get all last chats",
      privateChats,
      groupChats,
      unreadCounts,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getGroupMessages", async (req, res) => {
  try {
    const { groupId, userId } = req.query;

    // Mark all unread messages in this group as seen for this user
    if (userId && groupId) {
      await Message.updateMany(
        { groupId: groupId, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );
    }

    const messages = await Message.find({
      groupId: groupId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ message: "get all messages", messages });
  } catch (error) {
    console.log(error);
  }
});

// Get seenBy info for a specific message (for Message Info modal)
router.get("/getMessageSeenBy", async (req, res) => {
  try {
    const { messageId } = req.query;
    const message = await Message.findById(messageId).select("seenBy senderId groupId");
    if (!message) return res.status(404).json({ message: "Message not found" });
    return res.status(200).json({ seenBy: message.seenBy, senderId: message.senderId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// React/Unreact to a message
router.post("/reactToMessage", async (req, res) => {
  try {
    const { messageId, senderId, emoji } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.senderId === senderId
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ senderId, emoji });
    }

    await message.save();
    return res.status(200).json({ message: "Reaction updated", reactions: message.reactions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
