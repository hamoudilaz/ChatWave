document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const errorMessage = document.getElementById("error-message");
  const termsCheckbox = document.getElementById("terms");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const registerButton = document.querySelector("button[type='submit']");

  const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  const validateInputs = () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const isTermsChecked = termsCheckbox.checked;

    let isValid = true;

    if (!usernameRegex.test(username)) {
      usernameInput.classList.add("is-invalid");
      usernameInput.classList.remove("is-valid");
      isValid = false;
    } else {
      usernameInput.classList.remove("is-invalid");
      usernameInput.classList.add("is-valid");
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
      emailInput.classList.add("is-invalid");
      emailInput.classList.remove("is-valid");
      isValid = false;
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
    }

    if (password.length < 8 || !specialCharRegex.test(password)) {
      errorMessage.textContent =
        "Password must be at least 8 characters long and include a special character.";
      errorMessage.style.display = "block";
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      isValid = false;
    } else {
      passwordInput.classList.remove("is-invalid");
      passwordInput.classList.add("is-valid");
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match.";
      errorMessage.style.display = "block";
      confirmPasswordInput.classList.add("is-invalid");
      confirmPasswordInput.classList.remove("is-valid");
      isValid = false;
    } else if (isValid) {
      confirmPasswordInput.classList.remove("is-invalid");
      confirmPasswordInput.classList.add("is-valid");
    }

    if (
      password === confirmPassword &&
      password.length >= 8 &&
      specialCharRegex.test(password)
    ) {
      errorMessage.style.display = "none";
    }

    if (!isTermsChecked) {
      termsCheckbox.classList.add("is-invalid");
      isValid = false;
    } else {
      termsCheckbox.classList.remove("is-invalid");
    }

    registerButton.disabled = !isValid;
  };

  usernameInput.addEventListener("input", validateInputs);
  emailInput.addEventListener("input", validateInputs);
  passwordInput.addEventListener("input", validateInputs);
  confirmPasswordInput.addEventListener("input", validateInputs);
  termsCheckbox.addEventListener("change", validateInputs);

  registerButton.disabled = true;
});
