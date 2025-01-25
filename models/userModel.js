import mongoose from "mongoose";

const Schema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Define roles
      default: "user", // Default to "user"
    },
  },
  { timestamps: true }
); // Add this line

const User = mongoose.model("User", Schema);

export default User;
