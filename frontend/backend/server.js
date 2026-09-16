// ===============================
// MAINTENANCE TASK APIs
// (single source of truth — frontend calls these /api/maintenance routes;
// the old duplicate /api/maintenance-tasks routes with different field
// naming were unused dead code and have been removed)
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
      description,
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

    // ✅ FIXED: previously had a duplicated "INSERT INTO maintenance_tasks"
    // line here which produced a SQL syntax error on every save.
    const result = await pool.query(
      `INSERT INTO maintenance_tasks
      (task_name, description, department, location, task_type, priority, duration, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        task_name,
        description,
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

// ================= AI PLANNING API =================
// Real AI-powered block plan generation using Anthropic Claude.
// Frontend sends current tasks / trainSchedule / blockRequests, we build a
// prompt from that data and let Claude reason about the safest maintenance
// windows, then send the plain-text plan back. This is DECISION SUPPORT
// ONLY — nothing here writes to the database or changes any status.

app.post("/api/ai-plan", async (req, res) => {
  try {
    const { tasks, trainSchedule, blockRequests } = req.body;

    if (!tasks || !trainSchedule) {
      return res.status(400).json({
        status: "ERROR",
        message: "tasks and trainSchedule are required",
      });
    }

    const prompt = `
You are an expert railway maintenance block planner.

Maintenance Tasks:
${JSON.stringify(tasks, null, 2)}

Train Schedule:
${JSON.stringify(trainSchedule, null, 2)}

Existing Block Requests:
${JSON.stringify(blockRequests || [], null, 2)}

Task: Look at pending high-priority maintenance tasks. For each one, check
if there are train movements at the same location and date. Recommend the
safest maintenance block time window (start and end time) that avoids
conflicts with trains. Explain your reasoning briefly for each
recommendation. Keep the response concise, structured with a short heading
per task.
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const planText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({
      status: "OK",
      plan: planText,
    });
  } catch (error) {
    console.error("AI plan error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not generate AI plan",
      error: error.message,
    });
  }
});

// ================= AI TASK EXTRACTION (Module 1 + 2 foundation) =================
// Raw description (typed or transcribed from voice, Hindi/English/mixed)
// goes in, structured suggestion fields come out. This is DECISION SUPPORT
// ONLY: it never creates, saves, approves, or modifies any task or block —
// the human still fills in / edits the form and clicks Save themselves.

app.post("/api/ai-extract-task", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: "ERROR",
        message: "description is required",
      });
    }

    const prompt = `
You are helping a railway maintenance planner. A field user submitted this
task description (it may be in Hindi, English, or mixed/Hinglish, typed or
transcribed from voice):

"""
${description}
"""

Extract structured information as STRICT JSON only, no markdown, no
explanation, matching exactly this shape:

{
  "detected_language": string,
  "department": "Engineering" | "S&T" | "Traction" | "Unknown",
  "asset": string,
  "location": string,
  "issue": string,
  "severity": "High" | "Medium" | "Low",
  "urgency": "Immediate" | "Scheduled" | "Routine",
  "work_type": "Track Maintenance" | "Signal Maintenance" | "OHE Maintenance" | "Inspection" | "Emergency Repair",
  "estimated_duration": string,
  "safety_impact": string,
  "suggested_block_requirement": string
}

If a field cannot be determined, use "Unknown" (or "" for location).
Return ONLY the JSON object, nothing else.
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let extracted;
    try {
      extracted = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("AI extract parse error:", parseErr.message, cleaned);
      return res.status(502).json({
        status: "ERROR",
        message: "AI response could not be parsed",
      });
    }

    res.json({
      status: "OK",
      original_description: description,
      extracted,
    });
  } catch (error) {
    console.error("AI extract error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not analyze description",
      error: error.message,
    });
  }
});

// ================= AI BLOCK WINDOW OPTIONS (Module 3) =================
// For a given block request, ask Claude to propose 2-3 candidate time
// windows, comparing train traffic, maintenance duration, other
// department work, conflicts and work efficiency for each. This is
// DECISION SUPPORT ONLY — it returns suggestions; it never changes the
// request's status or time in the database itself. The human decides
// which (if any) option to apply, and separately approves/rejects.

app.post("/api/ai-block-options", async (req, res) => {
  try {
    const { request, trainSchedule, blockRequests, tasks } = req.body;

    if (!request || !request.location || !request.date) {
      return res.status(400).json({
        status: "ERROR",
        message: "request (with location and date) is required",
      });
    }

    const relevantTrains = (trainSchedule || []).filter(
      (t) => t.route === request.location
    );

    const otherWork = (blockRequests || []).filter(
      (b) => b.location === request.location && b.id !== request.id
    );

    const prompt = `
You are an expert railway maintenance block planner analyzing a block
request to suggest the safest, most efficient time windows.

Block Request:
${JSON.stringify(request, null, 2)}

Train movements on this route ("${request.location}"):
${JSON.stringify(relevantTrains, null, 2)}

Other block requests / work on this same location:
${JSON.stringify(otherWork, null, 2)}

Related maintenance tasks:
${JSON.stringify(tasks || [], null, 2)}

Task: Propose exactly 3 candidate time window options for this block
(each with a start and end time on the same date as the request, same
total duration as the originally requested window unless a shorter/longer
window is clearly better justified). For each option, evaluate:
- train_impact: "Low" | "Medium" | "High" (based on train movements
  overlapping or near this window)
- work_efficiency: "Low" | "Medium" | "High"
- pros: array of short strings (max 3)
- cons: array of short strings (max 3)

Then pick which single option you recommend and explain why in 1-2
sentences (recommendation_reason). This is a recommendation only — a
human controller will make the final decision.

Return STRICT JSON only, no markdown, matching exactly this shape:

{
  "options": [
    {
      "label": "Option A",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "train_impact": "Low",
      "work_efficiency": "High",
      "pros": ["..."],
      "cons": ["..."]
    }
  ],
  "recommended_label": "Option A",
  "recommendation_reason": "..."
}
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("AI block options parse error:", parseErr.message, cleaned);
      return res.status(502).json({
        status: "ERROR",
        message: "AI response could not be parsed",
      });
    }

    res.json({
      status: "OK",
      ...parsed,
    });
  } catch (error) {
    console.error("AI block options error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Could not generate block window options",
      error: error.message,
    });
  }
});

// ================= AI CONFLICT ANALYSIS (Conflicts page) =================
// For one specific block/train conflict pair, ask Claude to assess
// severity and suggest a resolution. Decision support only — never
// changes the block's status or time itself; the human still uses the
// existing Reschedule / Approve / Reject controls.

app.post("/api/ai-analyze-conflict", async (req, res) => {
  try {
    const { block, train } = req.body;

    if (!block || !train) {
      return res.status(400).json({
        status: "ERROR",
        message: "block and train data are required",
      });
    }

    const prompt = `
You are an AI assistant for a Railway Block Planning System, analyzing a
conflict between a maintenance block and a train movement.

BLOCK:
Task: ${block.taskName}
Department: ${block.department}
Location: ${block.location}
Date: ${block.date}
Start: ${block.startTime}
End: ${block.endTime}

TRAIN:
Train: ${train.trainName}
Route: ${train.route}
Date: ${train.date}
Arrival: ${train.arrival}
Departure: ${train.departure}

Return STRICT JSON only, no markdown, matching exactly this shape:

{
  "conflictLevel": "Low" | "Medium" | "High" | "Critical",
  "reason": string,
  "trainImpact": string,
  "workImpact": string,
  "suggestedAction": string,
  "alternativeWindow": string,
  "recommendation": string
}

Do not claim to approve or reject anything — this is advisory only, a
human controller makes the final decision.
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("AI conflict parse error:", parseErr.message, cleaned);
      return res.status(502).json({
        status: "ERROR",
        message: "AI response could not be parsed",
      });
    }

    res.json({
      status: "OK",
      analysis,
    });
  } catch (error) {
    console.error("AI conflict analysis error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "AI conflict analysis failed",
      error: error.message,
    });
  }
});

// ================= COMPLAINTS API (Field Apps) =================
// Powers the 3 standalone field apps (Engineering / S&T / Traction).
// Fully separate table and routes — does not touch any existing
// maintenance/block-request logic above. Auto-creates its own table on
// first use so no manual Neon migration is required for this feature.

let complaintsTableReady = false;
async function ensureComplaintsTable() {
  if (complaintsTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id SERIAL PRIMARY KEY,
      department TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      reported_by TEXT,
      phone TEXT,
      status TEXT DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  complaintsTableReady = true;
}

// POST - anyone (field staff) submits a complaint from one of the 3 apps
app.post("/api/complaints", async (req, res) => {
  try {
    await ensureComplaintsTable();

    const { department, location, description, priority, reported_by, phone } =
      req.body;

    if (!department || !location || !description) {
      return res.status(400).json({
        status: "ERROR",
        message: "department, location and description are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO complaints
      (department, location, description, priority, reported_by, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Open')
      RETURNING *`,
      [department, location, description, priority || "Medium", reported_by || "", phone || ""]
    );

    res.status(201).json({
      status: "OK",
      message: "Complaint submitted successfully",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("Create complaint error:", error.message);
    res.status(500).json({
      status: "ERROR",
      message: "Could not submit complaint",
      error: error.message,
    });
  }
});

// GET - list complaints, optionally filtered by department (?department=Engineering)
app.get("/api/complaints", async (req, res) => {
  try {
    await ensureComplaintsTable();

    const { department } = req.query;

    const result = department
      ? await pool.query(
          "SELECT * FROM complaints WHERE department = $1 ORDER BY id DESC",
          [department]
        )
      : await pool.query("SELECT * FROM complaints ORDER BY id DESC");

    res.json({
      status: "OK",
      complaints: result.rows,
    });
  } catch (error) {
    console.error("Get complaints error:", error.message);
    res.status(500).json({
      status: "ERROR",
      message: "Could not fetch complaints",
      error: error.message,
    });
  }
});

// PUT - mark a complaint resolved (for later admin use, e.g. from main dashboard)
app.put("/api/complaints/:id/status", async (req, res) => {
  try {
    await ensureComplaintsTable();

    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Open", "In Progress", "Resolved"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ status: "ERROR", message: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: "ERROR", message: "Complaint not found" });
    }

    res.json({ status: "OK", complaint: result.rows[0] });
  } catch (error) {
    console.error("Update complaint error:", error.message);
    res.status(500).json({
      status: "ERROR",
      message: "Could not update complaint",
      error: error.message,
    });
  }
});

// Routes are all registered above; server starts last.
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚆 Railway backend running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error.message);
});