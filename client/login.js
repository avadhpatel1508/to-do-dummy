function loginUser() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const users = JSON.parse(localStorage.getItem("users")) || {};
  
    if (users[username] && users[username].password === password) {
      localStorage.setItem("currentUser", username);
      window.location.href = "index.html";
    } else {
      alert("Invalid username or password!");
    }
  }
  