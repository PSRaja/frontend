const BASE_URL = "https://backend-1-kkqs.onrender.com/auth";

let otpSent = false;

function toggleForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");

  const title = document.getElementById("formTitle");
  title.innerText = title.innerText === "Login" ? "Register" : "Login";

  document.getElementById("message").innerText = "";
}

async function handleRegister() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const otpInput = document.getElementById("otp").value;
  const message = document.getElementById("message");
  const otpSection = document.getElementById("otpSection");
  const btn = document.getElementById("registerBtn");

  if (!otpSent) {
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        message.innerText = "OTP sent to your email!";
        otpSection.classList.remove("hidden");
        btn.innerText = "Verify OTP";
        otpSent = true;
      } else {
        message.innerText = data.message;
      }
    } catch (err) {
      message.innerText = "Server error!";
    }

  } else {
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp: otpInput })
      });

      const data = await res.json();

      if (res.ok) {
        message.innerText = "Registration successful!";
        otpSent = false;
        btn.innerText = "Create Account";
      } else {
        message.innerText = data.message;
      }

    } catch (err) {
      message.innerText = "Server error!";
    }
  }
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      message.innerText = "Login successful!";
       // Save token if backend sends it
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      //  Redirect to new page
      window.location.href = "dashboards.html";
    } else {
      message.innerText = data.message;
    }

  } catch (err) {
    message.innerText = "Server error!";
  }
}
