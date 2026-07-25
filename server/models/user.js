import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    },

    bio: {
      type: String,
      default: "This is DevTalk :)",
    },

    activestatus: {
      type: Boolean,
      default: true,
    },

    darkmode: {
      type: Boolean,
      default: false,
    },

    blocked: {
      type: [String],
    },
    
    blockedBy: {
      type: [String],
    },

    theme: {
      type: String,
      enum: ["violet", "midnight", "emerald", "ocean", "sunset"],
      default: "violet",
    },
    
    avatarShape: {
      type: String,
      enum: ["wobbly", "circle", "squircle", "blob2", "teardrop"],
      default: "wobbly",
    },
    
    customAvatars: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
