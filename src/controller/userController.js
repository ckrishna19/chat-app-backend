import User from "../model/userModal.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { asyncHandler, ApiError, ApiResponse } from "../utils/asyncHandler.js";
import sendMail from "../utils/sendMail.js";
const salt = 10;

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError(403, "This email is already registered..");
  }
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  await newUser.save();
  const token = generateToken({ id: newUser._id });

  return res
    .status(201)
    .cookie("token", `Bearer ${token}`, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(201, "user registered..", true, {
        ...newUser._doc,
        password: "",
      })
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(403, "This email is not registered yet");
  }
  const isMatch = await bcrypt.compare(password, user?.password);
  if (!isMatch) {
    throw new ApiError(403, "Invalid credentials...");
  }
  const token = generateToken({ id: user._id });

  return res
    .status(201)
    .cookie("token", `Bearer ${token}`, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(201, "Login success", true, {
        ...user._doc,
        password: "",
      })
    );
});

export const getAllProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "Unauthorized request");
  }
  const allUserExeceptMe = await User.find({
    _id: {
      $ne: req.user._id,
    },
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "user list", true, allUserExeceptMe));
});

export const getMyProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized request..");
  }
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(403, "No user found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "found my profile", true, user));
});

export const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "Unauthorized request");
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(403, "No user found...");
  }
  return res.status(201).json(new ApiResponse(201, "user found", true, user));
});

export const logOutUserController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(403, "Unauthorized request");
  }
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(403, "No such user found..");
  }
  return res
    .status(201)
    .clearCookie("token")
    .json(new ApiResponse(201, "logout success", true, null));
});

export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const registeredUser = await User.findOne({ email });
  if (!registeredUser) {
    throw new ApiError(403, "This is not valid credentials..");
  }
  const otp = generateOTP(6);

  await sendMail({
    to: registeredUser.email,
    subject: "OTP for password change",
    text: `Hi ${registeredUser.firstName} your opt is ${otp} and valid for only 5 min.`,
  });
  return res.status(201).json(
    new ApiResponse(201, "OTP sent to your Email please check", true, {
      otp,
      time: Date.now(),
    })
  );
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const time = +req.headers["time"];
  const headersOTP = req.headers["otp"];

  const valid = time + 5 * 60 * 1000;
  console.log(otp === headersOTP);

  if (!valid >= Date.now()) {
    throw new ApiError(403, "Otp expired please request once..");
  }
  if (headersOTP !== otp) {
    throw new ApiError(403, "Invalid otp");
  }
  return res.status(201).json(new ApiResponse(201, "otp verified", null, true));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const email = req.headers["email"];
  const { password } = req.body;
  const registeredUser = await User.findOne({ email }).select("+password");

  const compareOldPassword = await bcrypt.compare(
    password,
    registeredUser.password
  );
  if (compareOldPassword) {
    throw new ApiError(403, "This is old password... please try another");
  }
  const hashedPassword = await bcrypt.hash(password, salt);
  const updatedUser = await User.findByIdAndUpdate(
    registeredUser._id,
    { password: hashedPassword },
    { new: true, runValidators: true }
  );
  const token = generateToken({ id: registeredUser._id });
  return res
    .status(201)
    .cookie("token", `Bearer ${token}`, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    })
    .json(new ApiResponse(201, "password changed..", true, updatedUser));
});

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const generateOTP = (otpLength) => {
  let otp = "";
  for (let i = 0; i < otpLength; i++) {
    const num = Math.floor(Math.random() * 10);
    otp += num;
  }
  return otp;
};
