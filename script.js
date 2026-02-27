/* ================================
   BASE CONFIG
================================ */

const BASE_URL = "https://backend-1-kkqs.onrender.com";
const AUTH_URL = `${BASE_URL}/auth`;

let otpSent = false;

/* ================================
   FORM TOGGLE
================================ */

function toggleForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");

  const title = document.getElementById("formTitle");
  title.innerText = title.innerText === "Login" ? "Register" : "Login";

  document.getElementById("message").innerText = "";
}

/* ================================
   REGISTER WITH OTP
================================ */


async function handleRegister() {

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const otp = document.getElementById("otp")?.value.trim();

  const message = document.getElementById("message");
  const otpSection = document.getElementById("otpSection");
  const btn = document.getElementById("registerBtn");

  message.innerText = "";

  if (!firstName || !lastName || !email || !password) {
    message.innerText = "All fields required!";
    return;
  }

  try {

    // ======================
    // STEP 1 → SEND OTP
    // ======================
    if (!otpSent) {

      btn.innerText = "Sending...";
      btn.disabled = true;

      const res = await fetch(`${AUTH_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      btn.disabled = false;

      if (!res.ok) {
        btn.innerText = "Create Account";
        message.innerText = data.message || "Failed to send OTP";
        return;
      }

      message.innerText = "OTP sent to your email!";
      otpSection.classList.remove("hidden");
      btn.innerText = "Verify OTP";
      otpSent = true;

    }

    // ======================
    // STEP 2 → VERIFY + REGISTER
    // ======================
    else {

      if (!otp) {
        message.innerText = "Please enter OTP!";
        return;
      }

      btn.innerText = "Verifying...";
      btn.disabled = true;

      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, otp })
      });

      const data = await res.json();

      btn.disabled = false;

      if (!res.ok) {
        btn.innerText = "Verify OTP";
        message.innerText = data.message || "Registration failed";
        return;
      }

      message.innerText = "Registration Successful!";
      btn.innerText = "Create Account";
      otpSection.classList.add("hidden");
      otpSent = false;

      setTimeout(() => {
        toggleForm(); // Switch to login
      }, 1500);

    }

  } catch (err) {
    console.error(err);
    btn.disabled = false;
    message.innerText = "Server error!";
  }
}
/* ================================
   LOGIN
================================ */

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      message.innerText = "Login successful!";

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.name);
      }

      window.location.href = "dashboards.html";
    } else {
      message.innerText = data.message || "Login failed";
    }

  } catch (err) {
    message.innerText = "Server error!";
  }
}

/* ================================
   MEDIA CAPTURE SECTION
================================ */

let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let capturedBlob = null;

/* Show Capture Section */
function showCapture(){
  document.getElementById("captureSection").style.display = "block";
}

/* Start Camera */
async function startCamera(){
  try{
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true
    });

    const video = document.getElementById("video");
    video.srcObject = mediaStream;
    video.style.display = "block";

  }catch(err){
    alert("Camera permission denied or not available.");
  }
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
  if(!mediaStream){
    alert("Start camera first!");
    return;
  }

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

    stopCamera();   // Stop camera after photo

  },"image/jpeg");
}

/* Start Recording */
function startRecording(){
  if(!mediaStream){
    alert("Start camera first!");
    return;
  }

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

    stopCamera();
  };

  mediaRecorder.start();
}

/* Stop Recording */
function stopRecording(){
  if(mediaRecorder && mediaRecorder.state !== "inactive"){
    mediaRecorder.stop();
  }
}

/* Stop Camera */
function stopCamera(){
  if(mediaStream){
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

/* ================================
   UPLOAD TO BACKEND
================================ */

async function uploadCaptured(){
  if(!capturedBlob){
    alert("Capture something first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", capturedBlob);

  const token = localStorage.getItem("token");

  try{
    const res = await fetch(`${BASE_URL}/upload`,{
      method:"POST",
      headers:{
        Authorization:`Bearer ${token}`
      },
      body:formData
    });

    const data = await res.json();

    if(res.ok){
      alert("Uploaded Successfully!");
      console.log(data);
    }else{
      alert(data.message || "Upload failed");
    }

  }catch(err){
    alert("Server error during upload!");
  }
}