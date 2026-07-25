import mongoose from "mongoose";

const defaultAvatarSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DefaultAvatar = mongoose.model("DefaultAvatar", defaultAvatarSchema);

export default DefaultAvatar;
