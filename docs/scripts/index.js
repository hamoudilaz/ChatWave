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
      : DOMPurify.sanitize(post.userId?.username || "Anonymous");

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
<div class="likes">
  <p>Likes: <span>${post.likes.length || 0}</span></p>
  <div class="liked-users">
    ${
      post.likes.length > 0
        ? post.likes.map((user) => `<span>${user.username}</span>`).join(", ")
        : "<small>No likes yet</small>"
    }
  </div>
</div>
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
  return `<li><strong>${DOMPurify.sanitize(
    comment.userId?.username || "Anonymous"
  )}:</strong> ${DOMPurify.sanitize(
    comment.content
  )} <small>(${commentDate})</small></li>`;
}

function addPostButtons(post, postElement) {
  const buttonContainer = postElement.querySelector(".button-container");

  // **Ensure Like Button is NOT recreated multiple times**
  let likeButton = buttonContainer.querySelector(`#like-btn-${post._id}`);
  if (!likeButton) {
    likeButton = document.createElement("button");
    likeButton.className = "like-btn transparent-btn";
    likeButton.id = `like-btn-${post._id}`;
    likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i> <span>${
      post.likes.length || 0
    }</span>`;

    // **Attach event listener ONLY ONCE**
    likeButton.addEventListener("click", () =>
      toggleLike(post._id, likeButton)
    );

    buttonContainer.appendChild(likeButton);
  } else {
    // **Only update the like count, do not add a new button**
    likeButton.querySelector("span").textContent = post.likes.length || 0;
  }

  if (currentUser.role === "admin" || post.userId?._id === currentUser.id) {
    let editButton = buttonContainer.querySelector(`#edit-btn-${post._id}`);
    if (!editButton) {
      editButton = document.createElement("button");
      editButton.className = "edit-btn transparent-btn";
      editButton.id = `edit-btn-${post._id}`;
      editButton.innerHTML = `<i class="fas fa-pencil-alt"></i>`;
      editButton.addEventListener("click", () => editPost(post));
      buttonContainer.appendChild(editButton);
    }

    let deleteButton = buttonContainer.querySelector(`#delete-btn-${post._id}`);
    if (!deleteButton) {
      deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn transparent-btn";
      deleteButton.id = `delete-btn-${post._id}`;
      deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
      deleteButton.addEventListener("click", () => deletePost(post._id));
      buttonContainer.appendChild(deleteButton);
    }
  }
}

function renderPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML =
      "<p>No posts available. Create one to get started!</p>";
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
      console.log(comment);
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
  const postElement = likeButton.closest(".post");
  const likesText = postElement.querySelector(".likes p span");
  const likeButtonCount = likeButton.querySelector("span"); // Like count inside button
  const likedUsersContainer = postElement.querySelector(".liked-users");

  let isLiking = !likeButton.classList.contains("liked"); // Check if user is liking or unliking

  // **Store old values in case request fails**
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

      // **Update UI only once after API response**
      likesText.textContent = newLikes;
      likeButtonCount.textContent = newLikes;
      likeButton.classList.toggle("liked", data.likes.includes(currentUser.id));

      likedUsersContainer.innerHTML =
        newLikes > 0
          ? data.likes.map((user) => `<span>${user.username}</span>`).join(", ")
          : "<small>No likes yet</small>";
    } else {
      throw new Error("Failed to toggle like.");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    alert("An error occurred while toggling like.");

    // **Revert UI if request fails**
    likesText.textContent = oldLikes;
    likeButtonCount.textContent = oldLikes;
    likeButton.classList.toggle("liked", oldLikedState);
  }
}
