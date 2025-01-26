import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
      required: function () {
        return this.provider === "local"; // Require password only for local users
      },
    },
    provider: {
      type: String,
      enum: ["local", "oauth"], // Define user source
      default: "local", // Default to local users
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Define roles
      default: "user", // Default to "user"
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
