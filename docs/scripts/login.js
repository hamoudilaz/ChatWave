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
  let passwordInput = document.getElementById("password").value.trim();
  let usernameInput = document.getElementById("username").value.trim();

  passwordInput = DOMPurify.sanitize(passwordInput);
  usernameInput = DOMPurify.sanitize(usernameInput);

  if (!passwordInput || !usernameInput) {
    errorMsg.style.display = "flex";
    errorMsg.textContent = "Please login with username and password!";
    return;
  }

  try {
    const csrfToken = await getCsrfToken();

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
      window.location.href = "index.html";
    } else {
      errorMsg.style.display = "flex";
      errorMsg.textContent = data.message || "Invalid login credentials.";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector("button[type='submit']")
    .addEventListener("click", login);
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("oauthButton")
    .addEventListener("click", async function () {
      const csrfToken = await getCsrfToken();
      console.log(csrfToken);
      window.location.href = "/login";
    });
});
