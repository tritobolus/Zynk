import express from "express";
import User from '../models/user.js'
import { getIO } from "../socket/sokectInstance.js";

const router = express.Router();

router.get("/getuser", async(req, res) => {
    const users = await  User.find();
    return res.status(200).json({message: "get all user data", users: users})
})

router.post("/blockUser", async(req, res) => {
    const {blockById, blockId} = req.body;
  
    await User.findByIdAndUpdate(blockId, {
        $push: {blockedBy: blockById}
    })
    await User.findByIdAndUpdate(blockById, {
        $push: {blocked: blockId}
    })

    const io = getIO()
     io.to(blockById).emit("IBlockedUser", {
      blockId
    });

     io.to(blockId).emit("youAreBlocked", {
      blockById,
      blockId
    });

    // const users = await  User.find();
    return res.status(200).json({message: "Blocked user"})
})

router.post("/unblockUser", async(req, res) => {
    const {unBlockById, unBlockId} = req.body;
  
    await User.findByIdAndUpdate(unBlockId, {
        $pull: {blockedBy: unBlockById}
    })
    await User.findByIdAndUpdate(unBlockById, {
        $pull: {blocked: unBlockId}
    })

     const io = getIO()
     io.to(unBlockById).emit("IUnBlockedUser", {
      unBlockId
    });

     io.to(unBlockId).emit("youAreUnBlocked", {
      unBlockById,
      unBlockId
    });

    // const users = await  User.find();
    return res.status(200).json({message: "Blocked user"})
})


export default router;