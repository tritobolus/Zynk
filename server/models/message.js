import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true,
        },
        receiverId: {
            type: String,
        },
        chatId: {
            type: String,
        },
        groupId: {
            type: String,
        },
        message: {
            type: String,
            required: true
        },
        messageType: {   // group message or private message
            type: String,
            required: true
        },
        isMedia: {      // is image or not
            type: Boolean,
            required: true
        },
        isAudio: {      // is voice message or not
            type: Boolean,
            required: true
        },
        isSeen: {       // seen / unseen state for private messages
            type: Boolean,
            default: false
        },
        isForwarded: {  // forwarded message tag
            type: Boolean,
            default: false
        },
        seenBy: {       // list of user IDs who have seen this message
            type: [String],
            default: []
        },
        reactions: {
            type: [
                {
                    senderId: { type: String, required: true },
                    emoji: { type: String, required: true }
                }
            ],
            default: []
        }
    }, 
    {
        timestamps: true
    }
)

const Message = mongoose.model("Message", messageSchema)

export default Message;