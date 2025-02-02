let loginAttempts = 0;
let lockoutTime = null;

async function getCsrfToken() {
  const response = await fetch("/get-csrf-token", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  return data.csrfToken;
}

async function login(event) {
  event.preventDefault();
  const errorMsg = document.getElementById("invalidPass");

  if (lockoutTime && Date.now() < lockoutTime) {
    const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 1000 / 60);
    errorMsg.style.display = "flex";
    errorMsg.textContent = `Too many failed attempts. Please wait ${remainingMinutes} minutes.`;
    return;
  }

  const passwordInput = document.getElementById("password").value.trim();
  const usernameInput = document.getElementById("username").value.trim();

  if (!passwordInput || !usernameInput) {
    errorMsg.style.display = "flex";
    errorMsg.textContent = "Please login with username and password!";
    return;
  }

  try {
    const csrfToken = await getCsrfToken();
    console.log(csrfToken);
    if (!csrfToken) {
      alert("CSRF token missing. Refresh the page.");
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ usernameInput, passwordInput }),
    });

    const data = await response.json();

    if (response.ok) {
      loginAttempts = 0;
      lockoutTime = null;

      window.location.href = "index.html";
    } else {
      loginAttempts++;
      const remainingTries = 3 - loginAttempts;

      if (response.status === 429) {
        errorMsg.textContent = data.message;
      } else if (loginAttempts >= 3) {
        lockoutTime = Date.now() + 5 * 60 * 1000;
        errorMsg.textContent =
          "Too many failed attempts. Please wait 5 minutes.";
      } else {
        errorMsg.textContent = `Invalid password. ${remainingTries} ${
          remainingTries === 1 ? "try" : "tries"
        } remaining.`;
      }
    }

    errorMsg.style.display = "flex";
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in.");
  }
}

document
  .querySelector("button[type='submit']")
  .addEventListener("click", login);

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("oauthButton")
    .addEventListener("click", async function () {
      const csrfToken = await getCsrfToken();
      console.log(csrfToken);
      window.location.href = "/login";
    });
});
