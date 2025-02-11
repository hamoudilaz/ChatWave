async function getProfile() {
  window.location.href = "/protected/profile";
}

document.getElementById("profileBtn").addEventListener("click", getProfile);

document.getElementById("createPostBtn").addEventListener("click", async () => {
  const postTitle = DOMPurify.sanitize(
    document.getElementById("postTitle").value.trim()
  );
  const postContent = DOMPurify.sanitize(
    document.getElementById("postContent").value.trim()
  );

  if (!postTitle || !postContent) {
    alert("Title and content cannot be empty!");
    return;
  }

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: postTitle, content: postContent }),
    });

    if (response.ok) {
      alert("Post created successfully!");
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      localStorage.removeItem("cachedPosts");
      loadPosts();
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    alert("An error occurred while creating the post.");
  }
});
async function fetchPosts() {
  try {
    const response = await fetch("/api/posts", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to load posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    alert("An error occurred while loading posts.");
    throw error;
  }
}

function createPostElement(post) {
  const displayName =
    post.userId?.role === "admin"
      ? "Admin"
      : DOMPurify.sanitize(post.userId?.username || "Deleted User");

  const postDate = new Date(post.createdAt).toLocaleString();

  const postElement = document.createElement("div");
  postElement.className = "post";

  const postHeader = document.createElement("div");
  postHeader.className = "post-header";

  const controls = document.createElement("div");
  controls.className = "timeStamp";

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const timestamp = document.createElement("p");
  timestamp.className = "post-timestamp";
  timestamp.textContent = postDate;
  controls.appendChild(buttonContainer);
  postHeader.appendChild(timestamp);
  postHeader.appendChild(controls);
  postElement.appendChild(postHeader);

  // Author
  const author = document.createElement("p");
  author.className = "postAuthor";
  const strongElement = document.createElement("strong");
  strongElement.textContent = `${displayName} Posted:`;
  author.appendChild(strongElement);
  postElement.appendChild(author);

  // Title
  const title = document.createElement("h3");
  title.id = "post-title";
  title.textContent = post.title;
  postElement.appendChild(title);

  // Content
  const content = document.createElement("p");
  content.className = "post-content";
  content.id = `content-${post._id}`;
  content.textContent = post.content;
  postElement.appendChild(content);

  // Likes
  const likesSection = document.createElement("div");
  likesSection.className = "likes";

  const likesText = document.createElement("p");
  likesText.innerHTML = `Likes: <span>${post.likes.length || 0}</span>`;
  likesSection.appendChild(likesText);

  const likedUsers = document.createElement("div");
  likedUsers.className = "liked-users";
  if (post.likes.length > 0) {
    likedUsers.innerHTML = post.likes
      .map((user) => `<span>${user.username}</span>`)
      .join(", ");
  } else {
    likedUsers.innerHTML = "<small>No likes yet</small>";
  }
  likesSection.appendChild(likedUsers);
  postElement.appendChild(likesSection);

  // Comments Section
  const commentsSection = document.createElement("div");
  commentsSection.className = "comments-section";
  commentsSection.id = `comments-${post._id}`;

  const commentsTitle = document.createElement("h4");
  commentsTitle.textContent = "Comments:";
  commentsSection.appendChild(commentsTitle);

  const commentsList = document.createElement("ul");
  commentsList.className = "comments-list";
  commentsList.id = `comments-list-${post._id}`;

  // Add each comment dynamically
  post.comments.forEach((comment) => {
    const commentElement = createCommentElement(comment);
    commentsList.appendChild(commentElement);
  });

  commentsSection.appendChild(commentsList);

  const commentInput = document.createElement("textarea");
  commentInput.id = `comment-input-${post._id}`;
  commentInput.placeholder = "Write a comment...";
  commentsSection.appendChild(commentInput);

  const addCommentButton = document.createElement("button");
  addCommentButton.className = "add-comment-btn";
  addCommentButton.setAttribute("data-post-id", post._id);
  addCommentButton.textContent = "Add Comment";

  commentsSection.appendChild(addCommentButton);
  postElement.appendChild(commentsSection);

  addPostButtons(post, postElement);

  return postElement;
}

function createCommentElement(comment) {
  const commentDate = new Date(comment.createdAt).toLocaleString();
  const commentItem = document.createElement("li");

  const strong = document.createElement("strong");
  strong.textContent =
    DOMPurify.sanitize(comment.userId?.username || "Deleted User") + ": ";

  const commentText = document.createElement("span");
  commentText.textContent = comment.content;

  const small = document.createElement("small");
  small.textContent = ` (${commentDate})`;

  commentItem.appendChild(strong);
  commentItem.appendChild(commentText);
  commentItem.appendChild(small);

  return commentItem;
}

function addPostButtons(post, postElement) {
  const buttonContainer = postElement.querySelector(".button-container");

  let likeButton = buttonContainer.querySelector(`#like-btn-${post._id}`);
  if (!likeButton) {
    likeButton = document.createElement("button");
    likeButton.className = "like-btn transparent-btn";
    likeButton.id = `like-btn-${post._id}`;

    const likeIcon = document.createElement("i");
    likeIcon.className = "fas fa-thumbs-up";

    const likeCount = document.createElement("span");
    likeCount.className = "likeCount";
    likeCount.textContent = post.likes.length || 0;

    likeButton.appendChild(likeIcon);
    likeButton.appendChild(document.createTextNode(" "));
    likeButton.appendChild(likeCount);
    likeButton.addEventListener("click", () =>
      toggleLike(post._id, likeButton)
    );

    buttonContainer.appendChild(likeButton);
  } else {
    likeButton.querySelector("span").textContent = post.likes.length || 0;
  }

  if (currentUser.role === "admin" || post.userId?._id === currentUser.id) {
    let editButton = buttonContainer.querySelector(`#edit-btn-${post._id}`);
    if (!editButton) {
      editButton = document.createElement("button");
      editButton.className = "edit-btn transparent-btn";
      editButton.id = `edit-btn-${post._id}`;

      const editIcon = document.createElement("i");
      editIcon.className = "fas fa-pencil-alt";

      editButton.appendChild(editIcon);
      editButton.addEventListener("click", () => editPost(post));
      buttonContainer.appendChild(editButton);
    }

    let deleteButton = buttonContainer.querySelector(`#delete-btn-${post._id}`);
    if (!deleteButton) {
      deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn transparent-btn";
      deleteButton.id = `delete-btn-${post._id}`;

      const deleteIcon = document.createElement("i");
      deleteIcon.className = "fas fa-trash"; // FontAwesome class

      deleteButton.appendChild(deleteIcon);
      deleteButton.addEventListener("click", () => deletePost(post._id));
      buttonContainer.appendChild(deleteButton);
    }
  }
}

function renderPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.textContent = "";

  if (posts.length === 0) {
    const noPostsMessage = document.createElement("p");
    noPostsMessage.textContent =
      "No posts available. Create one to get started!";
    postsContainer.appendChild(noPostsMessage);
    return;
  }

  posts.reverse().forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

async function loadPosts() {
  const cachedPosts = localStorage.getItem("cachedPosts");

  if (cachedPosts) {
    renderPosts(JSON.parse(cachedPosts));
  }

  try {
    const posts = await fetchPosts();
    renderPosts(posts);

    localStorage.setItem("cachedPosts", JSON.stringify(posts));
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

(async function () {
  while (currentUser === null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  loadPosts();
})();

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      localStorage.removeItem("cachedPosts");
      loadPosts();
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("An error occurred while deleting the post.");
  }
}

const welcomeMessage = document.getElementById("welcomeMessage");

function editPost(post) {
  const postContentElement = document.getElementById(`content-${post._id}`);
  const editButton = document.getElementById(`edit-btn-${post._id}`);

  const currentContent = postContentElement.textContent;
  postContentElement.textContent = "";

  const input = document.createElement("input");
  input.type = "text";
  input.id = `edit-input-${post._id}`;
  input.value = currentContent;
  input.classList.add("edit-input");

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";

  const saveButton = document.createElement("button");
  saveButton.id = `save-btn-${post._id}`;
  saveButton.classList.add("save-btn");
  saveButton.textContent = "Save";

  const cancelButton = document.createElement("button");
  cancelButton.id = `cancel-btn-${post._id}`;
  cancelButton.classList.add("cancel-btn");
  cancelButton.textContent = "Cancel";

  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(cancelButton);

  postContentElement.appendChild(input);
  postContentElement.appendChild(buttonContainer);

  document
    .getElementById(`save-btn-${post._id}`)
    .addEventListener("click", async () => {
      const newContent = document
        .getElementById(`edit-input-${post._id}`)
        .value.trim();

      if (!newContent) {
        alert("Post content cannot be empty.");
        return;
      }

      try {
        const response = await fetch(`/api/posts/${post._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newContent }),
        });

        if (response.ok) {
          alert("Post updated successfully!");
          loadPosts();
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to update post");
        }
      } catch (error) {
        console.error("Error updating post:", error);
        alert("An error occurred while updating the post");
      }
    });

  document
    .getElementById(`cancel-btn-${post._id}`)
    .addEventListener("click", () => {
      postContentElement.textContent = currentContent;
      editButton.style.display = "inline-block";
    });

  editButton.style.display = "none";
}

async function addComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const content = DOMPurify.sanitize(commentInput.value.trim());

  if (!content) {
    alert("Comment content cannot be empty!");
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      const { comment } = await response.json();

      const commentsList = document.getElementById(`comments-list-${postId}`);
      console.log("commentsList", comment);
      const newComment = document.createElement("li");
      const formattedDate = new Date(comment.createdAt).toLocaleString();
      newComment.innerHTML = `<strong>${
        comment.username || "Deleted User"
      }:</strong> ${comment.content} <small>(${formattedDate})</small>`;
      commentsList.appendChild(newComment);

      commentInput.value = "";
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to add comment");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("An error occurred while adding the comment.");
  }
}

async function toggleLike(postId, likeButton) {
  const postElement = likeButton.closest(".post");
  const likesText = postElement.querySelector(".likes p span");
  const likeButtonCount = likeButton.querySelector("span");
  const likedUsersContainer = postElement.querySelector(".liked-users");

  let isLiking = !likeButton.classList.contains("liked");

  const oldLikes = parseInt(likesText.textContent, 10) || 0;
  const oldLikedState = likeButton.classList.contains("liked");

  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      const newLikes = data.likes.length;

      likesText.textContent = newLikes;
      likeButtonCount.textContent = newLikes;
      likeButton.classList.toggle("liked", data.likes.includes(currentUser.id));

      likedUsersContainer.textContent = "";

      if (newLikes > 0) {
        data.likes.forEach((user, index) => {
          const userSpan = document.createElement("span");
          userSpan.textContent = user.username;

          likedUsersContainer.appendChild(userSpan);

          if (index < data.likes.length - 1) {
            likedUsersContainer.appendChild(document.createTextNode(", "));
          }
        });
      } else {
        const noLikesMessage = document.createElement("small");
        noLikesMessage.textContent = "No likes yet";
        likedUsersContainer.appendChild(noLikesMessage);
      }
    } else {
      throw new Error("Failed to toggle like.");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    alert("An error occurred while toggling like.");

    likesText.textContent = oldLikes;
    likeButtonCount.textContent = oldLikes;
    likeButton.classList.toggle("liked", oldLikedState);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const postsContainer = document.getElementById("postsContainer");

  if (postsContainer) {
    postsContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("add-comment-btn")) {
        const postId = event.target.getAttribute("data-post-id");
        addComment(postId);
      }
    });
  } else {
    console.error("Error: postsContainer not found");
  }
});
