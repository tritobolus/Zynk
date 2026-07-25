import express from "express";
import User from "../models/user.js";
import Group from "../models/group.js";
import { v2 as cloudinary } from "cloudinary";
import DefaultAvatar from "../models/defaultAvatar.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.patch("/changeUsername", async (req, res) => {
  try {
    const { userId, newUsername } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: newUsername }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "userame updated", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "username update faild" });
  }
});

router.patch("/changeGroupName", async (req, res) => {
  try {
    const { groupId, newGroupName } = req.body;
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { groupName: newGroupName }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "Group name updated", updatedGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Group name update faild" });
  }
});

router.patch("/changeBio", async (req, res) => {
  try {
    const { userId, newBio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio: newBio }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "bio updated", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "bio update faild" });
  }
});

router.patch("/changeGroupBio", async (req, res) => {
  try {
    const { groupId, newBio } = req.body;
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { bio: newBio }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "Group bio updated", updatedGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Group bio update faild" });
  }
});

router.patch("/changeActiveStatus", async (req, res) => {
  try {
    const { userId, currentStatus } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { activestatus: !currentStatus }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "Active status updated", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Active status update faild" });
  }
});

router.patch("/changeDarkMode", async (req, res) => {
  try {
    const { userId, currentDarkMode } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { darkmode: !currentDarkMode }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "Darkmode changed", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild to change darkmode" });
  }
});

router.patch("/changeProfileImage", async (req, res) => {
  try {
    const { imageUrl, userId } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "Profile image changed", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild to change profile image" });
  }
});
router.patch("/changeGroupProfileImage", async (req, res) => {
  try {
    const { imageUrl, groupId } = req.body;
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { profileImage: imageUrl }, // field to update
      { new: true }, // return updated document
    );

    res.status(200).json({ message: "Group profile image changed", updatedGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild to change group profile image" });
  }
});

router.patch("/changeTheme", async (req, res) => {
  try {
    const { userId, theme } = req.body;
    const validThemes = ["violet", "midnight", "emerald", "ocean", "sunset"];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ message: "Invalid theme" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    );
    res.status(200).json({ message: "Theme updated", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to change theme" });
  }
});

router.get("/defaultAvatars", async (req, res) => {
  try {
    const avatars = await DefaultAvatar.find({});
    res.status(200).json({ avatars });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch default avatars" });
  }
});

router.post("/addCustomAvatar", async (req, res) => {
  try {
    const { userId, url, publicId } = req.body;
    if (!url || !publicId) {
      return res.status(400).json({ message: "Url and publicId are required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { customAvatars: { url, publicId } },
        profileImage: url,
      },
      { new: true }
    );
    res.status(200).json({ message: "Custom avatar added", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add custom avatar" });
  }
});

router.patch("/selectAvatar", async (req, res) => {
  try {
    const { userId, imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: "imageUrl is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    );
    res.status(200).json({ message: "Avatar selected", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to select avatar" });
  }
});

router.post("/deleteCustomAvatar", async (req, res) => {
  try {
    const { userId, publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: "publicId is required" });
    }

    // 1. Retrieve the user to check if the deleted avatar is the current profileImage
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarToDelete = user.customAvatars.find((a) => a.publicId === publicId);
    if (!avatarToDelete) {
      return res.status(404).json({ message: "Avatar not found in custom list" });
    }

    // 2. Delete from Cloudinary if credentials exist
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dqxfpedkq",
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const cloudRes = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary destroy response for", publicId, ":", cloudRes);
      } catch (cloudinaryError) {
        console.log("Failed to delete from Cloudinary:", cloudinaryError);
      }
    } else {
      console.log("Cloudinary credentials missing; skipping remote delete for:", publicId);
    }

    // 3. Revert profile image to a default avatar if deleted avatar was active
    let newProfileImage = user.profileImage;
    if (user.profileImage === avatarToDelete.url) {
      const defaultAv = await DefaultAvatar.findOne({});
      newProfileImage = defaultAv ? defaultAv.url : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
    }

    // 4. Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { customAvatars: { publicId } },
        profileImage: newProfileImage,
      },
      { new: true }
    );

    res.status(200).json({ message: "Custom avatar deleted", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete custom avatar" });
  }
});

router.patch("/changeAvatarShape", async (req, res) => {
  try {
    const { userId, avatarShape } = req.body;
    const validShapes = ["wobbly", "circle", "squircle", "blob2", "teardrop"];
    if (!validShapes.includes(avatarShape)) {
      return res.status(400).json({ message: "Invalid avatar shape" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarShape },
      { new: true }
    );
    res.status(200).json({ message: "Avatar shape updated", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to change avatar shape" });
  }
});

export default router;
