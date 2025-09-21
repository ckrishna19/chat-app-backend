import express from "express";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/userRoute.js";
import { auth } from "./src/utils/auth.js";
import messageRouter from "./src/routes/messageRoute.js";
import socketConnection from "./src/utils/socket.js";
//initilize env configuration
dotenv.config();
// initilize app with express
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4001;

app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV_ORG === "dev"
        ? "http://localhost:5173"
        : "https://chat-app-frontend-utlu.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/v1/user", userRouter);
app.use("/v1/message", auth, messageRouter);

socketConnection(server);

app.use((err, req, res, next) => {
  if (err)
    return res.status(err.statusCode || 500).json({ message: err?.message });
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("database connected");
    server.listen(port, () => {
      console.log(`server is listining at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
