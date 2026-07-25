import mongoose from "mongoose";
import DefaultAvatar from "../models/defaultAvatar.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");

    // Seed default avatars if collection is empty or has fewer than 10
    // const count = await DefaultAvatar.countDocuments();
    // if (count < 10) {
    //   await DefaultAvatar.deleteMany({});
    //   const defaultUrls = [
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Buster",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Scooby",
    //     "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    //   ];
    //   await DefaultAvatar.insertMany(defaultUrls.map((url) => ({ url })));
    //   console.log("Seeded 10 default avatars collection");
    // }
  } catch (error) {
    console.log("Error to connect MongoDB", error);
  }
};

export default connectDB;