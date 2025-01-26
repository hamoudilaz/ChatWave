let currentUser = null; // Declare globally to store the logged-in user's info

async function validateUser() {
  const welcomeMessage = document.getElementById("welcomeMessage");
  try {
    const response = await fetch("/validateToken", {
      method: "POST",
      credentials: "include", // Include cookies
    });

    const data = await response.json();

    if (response.ok) {
      if (data.user) {
        // Display welcome message
        const displayName = data.user.name || data.user.username; // Use `name` for Auth0 or `username` for JWT
        const roleMessage = data.user.role === "admin" ? " (Admin)" : "";
        welcomeMessage.innerText = `Welcome, ${displayName}${roleMessage}`;

        // Store the user data globally
        currentUser = data.user;

        console.log(data.user);
      } else {
        throw new Error("User data missing in response.");
      }
    } else {
      window.location.href = "/login.html";
    }
  } catch (error) {
    console.error("Validation error:", error);
    alert("Error validating session. Redirecting to login.");
    window.location.href = "/login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  validateUser();
});

async function logout() {
  try {
    // Handle JWT logout (POST /logout)
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      alert("You Logged out");
      window.location.href = "/logout";
    } else {
      alert("Failed to log out.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred. Please try again.");
  }
}
