async function register() {
  const passwordInput = document.getElementById("password").value;
  const usernameInput = document.getElementById("username").value;
  const emailInput = document.getElementById("email").value;

  const takenMessage = document.getElementById("takenMessage");
  takenMessage.style.display = "none";

  const successMessage = document.getElementById("successMessage");

  const response = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
}

const registerButton = document.querySelector("button[type='submit']");
console.log(registerButton);
registerButton.addEventListener("click", () => {
  register();
});
