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

let mediaStream;
let mediaRecorder;
let recordedChunks = [];
let capturedBlob;

/* Show Capture Section */
function showCapture(){
  document.getElementById("captureSection").style.display = "block";
}

/* Start Camera */
async function startCamera(){
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
  });

  const video = document.getElementById("video");
  video.srcObject = mediaStream;
  video.style.display = "block";
}

/* Photo Mode */
function startPhotoMode(){
  startCamera();
}

/* Video Mode */
function startVideoMode(){
  startCamera();
}

/* Capture Photo */
function capturePhoto(){
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.drawImage(video,0,0);

  canvas.toBlob(blob=>{
    capturedBlob = blob;

    document.getElementById("preview").innerHTML =
      `<img src="${URL.createObjectURL(blob)}" width="100%">`;
  },"image/jpeg");
}

/* Start Recording */
function startRecording(){
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(mediaStream);

  mediaRecorder.ondataavailable = e=>{
    if(e.data.size > 0){
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = ()=>{
    capturedBlob = new Blob(recordedChunks,{type:"video/webm"});
    document.getElementById("preview").innerHTML =
      `<video src="${URL.createObjectURL(capturedBlob)}" controls width="100%"></video>`;
  };

  mediaRecorder.start();
}

/* Stop Recording */
function stopRecording(){
  mediaRecorder.stop();
}

/* Upload */
async function uploadCaptured(){
  if(!capturedBlob){
    alert("Capture something first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", capturedBlob);

  const token = localStorage.getItem("token");

  await fetch("https://your-backend-url/upload",{
    method:"POST",
    headers:{
      Authorization:`Bearer ${token}`
    },
    body:formData
  });

  alert("Uploaded Successfully!");
}
