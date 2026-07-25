import express from "express";
import Group from "../models/group.js";

import { getIO } from "../socket/sokectInstance.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { groupName, superAdminId, members } = req.body;
    members.push(superAdminId);

    await Group.create({
      groupName,
      superAdminId,
      members,
    });
    res.status(200).json({ messge: "Group created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getGroups", async (req, res) => {
  try {
    const groupdata = await Group.find();
    res.status(200).json({ messge: "Group data received", groupdata });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/addMember", async (req, res) => {
  try {
    const { newMemberId, groupId } = req.body;
    // console.log(newMemberId, groupId);

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $push: { members: newMemberId },
      },
      { new: true },
    );

    const io = getIO();

    // notify the NEW USER
    io.to(newMemberId).emit("addedToGroup", {
      group: updatedGroup,
    });

    io.to(groupId).emit("groupUpdated", updatedGroup);

    res.status(200).json({ messge: "Added New Member" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/removeMemeber", async (req, res) => {
  try {
    const { removeMemberId, groupId } = req.body;
    console.log(removeMemberId, groupId);

     await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { adminId: removeMemberId },
      },
      { new: true },
    );

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { members: removeMemberId },
      },
      { new: true },
    );

    const io = getIO();
    io.to(removeMemberId).emit("removedFromGroup", { groupId });
    io.to(groupId).emit("groupUpdated", updatedGroup);

    res.status(200).json({ messge: "Removed Member" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/makeAdmin", async (req, res) => {
  try {
    const { memberId, groupId } = req.body;
    console.log(memberId, groupId);

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $push: { adminId: memberId },
      },
      { new: true },
    );

    const io = getIO();
    // io.to(removeMemberId).emit("makeGroupAdmin", { groupId });
    io.to(groupId).emit("groupUpdated", updatedGroup);

    res.status(200).json({ messge: "Added as group admin" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/removeAdmin", async (req, res) => {
  try {
    const { memberId, groupId } = req.body;
    console.log(memberId, groupId);

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { adminId: memberId },
      },
      { new: true },
    );

    const io = getIO();
    // io.to(removeMemberId).emit("makeGroupAdmin", { groupId });
    io.to(groupId).emit("groupUpdated", updatedGroup);

    res.status(200).json({ messge: "Remove as group admin" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
