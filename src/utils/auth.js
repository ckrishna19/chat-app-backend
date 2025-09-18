import { ApiError, asyncHandler } from "./asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../model/userModal.js";
export const auth = asyncHandler(async (req, res, next) => {
  const token = req?.cookies?.token?.split(" ")[1];

  if (!token) {
    throw new ApiError(403, "Unauthorized request");
  }
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "somethingsecret"
  );
  const authUser = await User.findById(decoded.id);
  if (!authUser) {
    throw new ApiError(403, "No user found...");
  }
  req.user = authUser;

  next();
});
