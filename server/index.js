import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import getUser from "./routes/userRoute.js";
import authRoutes from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import groupRoutes from "./routes/groupRoute.js"
import settings from "./routes/settingsRoute.js"

import socketHandler from "./socket/socket.js";
import { setIO } from "./socket/sokectInstance.js";

// ------------------------------------------------------------------------

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://zynk-nine.vercel.app"
];

//soket connetion with cors configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

//pass to the to make a instace and use it every where
setIO(io)

// pass io to socket file
socketHandler(io);


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
