const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  } else {
    console.log("✅ PostgreSQL connected successfully");
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Railway Block Planning Backend is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend server is working",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      status: "OK",
      message: "Database connection is working",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});
app.get("/api/maintenance-tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM maintenance_tasks ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Maintenance tasks error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not fetch maintenance tasks",
      error: error.message,
    });
  }
});
app.post("/api/maintenance-tasks", async (req, res) => {
  try {
    const {
      task,
      department,
      location,
      type,
      priority,
      duration,
      dueDate
    } = req.body;

    if (!task || !department || !location || !dueDate) {
      return res.status(400).json({
        status: "ERROR",
        message: "Task, department, location and due date are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO maintenance_tasks
      (
        task_name,
        department,
        location,
        task_type,
        priority,
        duration,
        due_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
      RETURNING *
      `,
      [
        task,
        department,
        location,
        type,
        priority,
        duration,
        dueDate
      ]
    );

    res.status(201).json({
      status: "OK",
      message: "Maintenance task saved successfully",
      task: result.rows[0]
    });

  } catch (error) {
    console.error("Add maintenance task error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not save maintenance task",
      error: error.message
    });
  }
});
// ================= BLOCK REQUEST APIs =================

// GET - All Block Requests
app.get("/api/block-requests", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM block_requests ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Block requests error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not fetch block requests",
      error: error.message,
    });
  }
});


// POST - Create New Block Request
app.post("/api/block-requests", async (req, res) => {
  try {
    const {
  task,
  department,
  location,
  date,
  startTime,
  endTime,
  reason
} = req.body;
    if (
  !task ||
  !department ||
  !location ||
  !date ||
  !startTime ||
  !endTime
) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please provide all required fields",
      });
    }

    const result = await pool.query(
      `INSERT INTO block_requests
      (task_name, department, location, request_date, start_time, end_time, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
     [
        task,
        department,
        location,
        date,
        startTime,
        endTime,
        reason || ""
      ]
    );

    res.status(201).json({
      status: "OK",
      message: "Block request created successfully",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create block request error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not create block request",
      error: error.message,
    });
  }
});


// PUT - Approve / Reject Block Request
app.put("/api/block-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["Pending", "Approved", "Rejected", "Scheduled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid status",
      });
    }

    const result = await pool.query(
      `UPDATE block_requests
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Block request not found",
      });
    }

    res.json({
      status: "OK",
      message: `Block request ${status.toLowerCase()} successfully`,
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Update block request error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not update block request",
      error: error.message,
    });
  }
});
app.post("/api/block-requests", async (req, res) => {
  try {
    const {
      task,
      department,
      location,
      date,
      startTime,
      endTime,
      reason,
    } = req.body;

    if (!task || !department || !location || !date || !startTime || !endTime) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please fill all required fields",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO block_requests
      (
        task_name,
        department,
        location,
        request_date,
        start_time,
        end_time,
        reason,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
      RETURNING *
      `,
      [
        task,
        department,
        location,
        date,
        startTime,
        endTime,
        reason || "",
      ]
    );

    res.status(201).json({
      status: "OK",
      message: "Block request created successfully",
      request: result.rows[0],
    });

  } catch (error) {
    console.error("Block request insert error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not create block request",
      error: error.message,
    });
  }
});
// PUT - Reschedule Block Request
app.put("/api/block-requests/:id/reschedule", async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        status: "ERROR",
        message: "Start time and end time are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE block_requests
      SET start_time = $1,
          end_time = $2,
          status = 'Rescheduled'
      WHERE id = $3
      RETURNING *
      `,
      [startTime, endTime, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Block request not found",
      });
    }

    res.json({
      status: "OK",
      message: "Block rescheduled successfully",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Reschedule error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not reschedule block",
      error: error.message,
    });
  }
});
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚆 Railway backend running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error.message);
});
// ===============================
// MAINTENANCE TASK APIs
// ===============================

app.get("/api/maintenance", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM maintenance_tasks ORDER BY id DESC"
    );

    res.json({
      status: "OK",
      tasks: result.rows,
    });
  } catch (error) {
    console.error("Get maintenance error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not fetch maintenance tasks",
      error: error.message,
    });
  }
});


app.post("/api/maintenance", async (req, res) => {
  try {
    const {
      task_name,
      department,
      location,
      task_type,
      priority,
      duration,
      due_date,
    } = req.body;

    if (!task_name || !department || !location || !due_date) {
      return res.status(400).json({
        status: "ERROR",
        message: "Required fields are missing",
      });
    }

    const result = await pool.query(
      `INSERT INTO maintenance_tasks
      (task_name, department, location, task_type, priority, duration, due_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        task_name,
        department,
        location,
        task_type,
        priority,
        duration,
        due_date,
      ]
    );

    res.status(201).json({
      status: "OK",
      message: "Maintenance task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create maintenance error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not create maintenance task",
      error: error.message,
    });
  }
});


app.delete("/api/maintenance/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM maintenance_tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Maintenance task not found",
      });
    }

    res.json({
      status: "OK",
      message: "Maintenance task deleted successfully",
    });
  } catch (error) {
    console.error("Delete maintenance error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not delete maintenance task",
      error: error.message,
    });
  }
});