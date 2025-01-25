async function fetchProfile() {
  try {
    const response = await fetch("/protected/profile-data", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      alert("Unauthorized access. Redirecting to login.");
      window.location.href = "/login.html";
      return;
    }

    const data = await response.json();
    console.log("Fetched Profile Data:", data);

    if (data.user) {
      const profileInfo = document.getElementById("profileInfo");
      const formattedDate = data.user.createdAt
        ? new Date(data.user.createdAt).toLocaleString()
        : "N/A";

      profileInfo.innerHTML = `
    <h2 class="section-title">Profile Information</h2>
    <p class="info-item"><strong>Username:</strong> ${
      data.user.username || "N/A"
    }</p>
    <p class="info-item"><strong>Role:</strong> ${data.user.role || "N/A"}</p>
    <p class="info-item"><strong>Account Created:</strong> ${formattedDate}</p>
  `;
    } else {
      console.error("User data is missing in the response.");
      alert("Failed to load profile data. Please try again.");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    alert("An error occurred. Redirecting to login.");
    window.location.href = "/login.html";
  }
}

fetchProfile();

async function logout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      alert("You have been logged out.");
      window.location.href = "/login.html";
    } else {
      alert("Failed to log out.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred. Please try again.");
  }
}
