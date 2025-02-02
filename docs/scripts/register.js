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
    console.log(data);
    console.log(data.csrfToken);
    return data.csrfToken;
  } catch (error) {
    console.error("CSRF Token Error:", error);
    return null;
  }
}
async function register() {
  const passwordInput = DOMPurify.sanitize(
    document.getElementById("password").value
  );
  const usernameInput = DOMPurify.sanitize(
    document.getElementById("username").value
  );
  const emailInput = DOMPurify.sanitize(document.getElementById("email").value);

  const takenMessage = document.getElementById("takenMessage");
  takenMessage.style.display = "none";

  const successMessage = document.getElementById("successMessage");

  try {
    // Fetch CSRF token
    const csrfToken = await getCsrfToken();

    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({ usernameInput, passwordInput, emailInput }),
    });

    const data = await response.json();
    console.log(data);

    if (response.status === 400 && data.message) {
      takenMessage.textContent = data.message;
      takenMessage.style.display = "block";
      return;
    }

    if (response.ok) {
      successMessage.style.display = "flex";
      successMessage.classList.add("show");
      successMessage.classList.remove("hide");

      setTimeout(() => {
        successMessage.classList.add("hide");
      }, 3000);
    } else {
      console.error("Error:", data.message);
      alert(data.message);
    }
  } catch (error) {
    console.error("Registration failed:", error);
  }
}

const registerButton = document.querySelector("button[type='submit']");
registerButton.addEventListener("click", register);
