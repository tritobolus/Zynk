import express from "express";
import Message from "../../models/message.js";
import Chat from "../../models/chat.js";
const router = express.Router();

router.post("/sendPrivateMessage", async (req, res) => {
  try {
    const { senderId, receiverId, message, messageType, isMedia, isAudio } =
      req.body;
    let chatId = "";
    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });
    // console.log("from send message route",chat)
    if(chat) chatId = chat._id

    if (!chat) {
      chat = await Chat.create({
        members: [senderId, receiverId],
        isMedia,
        isAudio
      });
      // console.log("inside chat creation", chat)
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
    });

    // 2. Update last message in Chat
    await Chat.findByIdAndUpdate(chat._id, {
      lastMessage: message,
      isMedia, // i have this isMedis and isAudio,, still i have no field visvible in db why ?
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
    const { senderId, groupId, message, messageType, isMedia, isAudio } =
      req.body;

      let chatId = "";

      let chat = await Chat.findOne({
        groupId: groupId
      })

      if(!chat) {
        chat = await Chat.create({
          groupId: groupId,
          isMedia: isMedia,
          isAudio: isAudio
        })
      }

      if(chat) chatId = chat._id
   
    const responce = await Message.create({
      senderId: senderId,
      groupId: groupId,
      chatId: chatId,
      message: message,
      messageType: messageType,
      isMedia: isMedia,
      isAudio: isAudio,
    });

   const updatedChat =  await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message,
      isMedia: isMedia, 
      isAudio: isAudio,
      isGroup: true,
      lastMessageTime: new Date(),
      lastMessageSenderId: senderId,
    }, { new: true })

    return res.status(200).json({ message: "message sent", responce, updatedChat });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getmessages", async (req, res) => {
  try {
    const { userA, userB } = req.query;
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
    const privateChats = await Chat.find({
      members: userId,
    }).sort({ lastMessageTime: -1 });

    const groupChats = await Chat.find({
      isGroup: true,
    }).sort({ lastMessageTime: -1 });

    return res.status(200).json({ message: "get all last chats", privateChats, groupChats });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getGroupMessages", async (req, res) => {
  try {
    const { groupId } = req.query;
    const messages = await Message.find({
      groupId: groupId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ message: "get all messages", messages });
  } catch (error) {
    console.log(error);
  }
});

export default router;
