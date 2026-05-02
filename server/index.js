import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import getUser from "./routes/userRoutes/userRoute.js";
import authRoutes from "./routes/authRoutes/authRoute.js";
import messageRoutes from "./routes/messageRoutes/messageRoute.js";
import groupRoutes from "./routes/groupRoutes/groupRoute.js"
import settings from "./routes/settingsRoute.js"

import socketHandler from "./socket/socket.js";
import { setIO } from "./socket/sokectInstance.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

connectDB();

//soket connetion with cors configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://average-prairie-milwaukee-lives.trycloudflare.com"],
    credentials: true,
  },
});

//pass to the to make a instace and use it every where
setIO(io)

// pass io to socket file
socketHandler(io);


const allowedOrigins = [
  "http://localhost:5173",
  "https://zynk-nine.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/authentication", authRoutes);
app.use("/message", messageRoutes);
app.use("/user", getUser);
app.use("/settings", settings)
app.use("/group", groupRoutes);

server.listen(8000, () => console.log("Server is runing..."));
