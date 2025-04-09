const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/taskmanager');

const SECRET = 'my_secret_key';

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const userExists = await User.findOne({ username });
  if (userExists) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashed });
  await newUser.save();
  res.json({ message: 'Signup success' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Incorrect password' });

  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token });
});

app.post('/tasks', async (req, res) => {
  const { token, tasks, completed, score } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    user.tasks = tasks;
    user.completed = completed;
    user.score = score;
    await user.save();
    res.json({ message: 'Tasks saved' });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/getTasks', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    res.json({
      tasks: user.tasks || [],
      completed: user.completed || [],
      score: user.score || 0,
    });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
