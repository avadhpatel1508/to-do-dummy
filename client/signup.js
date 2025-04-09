document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
  
    const users = JSON.parse(localStorage.getItem("users")) || {};
  
    if (users[username]) {
      alert("Account already exists!");
    } else {
      users[username] = { password };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", username);
      window.location.href = "index.html";
    }
  });
  