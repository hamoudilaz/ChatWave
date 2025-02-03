import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { handleLogin, handleRegister } from "../middlewares/authController.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import xss from "xss";
import csurf from "csurf";

const router = Router();

const csrfProtection = csurf({ cookie: true });

const validateCsrf = (req, res, next) => {
  console.log("CSRF TOKEN:", req.cookies._csrf);
  if (!req.cookies._csrf) {
    return res.status(403).json({ message: "CSRF toke is invalid or missing" });
  }
  next();
};

// TOKEN ROUTE
router.post("/validateToken", authenticateUser, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

router.get("/get-csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// REGISTER ROUTE
router.post("/register", csrfProtection, handleRegister);
// LOGIN ROUTE
router.post("/api/login", validateCsrf, handleLogin);

router.get("/loginPage", (req, res) => {
  res.sendFile("login.html", { root: "./docs" });
});
// LOGOUT ROUTE
router.post("/logout", (req, res) => {
  res
    .clearCookie("token", { httpOnly: true, sameSite: "strict" }) // Delete JWT
    .clearCookie("_csrf", { httpOnly: true, sameSite: "strict" }) // Delete CSRF token
    .status(200)
    .json({ message: "Logged out successfully" });
});

// MAIN PAGE ROUTE
router.get("/index.html", authenticateUser, (req, res) => {
  res.sendFile("index.html", { root: "./docs" });
});

router.get("/protected/dashboard", authenticateUser, (req, res) => {
  res.sendFile("protected/dashboard.html", { root: "./docs" });
});

router.get("/protected/profile", authenticateUser, (req, res) => {
  res.redirect("/protected/profile.html");
});

router.get("/protected/profile-data", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User data:", user);
    res.json({
      message: "User Profile",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});
// POST ROUTE
router.post("/api/posts", authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content cannot be empty" });
    }

    const sanitizedTitle = xss(title);
    const sanitizedContent = xss(content);

    const newPost = new Post({
      title: sanitizedTitle,
      content: sanitizedContent,
      userId: req.user.id,
    });

    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});
//
router.get("/api/posts", authenticateUser, async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId", "username role")
      .populate("comments.userId", "username")
      .populate("likes", "username");
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// DELETE ROUTE
router.delete("/api/posts/:id", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id.toString();
    const userRole = req.user.role;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (userRole !== "admin" && post.userId.toString() !== userId) {
      console.log("Unauthorized deletion attempt:", {
        postUserId: post.userId.toString(),
        userId: userId,
      });
      return res
        .status(403)
        .json({ message: "Unauthorized: You cannot delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

router.put("/api/posts/:id", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id.toString();
    const userRole = req.user.role;

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (userRole !== "admin" && post.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You cannot edit this post" });
    }

    post.content = content;
    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
});

router.post(
  "/api/posts/:postId/comments",
  authenticateUser,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res
          .status(400)
          .json({ message: "Comment content cannot be empty" });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const sanitizedContent = xss(content);

      const comment = {
        userId: req.user.id,
        content: sanitizedContent,
        createdAt: new Date(),
      };

      post.comments.push(comment);
      await post.save();

      const commentUser = await User.findById(req.user.id);
      res.status(200).json({
        message: "Comment added successfully",
        comment: {
          username: commentUser.username,
          content: comment.content,
          createdAt: comment.createdAt,
        },
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  }
);
router.post("/api/posts/:id/like", authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userIndex = post.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    const likedUsers = await User.find(
      { _id: { $in: post.likes } },
      "username"
    );

    res.status(200).json({
      likes: likedUsers.map((user) => ({
        id: user._id,
        username: user.username,
      })),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

router.get("/api/stats", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const postCount = await Post.countDocuments({ userId });

    const likedPosts = await Post.find({ likes: userId });
    const likeCount = likedPosts.length;

    const commentCount = await Post.countDocuments({
      "comments.userId": userId,
    });

    res.status(200).json({ postCount, likeCount, commentCount });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
