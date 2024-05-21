import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 60,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 60,
    },
    email: {
      type: String,
      required: true,
      max: 60,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", UserSchema);
export default User;