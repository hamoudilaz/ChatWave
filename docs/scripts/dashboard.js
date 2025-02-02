async function fetchStats() {
  try {
    const response = await fetch("/api/stats", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    const data = await response.json();

    document.getElementById("postCount").textContent = data.postCount;
    document.getElementById("likeCount").textContent = data.likeCount;
    document.getElementById("commentCount").textContent = data.commentCount;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchStats);
