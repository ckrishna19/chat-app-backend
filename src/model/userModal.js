import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (val) {
          return validator.isEmail(val);
        },
        message: "Invalid Email format",
      },
    },
    password: {
      type: String,
      select: false,
      required: true,
      validate: {
        validator: function (val) {
          return validator.isStrongPassword(val);
        },
        message: "Weak password..",
      },
    },
    image: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
