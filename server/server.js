const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON or form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve home.html from root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../home.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

// Serve signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/signup.html'));
});

// Serve main task manager page (index.html)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Serve completed tasks/history page
app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/history.html'));
});

// You can add your API routes here if needed
// Example: app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
