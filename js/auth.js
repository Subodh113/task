// js/auth.js
document.addEventListener("DOMContentLoaded", async () => {

  /* ----------------------------------------------------------
     1️⃣  Fix Firebase reload issue
     Forces LOCAL persistence so redirect works
  ----------------------------------------------------------- */
  try {
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    console.log("🔥 Firebase Auth Persistence: LOCAL");
  } catch (err) {
    console.error("⚠ Persistence error:", err);
  }

  /* ----------------------------------------------------------
     2️⃣  Element references
  ----------------------------------------------------------- */
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const loginMsg = document.getElementById("loginMsg");

  /* ----------------------------------------------------------
     3️⃣  Department mapping
  ----------------------------------------------------------- */
  const emailDepartmentMap = {
    "hk@jll.com": "H&K",
    "me@jll.com": "M&E",
    "security@jll.com": "Security",
    "ehs@jll.com": "EHS",
  };

  /* ----------------------------------------------------------
     4️⃣  LOGIN (Ask name ONLY first time)
  ----------------------------------------------------------- */
  if (loginBtn)
    loginBtn.addEventListener("click", async () => {

      const email = emailEl.value.trim().toLowerCase();
      const pass = passEl.value;

      if (!email || !pass) {
        loginMsg.textContent = "Enter email & password";
        return;
      }

      try {
        // 🔥 Login Firebase
        await auth.signInWithEmailAndPassword(email, pass);

        const department = emailDepartmentMap[email] || "General";

        // Store user info
        localStorage.setItem("email", email);
        localStorage.setItem("role", "supervisor");
        localStorage.setItem("supervisorDept", department);

        // Supervisor name (ASK ONCE ONLY)
        let storedName = localStorage.getItem("supervisorName");

        if (!storedName || storedName.trim() === "") {
          const askName = prompt("Enter your name (Supervisor):");

          if (askName && askName.trim() !== "") {
            localStorage.setItem("supervisorName", askName.trim());
          } else {
            localStorage.setItem("supervisorName", "Supervisor");
          }
        }

        console.log("✅ Login successful:", localStorage.getItem("supervisorName"));

        // FINAL: Redirect
        window.location.href = "Home.html";

      } catch (err) {
        console.error("Login Error:", err);
        loginMsg.textContent = err.message || "Login failed";
      }
    });

  /* ----------------------------------------------------------
     5️⃣  SIGNUP (Admin creating supervisor)
  ----------------------------------------------------------- */
  if (signupBtn)
    signupBtn.addEventListener("click", async () => {

      const email = emailEl.value.trim().toLowerCase();
      const pass = passEl.value;

      if (!email || !pass) {
        loginMsg.textContent = "Enter email & password";
        return;
      }

      try {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        const department = emailDepartmentMap[email] || "General";

        // Save user to Firestore
        await db.collection("users").doc(cred.user.uid).set({
          email,
          role: "supervisor",
          department,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Store session
        localStorage.setItem("email", email);
        localStorage.setItem("role", "supervisor");
        localStorage.setItem("supervisorDept", department);

        // Ask name ONCE
        const askName = prompt("Enter your name (Supervisor):") || "Supervisor";
        localStorage.setItem("supervisorName", askName.trim());

        window.location.href = "Home.html";

      } catch (err) {
        console.error("Signup error:", err);
        loginMsg.textContent = err.message || "Signup failed";
      }
    });

  /* ----------------------------------------------------------
     6️⃣  Auto-fill date fields
  ----------------------------------------------------------- */
  document.querySelectorAll('input[type="date"]').forEach(input => {
    if (!input.value) input.value = new Date().toISOString().split("T")[0];
  });
});