/* 🌿 supervisor-common.js — Shared logic for all Supervisor pages */

/* -------------------------------------------------------------
   Auto-Hide Top & Bottom Navbar on Scroll
------------------------------------------------------------- */
let lastScrollY = 0;

window.addEventListener("scroll", () => {
  const topNav = document.getElementById("autoNav");
  const bottomNav = document.getElementById("bottomNav");
  const current = window.scrollY;

  if (!topNav && !bottomNav) return;

  // At top of page → always show
  if (current <= 0) {
    topNav?.classList.remove("hidden");
    bottomNav?.classList.remove("hidden");
    return;
  }

  // Scrolling down → hide navbars
  if (current > lastScrollY + 5) {
    topNav?.classList.add("hidden");
    bottomNav?.classList.add("hidden");
  }

  // Scrolling up → reveal navbars
  else if (current < lastScrollY - 5) {
    topNav?.classList.remove("hidden");
    bottomNav?.classList.remove("hidden");
    bottomNav?.classList.add("reveal");

    // Remove reveal animation safely
    setTimeout(() => bottomNav?.classList.remove("reveal"), 350);
  }

  lastScrollY = current;
});

/* -------------------------------------------------------------
   Toast Notification
------------------------------------------------------------- */
window.toast = function (msg, type = "success") {
  const el = document.getElementById("toast");
  if (!el) return;

  const bg = type === "error" ? "bg-red-600" : "bg-green-600";

  el.innerHTML = `
    <div class="${bg} text-white px-4 py-2 rounded shadow text-sm transition duration-300">
      ${msg}
    </div>
  `;

  setTimeout(() => {
    el.innerHTML = "";
  }, 3000);
};

/* -------------------------------------------------------------
   Safe HTML Escaping
------------------------------------------------------------- */
window.escapeHtml = function (str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
};

/* -------------------------------------------------------------
   Convert Units → Base Units
   Kg → g (x1000)
   L → ml (x1000)
------------------------------------------------------------- */
window.toBaseQty = function (amount, unit) {
  if (!amount || !unit) return amount;
  const u = unit.toLowerCase();

  if (u === "kg" || u === "kgs") return amount * 1000;
  if (u === "litre" || u === "l" || u === "litres") return amount * 1000;

  return amount; // g, ml, nos, pcs
};

/* -------------------------------------------------------------
   Convert Base Qty → Human Format
------------------------------------------------------------- */
window.formatReadable = function (val, unit) {
  if (val == null) return "-";
  const u = (unit || "").toLowerCase();

  // grams
  if (u === "g" || u === "gm" || u === "grams") {
    return val >= 1000
      ? (val / 1000).toFixed(2).replace(/\.00$/, "") + " Kg"
      : val + " g";
  }

  // millilitres
  if (u === "ml" || u === "millilitre" || u === "millilitres") {
    return val >= 1000
      ? (val / 1000).toFixed(2).replace(/\.00$/, "") + " Litre"
      : val + " ml";
  }

  // count items
  if (u === "nos" || u === "pcs" || u === "no" || u === "pieces") {
    return val + " pcs";
  }

  // direct
  return val + (unit ? " " + unit : "");
};

/* -------------------------------------------------------------
   Firestore Access Helper (optional)
   Ensures firebase-config.js is loaded first.
------------------------------------------------------------- */
window.getFirestore = function () {
  if (!window.firebase || !firebase.apps.length) {
    console.warn("⚠️ Firebase not initialized. Load firebase-config.js first.");
    return null;
  }
  return firebase.firestore();
};

/* -------------------------------------------------------------
   Query Selector Shortcut
------------------------------------------------------------- */
window.qs = sel => document.querySelector(sel);