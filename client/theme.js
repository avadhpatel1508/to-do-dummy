// theme.js
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggleBtn = document.getElementById("toggleTheme");
  
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      body.classList.add("dark");
      if (toggleBtn) toggleBtn.textContent = "☀️ Light Mode";
    }
  
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        body.classList.toggle("dark");
        const isDark = body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Night Mode";
      });
    }
  });
  