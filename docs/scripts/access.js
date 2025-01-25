let currentUser = null; // Declare globally to store the logged-in user's info

async function validateUser() {
  const welcomeMessage = document.getElementById("welcomeMessage");
  try {
    const response = await fetch("/validateToken", {
      method: "POST",
      credentials: "include", // Include cookies
    });

    const data = await response.json();

    if (data.user.role === "admin") {
      welcomeMessage.innerText = `Welcome, ${data.user.username} (Admin)`;
    } else {
      welcomeMessage.innerText = `Welcome, ${data.user.username}`;
    }

    if (response.ok) {
      console.log(data);
      console.log(data.user.role);

      currentUser = data.user; // Store the user data globally
    } else {
      alert("Unauthorized access. Redirecting to login.");
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
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      alert("You have been logged out.");
      window.location.href = "login.html";
    } else {
      alert("Failed to log out.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred. Please try again.");
  }
}
