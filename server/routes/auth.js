function signup() {
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;
  
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }
  
    localStorage.setItem("user", JSON.stringify({ username, password }));
    alert("Account created! Please login.");
    window.location.href = "login.html";
  }
  
  function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
  
    const storedUser = JSON.parse(localStorage.getItem("user"));
  
    if (storedUser && username === storedUser.username && password === storedUser.password) {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "index.html";
    } else {
      alert("Invalid credentials");
    }
  }
  
  // Auth Guard for index.html
  if (window.location.pathname.endsWith("index.html") && localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }
  