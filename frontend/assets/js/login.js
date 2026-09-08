document.addEventListener("DOMContentLoaded", () => {
if (new URLSearchParams(location.search).get("expired") === "1") {
    document.getElementById("expiredNotice").style.display = "block";
  }

  const togglePw = document.getElementById("togglePw");
  const pwInput = document.getElementById("password");
  togglePw.addEventListener("click", () => {
    const showing = pwInput.type === "text";
    pwInput.type = showing ? "password" : "text";
    togglePw.querySelector("i").className = showing ? "bi bi-eye" : "bi bi-eye-slash";
  });

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");
  const btn = document.getElementById("loginBtn");
  const btnText = document.getElementById("loginBtnText");
  const spinner = document.getElementById("loginSpinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      errorBox.textContent = "Enter both email and password.";
      errorBox.style.display = "block";
      return;
    }

    btn.disabled = true;
    btnText.textContent = "Signing in…";
    spinner.style.display = "inline-block";

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          throw new Error("Invalid email or password.");
        }
        throw new Error(`Login failed (${res.status})`);
      }

      const data = await res.json();
      if (!data.token) throw new Error("No token returned by server.");

      Auth.setSession(data.token, email);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message || "Something went wrong. Please try again.";
      errorBox.style.display = "block";
    } finally {
      btn.disabled = false;
      btnText.textContent = "Log in";
      spinner.style.display = "none";
    }
  });
});
