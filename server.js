const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) console.error("Database opening error: ", err);
  else console.log("Database connected!");
});

// Create tasks table with status
db.run(
  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    dueDate TEXT,
    completed INTEGER,
    status TEXT DEFAULT 'To Do'
  )`
);


// Routes

// Get all tasks
app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Add new task
app.post("/tasks", (req, res) => {
  const { title, dueDate, status, completed } = req.body;

  db.run(
    "INSERT INTO tasks (title, dueDate, completed, status) VALUES (?, ?, ?, ?)",
    [title, dueDate, completed || 0, status || "To Do"],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, dueDate, completed: completed || 0, status: status || "To Do" });
    }
  );
});


// Update task (status & completed)
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status, completed } = req.body;

  db.run(
    "UPDATE tasks SET status = ?, completed = ? WHERE id = ?",
    [status, completed, id],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ updated: this.changes });
    }
  );
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deleted: this.changes });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

