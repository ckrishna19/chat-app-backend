import Message from "../model/messageModal.js";
import User from "../model/userModal.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/asyncHandler.js";

export const newMessageController = asyncHandler(async (req, res) => {
  const { text, receivedBy } = req?.body?.newMessage;
  if (!receivedBy) {
    throw new ApiError(403, "Receiver must not be empty");
  }
  if (!req.user) {
    throw new ApiError(403, "Unauthorized request");
  }
  const receiver = await User.findById(receivedBy);
  if (!receiver) {
    throw new ApiError(403, "Invalid receiver...");
  }

  const message = new Message({
    text,
    receivedBy: receiver?._id,
    sentBy: req?.user?._id,
  });
  await message.save();
  return res
    .status(201)
    .json(new ApiResponse(201, "new message", true, message));
});

export const getAllMessage = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "Unauthorized request");
  }
  const receiver = await User.findById(req.params.id);

  if (!receiver) {
    throw new ApiError(403, "Invalid receiver");
  }
  const messageList = await Message.find({
    $or: [
      { sentBy: req.user._id.toString(), receivedBy: req.params.id },
      { sentBy: req.params.id, receivedBy: req.user._id.toString() },
    ],
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Got message list", true, messageList));
});
