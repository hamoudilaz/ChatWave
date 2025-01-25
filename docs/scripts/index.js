async function getProfile() {
  window.location.href = "/protected/profile";
}

document.getElementById("profileBtn").addEventListener("click", getProfile);

document.getElementById("createPostBtn").addEventListener("click", async () => {
  const postTitle = document.getElementById("postTitle").value.trim();
  const postContent = document.getElementById("postContent").value.trim();

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
      document.getElementById("postTitle").value = ""; // Clear title input
      document.getElementById("postContent").value = ""; // Clear content input
      loadPosts(); // Reload posts
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
      : post.userId?.username || "Anonymous";
  const postDate = new Date(post.createdAt).toLocaleString();

  const postElement = document.createElement("div");
  postElement.className = "post";

  postElement.innerHTML = `
<div class="post-header"> 
  
  <p><strong>${displayName} Posted:</strong></p>
  <div class="timeStamp">
    <div class="button-container"></div>
    <p class="post-timestamp">${postDate}</p>
  </div>
</div>
<h3 id="post-title">${post.title}</h3> 
<p class="post-content" id="content-${post._id}">${post.content}</p>
<div class="likes">Likes: <span>${post.likes.length || 0}</span></div>
<div class="comments-section" id="comments-${post._id}">
  <h4>Comments:</h4>
  <ul class="comments-list" id="comments-list-${post._id}">
    ${post.comments.map((comment) => createCommentElement(comment)).join("")}
  </ul>
  <textarea id="comment-input-${
    post._id
  }" placeholder="Write a comment..."></textarea>
  <button onclick="addComment('${post._id}')">Add Comment</button>
</div>
`;

  addPostButtons(post, postElement);

  return postElement;
}

function createCommentElement(comment) {
  const commentDate = new Date(comment.createdAt).toLocaleString();
  return `<li><strong>${comment.userId?.username || "Anonymous"}:</strong> ${
    comment.content
  } <small>(${commentDate})</small></li>`;
}

function addPostButtons(post, postElement) {
  const buttonContainer = postElement.querySelector(".button-container");

  // Like Button
  const likeButton = document.createElement("button");
  likeButton.className = "like-btn transparent-btn";
  likeButton.id = `like-btn-${post._id}`;
  likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i> <span>${
    post.likes.length || 0
  }</span>`;
  likeButton.addEventListener("click", () => toggleLike(post._id, likeButton));
  buttonContainer.appendChild(likeButton);

  // Existing buttons (Edit, Delete)
  if (currentUser.role === "admin" || post.userId?._id === currentUser.id) {
    const editButton = document.createElement("button");
    editButton.className = "edit-btn transparent-btn";
    editButton.id = `edit-btn-${post._id}`;
    editButton.innerHTML = `<i class="fas fa-pencil-alt"></i>`;
    editButton.addEventListener("click", () => editPost(post));
    buttonContainer.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn transparent-btn";
    deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteButton.addEventListener("click", () => deletePost(post._id));
    buttonContainer.appendChild(deleteButton);
  }
}
function renderPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = ""; // Clear the container

  if (posts.length === 0) {
    postsContainer.innerHTML =
      "<p>No posts available. Create one to get started!</p>";
    return;
  }

  posts.forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

async function loadPosts() {
  try {
    const posts = await fetchPosts();
    renderPosts(posts);
  } catch (error) {
    // Error already logged in fetchPosts
  }
}

// Call loadPosts after validateUser completes
(async function () {
  while (currentUser === null) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for validateUser to finish
  }
  loadPosts(); // Load posts once user is validated
})();

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      credentials: "include", // Include cookies
    });

    if (response.ok) {
      alert("Post deleted successfully!");
      loadPosts(); // Reload posts after deletion
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("An error occurred while deleting the post");
  }
}

const welcomeMessage = document.getElementById("welcomeMessage");

function editPost(post) {
  const postContentElement = document.getElementById(`content-${post._id}`);
  const editButton = document.getElementById(`edit-btn-${post._id}`);

  const currentContent = postContentElement.textContent;
  postContentElement.innerHTML = `
      <input type="text" id="edit-input-${post._id}" value="${currentContent}" class="edit-input">
      <div style="display: flex;">
      <button id="save-btn-${post._id}" class="save-btn">Save</button>
      <button id="cancel-btn-${post._id}" class="cancel-btn">Cancel</button>
      </div>
    `;

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
          loadPosts(); // Reload posts after editing
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
  const content = commentInput.value.trim();

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

      const newComment = document.createElement("li");
      const formattedDate = new Date(comment.createdAt).toLocaleString();
      newComment.innerHTML = `<strong>${
        comment.username || "Anonymous"
      }:</strong> ${comment.content} <small>(${formattedDate})</small>`;
      commentsList.appendChild(newComment);

      commentInput.value = ""; // Clear input field
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
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      const likesCount = likeButton.querySelector("span");
      likesCount.textContent = data.likesCount; // Update the like count
    } else {
      alert("Failed to toggle like.");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    alert("An error occurred while toggling like.");
  }
}
