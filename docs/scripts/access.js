let currentUser = null;
async function getCsrfToken() {
  try {
    const response = await fetch("/get-csrf-token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`CSRF token request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("CSRF Token Error:", error);
    return null;
  }
}
async function validateUser() {
  const welcomeMessage = document.getElementById("welcomeMessage");
  try {
    const response = await fetch("/validateToken", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      if (data.user) {
        const displayName = data.user.name || data.user.username;
        const roleMessage = data.user.role === "admin" ? " (Admin)" : "";
        welcomeMessage.innerText = `Logged in as: ${displayName}${roleMessage}`;

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

document.getElementById("logout").addEventListener("click", logout);

async function logout() {
  const confirmed = confirm("Are you sure you want to log out?");
  if (!confirmed) {
    return;
  }

  try {
    const csrfToken = await getCsrfToken();

    const response = await fetch("/logout", {
      method: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      credentials: "include",
    });

    if (response.ok) {
      alert("Logged out successfully.");
      window.location.href = "/login.html";
    } else {
      alert("Failed to log out.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred. Please try again.");
  }
}
