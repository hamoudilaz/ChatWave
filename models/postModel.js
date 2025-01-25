import mongoose from "mongoose";

// Define a schema for comments
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } // Prevent mongoose from creating an _id for each comment
);

// Update the post schema
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Add title field
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [commentSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked the post
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
