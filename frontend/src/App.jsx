import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // ✅ mobile hamburger sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper: switch page AND close mobile sidebar drawer
  const goToPage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const [tasks, setTasks] = useState([
    {
      id: 1,
      task: "Track Renewal",
      description: "",
      department: "Engineering",
      location: "Ranchi - Muri",
      type: "Track Maintenance",
      priority: "High",
      duration: "3 Hours",
      dueDate: "2026-09-05",
      status: "Pending",
    },
    {
      id: 2,
      task: "Signal Inspection",
      description: "",
      department: "S&T",
      location: "Tori Yard",
      type: "Signal Maintenance",
      priority: "Medium",
      duration: "2 Hours",
      dueDate: "2026-09-07",
      status: "In Progress",
    },
    {
      id: 3,
      task: "OHE Maintenance",
      description: "",
      department: "Traction",
      location: "Hatia - Ranchi",
      type: "OHE Maintenance",
      priority: "High",
      duration: "4 Hours",
      dueDate: "2026-09-04",
      status: "Pending",
    },
  ]);

  useEffect(() => {
    loadTasks();
    loadBlockRequests();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/maintenance"
      );

      const data = await response.json();

      const formattedTasks = data.tasks.map((item) => ({
        id: item.id,
        task: item.task_name,
        description: item.description || "",
        department: item.department,
        location: item.location,
        type: item.task_type,
        priority: item.priority,
        duration: item.duration,
        dueDate: item.due_date,
        status: item.status,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Failed to load maintenance tasks:", error);
    }
  };

  const loadBlockRequests = async () => {
    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/block-requests"
      );

      const data = await response.json();

      const formattedRequests = data.map((item) => ({
        id: item.id,
        task: item.task_name,
        department: item.department,
        location: item.location,
        date: item.request_date,
        startTime: item.start_time,
        endTime: item.end_time,
        reason: item.reason,
        status: item.status,
      }));

      setBlockRequests(formattedRequests);
    } catch (error) {
      console.error("Block requests load error:", error);
    }
  };

  const [blockRequests, setBlockRequests] = useState([]);

  // Schedule a Block Request
  const scheduleBlock = (request) => {
    if (request.status !== "Approved") {
      alert("Only Approved Block Requests can be scheduled.");
      return;
    }

    const alreadyScheduled = scheduledBlocks.some(
      (block) => block.id === request.id
    );

    if (alreadyScheduled) {
      alert("This block is already scheduled.");
      return;
    }

    const newScheduledBlock = {
      id: request.id,
      task: request.task,
      department: request.department,
      location: request.location,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      status: "Scheduled",
    };

    setScheduledBlocks((prev) => [...prev, newScheduledBlock]);

    setBlockRequests((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, status: "Scheduled" } : item
      )
    );

    alert("✅ Block Scheduled Successfully!");
  };

  // Scheduled Blocks
  const [scheduledBlocks, setScheduledBlocks] = useState([
    {
      id: 1,
      task: "Track Renewal",
      department: "Engineering",
      location: "Ranchi - Muri",
      date: "2026-09-05",
      startTime: "10:00",
      endTime: "13:00",
      status: "Scheduled",
    },
  ]);

  const [trainSchedule, setTrainSchedule] = useState([
    {
      id: 1,
      trainNo: "18616",
      trainName: "Kriya Yoga Express",
      route: "Ranchi - Muri",
      date: "2026-09-05",
      arrival: "09:30",
      departure: "09:35",
      type: "Passenger",
    },
    {
      id: 2,
      trainNo: "13351",
      trainName: "Dhanbad Express",
      route: "Ranchi - Muri",
      date: "2026-09-05",
      arrival: "13:30",
      departure: "13:35",
      type: "Passenger",
    },
    {
      id: 3,
      trainNo: "12825",
      trainName: "Intercity Express",
      route: "Hatia - Ranchi",
      date: "2026-09-05",
      arrival: "15:00",
      departure: "15:05",
      type: "Passenger",
    },
  ]);

  // 🚆 Add Train Form
  const [showTrainForm, setShowTrainForm] = useState(false);

  const [trainFormData, setTrainFormData] = useState({
    trainNo: "",
    trainName: "",
    route: "",
    date: "",
    arrival: "",
    departure: "",
    type: "Passenger",
  });

  // 🚆 Add New Train
  const addTrain = (e) => {
    e.preventDefault();

    if (
      !trainFormData.trainNo ||
      !trainFormData.trainName ||
      !trainFormData.route ||
      !trainFormData.date ||
      !trainFormData.arrival ||
      !trainFormData.departure
    ) {
      alert("Please fill all required fields");
      return;
    }

    const newTrain = {
      id: Date.now(),
      ...trainFormData,
    };

    setTrainSchedule((prev) => [...prev, newTrain]);

    setTrainFormData({
      trainNo: "",
      trainName: "",
      route: "",
      date: "",
      arrival: "",
      departure: "",
      type: "Passenger",
    });

    setShowTrainForm(false);

    alert("✅ Train added successfully!");
  };

  const [showBlockForm, setShowBlockForm] = useState(false);

  const [blockFormData, setBlockFormData] = useState({
    task: "",
    department: "Engineering",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  // 🔄 Find an alternative time for a block
  const findAlternativeSlot = (request) => {
    const duration =
      Number(request.endTime.split(":")[0]) * 60 +
      Number(request.endTime.split(":")[1]) -
      (Number(request.startTime.split(":")[0]) * 60 +
        Number(request.startTime.split(":")[1]));

    const blockDate = String(request.date).slice(0, 10);

    for (let start = 6 * 60; start <= 20 * 60; start += 30) {
      const end = start + duration;

      const hasConflict = trainSchedule.some((train) => {
        const trainDate = String(train.date).slice(0, 10);

        if (train.route !== request.location || trainDate !== blockDate) {
          return false;
        }

        const trainStart =
          Number(train.arrival.split(":")[0]) * 60 +
          Number(train.arrival.split(":")[1]);

        const trainEnd =
          Number(train.departure.split(":")[0]) * 60 +
          Number(train.departure.split(":")[1]);

        return start < trainEnd && end > trainStart;
      });

      if (!hasConflict) {
        const formatTime = (minutes) => {
          const h = String(Math.floor(minutes / 60)).padStart(2, "0");
          const m = String(minutes % 60).padStart(2, "0");
          return `${h}:${m}`;
        };

        return {
          startTime: formatTime(start),
          endTime: formatTime(end),
        };
      }
    }

    return null;
  };

  // 🔄 Reschedule a conflicting block
  const rescheduleBlock = async (request) => {
    const alternative = findAlternativeSlot(request);

    if (!alternative) {
      alert("❌ No safe alternative time found.");
      return;
    }

    try {
      const response = await fetch(
        `https://railway-block-planner-m9f2.onrender.com/api/block-requests/${request.id}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime: alternative.startTime,
            endTime: alternative.endTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reschedule failed");
      }

      setBlockRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? {
                ...item,
                startTime: alternative.startTime,
                endTime: alternative.endTime,
                status: "Rescheduled",
              }
            : item
        )
      );

      alert(
        `✅ Block Rescheduled Successfully!\n\nNew Time: ${alternative.startTime} - ${alternative.endTime}`
      );
    } catch (error) {
      console.error("Reschedule error:", error);
      alert(`❌ Reschedule failed: ${error.message}`);
    }
  };

  const updateBlockRequestStatus = async (id, status) => {
    try {
      const response = await fetch(
        `https://railway-block-planner-m9f2.onrender.com/api/block-requests/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Status update failed");
        return;
      }

      setBlockRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: status } : item))
      );

      alert(`Block request ${status} successfully`);
    } catch (error) {
      console.error("Status update error:", error);
      alert("Cannot connect to backend");
    }
  };

  // Add new block request
  const addBlockRequest = async (e) => {
  e.preventDefault();

  const {
    task,
    department,
    location,
    date,
    startTime,
    endTime,
    reason,
  } = blockFormData;

  // Required fields check
  if (
    !task?.trim() ||
    !department?.trim() ||
    !location?.trim() ||
    !date ||
    !startTime ||
    !endTime
  ) {
    alert("Please provide all required fields");
    console.log("BLOCK FORM DATA:", blockFormData);
    return;
  }

  try {
    const response = await fetch(
      "https://railway-block-planner-m9f2.onrender.com/api/block-requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_name: task,
          department: department,
          location: location,
          request_date: date,
          start_time: startTime,
          end_time: endTime,
          reason: reason || "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to create block request.");
      return;
    }

    alert("✅ Block Request created successfully!");

    await loadBlockRequests();

    setShowBlockForm(false);

    setBlockFormData({
      task: "",
      department: "Engineering",
      location: "",
      date: "",
      startTime: "",
      endTime: "",
      reason: "",
    });

  } catch (error) {
    console.error("Block request error:", error);
    alert("❌ Could not connect to backend.");
  }
};

  // ================= AI BLOCK WINDOW OPTIONS (Module 3) =================
  // Decision support only: shows candidate time windows with pros/cons.
  // Human picks "Use this slot" (which just moves the block's time, same
  // as manual reschedule) and separately still Approves/Rejects it.
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsData, setOptionsData] = useState(null);
  const [activeOptionsRequest, setActiveOptionsRequest] = useState(null);

  const getBlockWindowOptions = async (request) => {
    setActiveOptionsRequest(request);
    setShowOptionsModal(true);
    setLoadingOptions(true);
    setOptionsData(null);

    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/ai-block-options",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request,
            trainSchedule,
            blockRequests,
            tasks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not analyze options");
      }

      setOptionsData(data);
    } catch (error) {
      console.error("AI block options error:", error);
      setOptionsData({ error: error.message });
    } finally {
      setLoadingOptions(false);
    }
  };

  // Human clicks this to actually move the block to a suggested slot.
  // Reuses the existing reschedule endpoint — no auto-approval happens.
  const applyBlockOption = async (option) => {
    if (!activeOptionsRequest) return;

    try {
      const response = await fetch(
        `https://railway-block-planner-m9f2.onrender.com/api/block-requests/${activeOptionsRequest.id}/reschedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: option.startTime,
            endTime: option.endTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not apply time slot");
      }

      setBlockRequests((prev) =>
        prev.map((item) =>
          item.id === activeOptionsRequest.id
            ? {
                ...item,
                startTime: option.startTime,
                endTime: option.endTime,
                status: "Rescheduled",
              }
            : item
        )
      );

      setShowOptionsModal(false);
      alert(
        `✅ Time slot applied: ${option.startTime} - ${option.endTime}\nPlease review and Approve/Reject as needed.`
      );
    } catch (error) {
      console.error("Apply option error:", error);
      alert(`❌ Could not apply time slot: ${error.message}`);
    }
  };

  // ================= AI BLOCK SUGGESTION (built on Module 1 extraction) =================
  // Turns the AI extraction result (from analyzeDescription) into a
  // reusable suggestion that can be applied to a new Block Request.
  // Still decision support only — nothing is created/approved automatically.
  const [aiBlockSuggestion, setAiBlockSuggestion] = useState(null);

  const createAISuggestedBlock = () => {
    if (!aiExtractedInfo) {
      alert("Pehle description ko 'Analyze with AI' se analyze karo.");
      return;
    }

    setAiBlockSuggestion({
      taskName: formData.task || aiExtractedInfo.asset || "Maintenance Work",
      department: aiExtractedInfo.department,
      location: aiExtractedInfo.location || formData.location,
      reason: aiExtractedInfo.issue,
      safetyImpact: aiExtractedInfo.safety_impact,
      suggestedWindow: aiExtractedInfo.suggested_block_requirement,
    });
  };

  const applyAIBlockSuggestionToForm = () => {
    if (!aiBlockSuggestion) return;

    setBlockFormData({
      task: aiBlockSuggestion.taskName || "",
      department: ["Engineering", "S&T", "Traction"].includes(
        aiBlockSuggestion.department
      )
        ? aiBlockSuggestion.department
        : "Engineering",
      location: aiBlockSuggestion.location || "",
      date: formData.dueDate || "",
      startTime: "",
      endTime: "",
      reason: aiBlockSuggestion.reason || "AI suggested maintenance block",
    });

    setActivePage("Block Requests");
    setShowBlockForm(true);
  };

  // ================= AI CONFLICT ANALYSIS (Conflicts page) =================
  // For a specific block/train conflict pair, ask Claude to assess
  // severity and suggest an alternative window. Keyed by request id so
  // each row on the Conflicts page can show its own result. Decision
  // support only — human still uses the existing Reschedule button.
  const [aiConflictResults, setAiConflictResults] = useState({});
  const [loadingConflictId, setLoadingConflictId] = useState(null);

  const analyzeConflictWithAI = async (request, train) => {
    if (!request || !train) {
      alert("Conflict data available nahi hai.");
      return;
    }

    setLoadingConflictId(request.id);

    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/ai-analyze-conflict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            block: {
              taskName: request.task,
              department: request.department,
              location: request.location,
              date: String(request.date).slice(0, 10),
              startTime: request.startTime,
              endTime: request.endTime,
            },
            train: {
              trainName: train.trainName,
              route: train.route,
              date: String(train.date).slice(0, 10),
              arrival: train.arrival,
              departure: train.departure,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI conflict analysis failed");
      }

      setAiConflictResults((prev) => ({
        ...prev,
        [request.id]: data.analysis,
      }));
    } catch (error) {
      console.error("AI Conflict Error:", error);
      alert("AI conflict analysis failed: " + error.message);
    } finally {
      setLoadingConflictId(null);
    }
  };

  const [showForm, setShowForm] = useState(false);

  // ✅ single, merged formData (previously declared twice — fixed)
  const [formData, setFormData] = useState({
    task: "",
    description: "",
    department: "Engineering",
    location: "",
    type: "Track Maintenance",
    priority: "Medium",
    duration: "2 Hours",
    dueDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🎤 Voice input (Module 2 foundation) — Web Speech API, Chrome/Edge only
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("hi-IN"); // hi-IN | en-IN

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setIsListening(false);
      console.error("Speech recognition error:", e.error);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({
        ...prev,
        description: prev.description
          ? `${prev.description} ${transcript}`
          : transcript,
      }));
    };

    recognition.start();
  };

  // 🤖 AI extraction (Module 1 foundation) — decision SUPPORT only.
  // This only fills suggested fields into the form; the human still
  // reviews and clicks "Save Maintenance Task" themselves.
  const [analyzingDescription, setAnalyzingDescription] = useState(false);
  const [aiExtractedInfo, setAiExtractedInfo] = useState(null);

  const analyzeDescription = async () => {
    if (!formData.description.trim()) {
      alert("Please enter or record a description first.");
      return;
    }

    setAnalyzingDescription(true);
    setAiExtractedInfo(null);

    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/ai-extract-task",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: formData.description }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Analysis failed");

      const extracted = data.extracted;
      setAiExtractedInfo(extracted);

      setFormData((prev) => ({
        ...prev,
        department: ["Engineering", "S&T", "Traction"].includes(
          extracted.department
        )
          ? extracted.department
          : prev.department,
        location: extracted.location || prev.location,
        type: extracted.work_type || prev.type,
        priority: ["High", "Medium", "Low"].includes(extracted.severity)
          ? extracted.severity
          : prev.priority,
        duration: extracted.estimated_duration || prev.duration,
      }));
    } catch (error) {
      console.error("AI extract error:", error);
      alert(`❌ Could not analyze description: ${error.message}`);
    } finally {
      setAnalyzingDescription(false);
    }
  };

  const deleteTask = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this maintenance task?")
    ) {
      return;
    }

    try {
      const response = await fetch(
        `https://railway-block-planner-m9f2.onrender.com/api/maintenance/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
      alert("✅ Maintenance task deleted successfully!");
    } catch (error) {
      console.error("Delete task error:", error);
      alert(`❌ Could not delete task: ${error.message}`);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();

    if (!formData.task || !formData.location || !formData.dueDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/maintenance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task_name: formData.task,
            description: formData.description,
            department: formData.department,
            location: formData.location,
            task_type: formData.type,
            priority: formData.priority,
            duration: formData.duration,
            due_date: formData.dueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save task");
        return;
      }

      alert("✅ Maintenance task saved successfully!");

      setFormData({
        task: "",
        description: "",
        department: "Engineering",
        location: "",
        type: "Track Maintenance",
        priority: "Medium",
        duration: "2 Hours",
        dueDate: "",
      });
      setAiExtractedInfo(null);

      setShowForm(false);

      loadTasks();
    } catch (error) {
      console.error("Save task error:", error);
      alert("❌ Backend server se connection nahi ho raha.");
    }
  };

  // Local rule-based plan (kept as a quick fallback / instant preview)
  const generateBlockPlan = () => {
    const pendingHighPriority = tasks.filter(
      (task) => task.status === "Pending" && task.priority === "High"
    );

    if (pendingHighPriority.length === 0) {
      alert("No high-priority pending maintenance task found.");
      return;
    }

    let planMessage = "🤖 AI BLOCK PLAN GENERATED\n\n";

    pendingHighPriority.forEach((task, index) => {
      const relatedTrains = trainSchedule.filter(
        (train) => train.route === task.location && train.date === task.dueDate
      );

      planMessage +=
        `${index + 1}. ${task.task}\n` +
        `Department: ${task.department}\n` +
        `Location: ${task.location}\n` +
        `Priority: ${task.priority}\n` +
        `Duration: ${task.duration}\n`;

      if (relatedTrains.length > 0) {
        planMessage += `⚠️ Train movement found on this route.\n`;
      } else {
        planMessage += `✅ No train movement found.\n`;
      }

      planMessage += `Recommendation: Plan maintenance block after train movement analysis.\n\n`;
    });

    alert(planMessage);
  };

  // ✅ real AI-powered plan (calls backend -> Anthropic Claude API)
  const [aiPlanText, setAiPlanText] = useState("");
  const [loadingAiPlan, setLoadingAiPlan] = useState(false);
  const [showAiPlanModal, setShowAiPlanModal] = useState(false);

  const generateAIBlockPlan = async () => {
    setShowAiPlanModal(true);
    setLoadingAiPlan(true);
    setAiPlanText("");

    try {
      const response = await fetch(
        "https://railway-block-planner-m9f2.onrender.com/api/ai-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tasks,
            trainSchedule,
            blockRequests,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI plan generation failed");
      }

      setAiPlanText(data.plan);
    } catch (error) {
      console.error("AI plan error:", error);
      setAiPlanText(`❌ Could not generate AI plan: ${error.message}`);
    } finally {
      setLoadingAiPlan(false);
    }
  };

  // Statistics
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;

  const highPriority = tasks.filter((task) => task.priority === "High").length;

  const engineeringTasks = tasks.filter(
    (task) => task.department === "Engineering"
  ).length;

  const stTasks = tasks.filter((task) => task.department === "S&T").length;

  const tractionTasks = tasks.filter(
    (task) => task.department === "Traction"
  ).length;

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* close button, only visible on mobile drawer */}
        <button
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="logo">
          <div className="logo-icon">🚆</div>

          <div>
            <h2>Railway</h2>
            <span>Block Planner</span>
          </div>
        </div>

        <div className="menu-title">MAIN MENU</div>

        <nav>
          <button
            className={`menu-item ${activePage === "Dashboard" ? "active" : ""}`}
            onClick={() => goToPage("Dashboard")}
          >
            <span>📊</span>
            Dashboard
          </button>

          <button
            className={`menu-item ${
              activePage === "Maintenance" ? "active" : ""
            }`}
            onClick={() => goToPage("Maintenance")}
          >
            <span>🔧</span>
            Maintenance
          </button>

          <button
            className={`menu-item ${
              activePage === "Block Requests" ? "active" : ""
            }`}
            onClick={() => goToPage("Block Requests")}
          >
            <span>🚧</span>
            Block Requests
          </button>

          <button
            className={`menu-item ${
              activePage === "Block Schedule" ? "active" : ""
            }`}
            onClick={() => goToPage("Block Schedule")}
          >
            <span>📅</span>
            Block Schedule
          </button>

          <button
            className={`menu-item ${
              activePage === "Train Schedule" ? "active" : ""
            }`}
            onClick={() => goToPage("Train Schedule")}
          >
            <span>🚆</span>
            Train Schedule
          </button>

          <button
            className={`menu-item ${
              activePage === "Conflicts" ? "active" : ""
            }`}
            onClick={() => goToPage("Conflicts")}
          >
            <span>⚠️</span>
            Conflicts
          </button>
        </nav>

        <div className="menu-title">SYSTEM</div>

        <nav>
          <button
            className={`menu-item ${activePage === "Reports" ? "active" : ""}`}
            onClick={() => goToPage("Reports")}
          >
            <span>📈</span>
            Reports
          </button>

          <button
            className={`menu-item ${
              activePage === "Settings" ? "active" : ""
            }`}
            onClick={() => goToPage("Settings")}
          >
            <span>⚙️</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot"></div>

          <div>
            <strong>System Online</strong>
            <small>All services running</small>
          </div>
        </div>
      </aside>

      {/* dark backdrop behind mobile drawer, click to close */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ================= MAIN ================= */}

      <main className="main">
        {/* TOP BAR */}

        <header className="topbar">
          <div className="topbar-left">
            {/* hamburger button, only shown on mobile via CSS */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>

            <div>
              <h1>Railway Maintenance Dashboard</h1>

              <p>Automatic Block Planning & Coordination System</p>
            </div>
          </div>

          <div className="user-area">
            <button className="notification">🔔</button>

            <div className="user">
              <div className="avatar">AD</div>

              <div>
                <strong>Administrator</strong>
                <small>Control Office</small>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================= */}
        {/* DASHBOARD PAGE */}
        {/* ================================================= */}

        {activePage === "Dashboard" && (
          <>
            <section className="welcome">
              <div>
                <h2>Good Morning, Planner 👋</h2>

                <p>Here is today's maintenance and block planning overview.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => {
                  goToPage("Maintenance");
                  setShowForm(true);
                }}
              >
                + Create Maintenance Task
              </button>
            </section>

            {/* STATISTICS */}

            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon blue">🔧</div>

                <div>
                  <span>Pending Tasks</span>
                  <h2>{pendingTasks}</h2>
                  <small>Needs planning</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">🚧</div>

                <div>
                  <span>Block Requests</span>
                  <h2>{blockRequests.length}</h2>
                  <small>
                    {
                      blockRequests.filter(
                        (request) => request.status === "Pending"
                      ).length
                    }{" "}
                    awaiting approval
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">📅</div>

                <div>
                  <span>Scheduled Blocks</span>
                  <h2>
                    {
                      blockRequests.filter(
                        (request) =>
                          request.status === "Approved" ||
                          request.status === "Rescheduled"
                      ).length
                    }
                  </h2>
                  <small>For today</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red">⚠️</div>

                <div>
                  <span>High Priority</span>
                  <h2>{highPriority}</h2>
                  <small>Requires attention</small>
                </div>
              </div>
            </section>

            {/* DASHBOARD CONTENT */}

            <section className="content-grid">
              <div className="panel large-panel">
                <div className="panel-header">
                  <div>
                    <h3>Priority Maintenance Tasks</h3>

                    <p>Tasks requiring block planning</p>
                  </div>

                  <button
                    className="view-btn"
                    onClick={() => goToPage("Maintenance")}
                  >
                    View All
                  </button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Department</th>
                        <th>Location</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tasks.slice(0, 5).map((task) => (
                        <tr key={task.id}>
                          <td>
                            <strong>{task.task}</strong>
                            <small>#{task.id}</small>
                          </td>

                          <td>{task.department}</td>

                          <td>{task.location}</td>

                          <td>
                            <span
                              className={`badge ${
                                task.priority === "High"
                                  ? "high"
                                  : task.priority === "Medium"
                                  ? "medium"
                                  : "low"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>

                          <td>
                            <span className="status pending">
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TODAY'S BLOCKS */}

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Today's Blocks</h3>
                    <p>Current schedule</p>
                  </div>
                </div>

                <div className="block-list">
                  <div className="block-item">
                    <div className="time">10:00</div>

                    <div>
                      <strong>Ranchi Section</strong>

                      <small>Engineering + S&T</small>
                    </div>

                    <span className="active-label">Active</span>
                  </div>

                  <div className="block-item">
                    <div className="time">13:30</div>

                    <div>
                      <strong>Hatia Yard</strong>

                      <small>Traction</small>
                    </div>

                    <span className="upcoming-label">Upcoming</span>
                  </div>

                  <div className="block-item">
                    <div className="time">16:00</div>

                    <div>
                      <strong>Tori Section</strong>

                      <small>Engineering</small>
                    </div>

                    <span className="upcoming-label">Upcoming</span>
                  </div>
                </div>
              </div>
            </section>

            {/* DEPARTMENT */}

            <section className="bottom-grid">
              <div className="panel department-panel">
                <div className="panel-header">
                  <div>
                    <h3>Department Overview</h3>

                    <p>Maintenance workload</p>
                  </div>
                </div>

                <div className="department">
                  <div className="dept-name">
                    <span>Engineering</span>
                    <strong>{engineeringTasks} Tasks</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress engineering"
                      style={{
                        width: `${Math.min(engineeringTasks * 10, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="department">
                  <div className="dept-name">
                    <span>S&T</span>
                    <strong>{stTasks} Tasks</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress st"
                      style={{ width: `${Math.min(stTasks * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="department">
                  <div className="dept-name">
                    <span>Traction</span>
                    <strong>{tractionTasks} Tasks</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress traction"
                      style={{
                        width: `${Math.min(tractionTasks * 10, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* AI CARD */}

              <div className="panel ai-panel">
                <div className="ai-icon">🤖</div>

                <div className="ai-content">
                  <h3>AI Planning Engine</h3>

                  <p>
                    Automatically analyze maintenance priority, train schedule
                    and block conflicts to recommend the best maintenance
                    block.
                  </p>

                  {/* calls the real AI backend instead of local rules */}
                  <button
                    type="button"
                    className="ai-plan-btn"
                    onClick={generateAIBlockPlan}
                  >
                    🤖 Generate Block Plan
                  </button>
                  <span className="ai-status">● Planning Engine Ready</span>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================================================= */}
        {/* MAINTENANCE PAGE */}
        {/* ================================================= */}

        {activePage === "Maintenance" && (
          <section className="maintenance-page">
            <div className="page-heading">
              <div>
                <h2>Maintenance Tasks</h2>

                <p>Manage railway infrastructure maintenance tasks</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setShowForm(!showForm)}
              >
                + Add Maintenance Task
              </button>
            </div>

            {/* ADD TASK FORM */}

            {showForm && (
              <div className="panel form-panel">
                <div className="panel-header">
                  <div>
                    <h3>Create Maintenance Task</h3>

                    <p>Enter maintenance task details</p>
                  </div>
                </div>

                <form onSubmit={addTask}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Task Name *</label>

                      <input
                        type="text"
                        placeholder="Example: Track Renewal"
                        value={formData.task}
                        onChange={(e) =>
                          setFormData({ ...formData, task: e.target.value })
                        }
                      />
                    </div>

                    {/* ✅ Description — Module 1 + Module 2 (voice) + AI extraction */}
                    <div className="form-group description-group">
                      <label>Description</label>

                      <div className="description-input-row">
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Type or speak the issue — Hindi, English, or mixed. Example: Ranchi-Muri section me rail me crack suspect hai."
                          rows="4"
                        />

                        <div className="description-tools">
                          <select
                            className="voice-lang-select"
                            value={voiceLang}
                            onChange={(e) => setVoiceLang(e.target.value)}
                          >
                            <option value="hi-IN">Hindi</option>
                            <option value="en-IN">English</option>
                          </select>

                          <button
                            type="button"
                            className={`mic-btn ${
                              isListening ? "listening" : ""
                            }`}
                            onClick={startVoiceInput}
                          >
                            {isListening ? "🔴 Listening..." : "🎤 Speak"}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="ai-analyze-btn"
                        onClick={analyzeDescription}
                        disabled={analyzingDescription}
                      >
                        {analyzingDescription
                          ? "🤖 Analyzing..."
                          : "✨ Analyze with AI"}
                      </button>

                      {aiExtractedInfo && (
                        <div className="ai-extract-result">
                          <strong>AI suggestion (review before saving):</strong>
                          <ul>
                            <li>
                              Detected language:{" "}
                              {aiExtractedInfo.detected_language}
                            </li>
                            <li>Issue: {aiExtractedInfo.issue}</li>
                            <li>Urgency: {aiExtractedInfo.urgency}</li>
                            <li>
                              Safety impact: {aiExtractedInfo.safety_impact}
                            </li>
                            <li>
                              Suggested block:{" "}
                              {aiExtractedInfo.suggested_block_requirement}
                            </li>
                          </ul>
                          <small>
                            Department, location, type, priority, duration
                            pre-filled hain — save karne se pehle verify kar
                            lein. Final decision aapka hai.
                          </small>

                          <button
                            type="button"
                            className="ai-btn"
                            onClick={createAISuggestedBlock}
                          >
                            🚦 Create Block Suggestion
                          </button>
                        </div>
                      )}

                      {aiBlockSuggestion && (
                        <div className="ai-analysis-box">
                          <h4>🚦 AI Block Suggestion</h4>
                          <p>
                            <strong>Task:</strong> {aiBlockSuggestion.taskName}
                          </p>
                          <p>
                            <strong>Location:</strong>{" "}
                            {aiBlockSuggestion.location}
                          </p>
                          <p>
                            <strong>Department:</strong>{" "}
                            {aiBlockSuggestion.department}
                          </p>
                          <p>
                            <strong>Reason:</strong> {aiBlockSuggestion.reason}
                          </p>
                          <p>
                            <strong>Suggested window:</strong>{" "}
                            {aiBlockSuggestion.suggestedWindow}
                          </p>
                          <small>
                            AI suggestion requires human approval — click below
                            to open a pre-filled Block Request form.
                          </small>
                          <button
                            type="button"
                            className="ai-btn"
                            onClick={applyAIBlockSuggestionToForm}
                          >
                            🚦 Apply to Block Request
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Department *</label>

                      <select
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      >
                        <option>Engineering</option>
                        <option>S&T</option>
                        <option>Traction</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Location *</label>

                      <input
                        type="text"
                        placeholder="Example: Ranchi - Muri"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Task Type</label>

                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      >
                        <option>Track Maintenance</option>

                        <option>Signal Maintenance</option>

                        <option>OHE Maintenance</option>

                        <option>Inspection</option>

                        <option>Emergency Repair</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>

                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value,
                          })
                        }
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Estimated Duration</label>

                      <select
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: e.target.value,
                          })
                        }
                      >
                        <option>1 Hour</option>
                        <option>2 Hours</option>
                        <option>3 Hours</option>
                        <option>4 Hours</option>
                        <option>6 Hours</option>
                        <option>8 Hours</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Due Date *</label>

                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="primary-btn">
                      Save Maintenance Task
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TASK TABLE */}

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>All Maintenance Tasks</h3>

                  <p>Total Tasks: {tasks.length}</p>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Department</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Duration</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.task}</strong>
                          {task.description && (
                            <small className="task-description-preview">
                              {task.description}
                            </small>
                          )}
                          <small>ID: {task.id}</small>
                        </td>

                        <td>{task.department}</td>

                        <td>{task.location}</td>

                        <td>{task.type}</td>

                        <td>
                          <span
                            className={`badge ${
                              task.priority === "High"
                                ? "high"
                                : task.priority === "Medium"
                                ? "medium"
                                : "low"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td>{task.duration}</td>

                        <td>{task.dueDate}</td>

                        <td>
                          <span className="status pending">
                            {task.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => deleteTask(task.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* BLOCK REQUESTS PAGE */}

        {activePage === "Block Requests" && (
          <section className="maintenance-page">
            <div className="page-heading">
              <div>
                <h2>Block Requests</h2>
                <p>Manage maintenance block requests</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setShowBlockForm(true)}
              >
                + Create Block Request
              </button>
            </div>

            {showBlockForm && (
              <div className="form-panel">
                <h3>Create Block Request</h3>

                <form onSubmit={addBlockRequest}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Maintenance Task *</label>
                      <select
                        value={blockFormData.task}
                        onChange={(e) => {
                          const selectedTask = tasks.find(
                            (task) => task.task === e.target.value
                          );

                          setBlockFormData({
                            ...blockFormData,
                            task: e.target.value,
                            department:
                              selectedTask?.department || "Engineering",
                            location: selectedTask?.location || "",
                          });
                        }}
                      >
                        <option value="">Select Task</option>

                        {tasks.map((task) => (
                          <option key={task.id} value={task.task}>
                            {task.task}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <select
                        value={blockFormData.department}
                        onChange={(e) =>
                          setBlockFormData({
                            ...blockFormData,
                            department: e.target.value,
                          })
                        }
                      >
                        <option>Engineering</option>
                        <option>S&T</option>
                        <option>Traction</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ranchi - Muri"
                        value={blockFormData.location}
                        onChange={(e) =>
                          setBlockFormData({
                            ...blockFormData,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Block Date *</label>
                      <input
                        type="date"
                        value={blockFormData.date}
                        onChange={(e) =>
                          setBlockFormData({
                            ...blockFormData,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        value={blockFormData.startTime}
                        onChange={(e) =>
                          setBlockFormData({
                            ...blockFormData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        value={blockFormData.endTime}
                        onChange={(e) =>
                          setBlockFormData({
                            ...blockFormData,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Reason</label>
                      <input
                        type="text"
                        placeholder="Reason for block"
                        value={blockFormData.reason}
                        onChange={(e) =>
                          setBlockFormData({
                            ...blockFormData,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowBlockForm(false)}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="primary-btn">
                      Submit Block Request
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-card">
              <div className="table-header">
                <h3>Block Request List</h3>
                <span>{blockRequests.length} Requests</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {blockRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.task}</td>

                      <td>{request.department}</td>

                      <td>{request.location}</td>

                      <td>{request.date}</td>

                      <td>
                        {request.startTime} - {request.endTime}
                      </td>

                      <td>
                        <span
                          className={`status ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>

                        {request.status === "Pending" && (
                          <div className="request-actions">
                            <button
                              className="approve-btn"
                              onClick={() =>
                                updateBlockRequestStatus(
                                  request.id,
                                  "Approved"
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() =>
                                updateBlockRequestStatus(
                                  request.id,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>

                            <button
                              className="ai-options-btn"
                              onClick={() => getBlockWindowOptions(request)}
                            >
                              🤖 AI Options
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* BLOCK SCHEDULE PAGE */}

        {activePage === "Block Schedule" && (
          <section className="maintenance-page">
            <div className="page-heading">
              <div>
                <h2>Block Schedule</h2>
                <p>Approved maintenance blocks and planned work</p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h3>Scheduled Blocks</h3>
                <span>
                  {
                    blockRequests.filter(
                      (request) =>
                        request.status === "Approved" ||
                        request.status === "Rescheduled"
                    ).length
                  }{" "}
                  Scheduled
                </span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {blockRequests
                    .filter(
                      (request) =>
                        request.status === "Approved" ||
                        request.status === "Rescheduled"
                    )
                    .map((request) => (
                      <tr key={request.id}>
                        <td>{request.task}</td>

                        <td>{request.department}</td>

                        <td>{request.location}</td>

                        <td>{request.date}</td>

                        <td>
                          {request.startTime} - {request.endTime}
                        </td>

                        <td>
                          <span
                            className={
                              request.status === "Rescheduled"
                                ? "status scheduled"
                                : "status approved"
                            }
                          >
                            {request.status === "Rescheduled"
                              ? "Rescheduled"
                              : "Scheduled"}
                          </span>
                        </td>
                      </tr>
                    ))}

                  {blockRequests.filter(
                    (request) =>
                      request.status === "Approved" ||
                      request.status === "Rescheduled"
                  ).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No approved blocks scheduled yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TRAIN SCHEDULE PAGE */}

        {activePage === "Train Schedule" && (
          <section className="maintenance-page">
            <div className="page-heading">
              <div>
                <h2>Train Schedule</h2>
                <p>Train movement information for block planning</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setShowTrainForm(true)}
              >
                + Add Train
              </button>
            </div>

            <div className="table-card">
              <div className="table-header">
                {showTrainForm && (
                  <div className="form-panel">
                    <form onSubmit={addTrain}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Train Number</label>
                          <input
                            type="text"
                            value={trainFormData.trainNo}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                trainNo: e.target.value,
                              })
                            }
                            placeholder="e.g. 18616"
                          />
                        </div>

                        <div className="form-group">
                          <label>Train Name</label>
                          <input
                            type="text"
                            value={trainFormData.trainName}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                trainName: e.target.value,
                              })
                            }
                            placeholder="e.g. Kriya Yoga Express"
                          />
                        </div>

                        <div className="form-group">
                          <label>Route</label>
                          <input
                            type="text"
                            value={trainFormData.route}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                route: e.target.value,
                              })
                            }
                            placeholder="e.g. Ranchi - Muri"
                          />
                        </div>

                        <div className="form-group">
                          <label>Date</label>
                          <input
                            type="date"
                            value={trainFormData.date}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Arrival Time</label>
                          <input
                            type="time"
                            value={trainFormData.arrival}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                arrival: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Departure Time</label>
                          <input
                            type="time"
                            value={trainFormData.departure}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                departure: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Train Type</label>
                          <select
                            value={trainFormData.type}
                            onChange={(e) =>
                              setTrainFormData({
                                ...trainFormData,
                                type: e.target.value,
                              })
                            }
                          >
                            <option value="Passenger">Passenger</option>
                            <option value="Express">Express</option>
                            <option value="Superfast">Superfast</option>
                            <option value="Goods">Goods</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setShowTrainForm(false)}
                        >
                          Cancel
                        </button>

                        <button type="submit" className="primary-btn">
                          Save Train
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                <h3>Today's Train Schedule</h3>
                <span>{trainSchedule.length} Trains</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Train No.</th>
                    <th>Train Name</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {trainSchedule.map((train) => (
                    <tr key={train.id}>
                      <td>{train.trainNo}</td>
                      <td>{train.trainName}</td>
                      <td>{train.route}</td>
                      <td>{train.date}</td>
                      <td>{train.arrival}</td>
                      <td>{train.departure}</td>
                      <td>{train.type}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            setTrainSchedule((prev) =>
                              prev.filter((item) => item.id !== train.id)
                            );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* CONFLICTS PAGE */}

        {activePage === "Conflicts" && (
          <section className="maintenance-page">
            <div className="page-heading">
              <div>
                <h2>⚠️ Block Conflicts</h2>
                <p>
                  Automatic conflict detection between blocks and train
                  movements
                </p>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h3>Conflict Analysis</h3>
                <span>{blockRequests.length} Block Requests</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Block Task</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Block Time</th>
                    <th>Train</th>
                    <th>Train Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {blockRequests.map((request) => {
                    const conflictTrain = trainSchedule.find((train) => {
                      const trainDate = String(train.date).slice(0, 10);
                      const blockDate = String(request.date).slice(0, 10);

                      if (
                        train.route !== request.location ||
                        trainDate !== blockDate
                      ) {
                        return false;
                      }

                      const trainArrival =
                        Number(train.arrival.split(":")[0]) * 60 +
                        Number(train.arrival.split(":")[1]);

                      const trainDeparture =
                        Number(train.departure.split(":")[0]) * 60 +
                        Number(train.departure.split(":")[1]);

                      const blockStart =
                        Number(request.startTime.split(":")[0]) * 60 +
                        Number(request.startTime.split(":")[1]);

                      const blockEnd =
                        Number(request.endTime.split(":")[0]) * 60 +
                        Number(request.endTime.split(":")[1]);

                      return blockStart < trainDeparture && blockEnd > trainArrival;
                    });

                    return (
                      <tr key={request.id}>
                        <td>{request.task}</td>

                        <td>{request.location}</td>

                        <td>{String(request.date).slice(0, 10)}</td>

                        <td>
                          {request.startTime} - {request.endTime}
                        </td>

                        <td>
                          {conflictTrain
                            ? `${conflictTrain.trainNo} - ${conflictTrain.trainName}`
                            : "No Conflict"}
                        </td>

                        <td>
                          {conflictTrain
                            ? `${conflictTrain.arrival} - ${conflictTrain.departure}`
                            : "-"}
                        </td>

                        <td>
                          {conflictTrain ? (
                            <div>
                              <span className="conflict-badge">
                                ⚠️ Conflict
                              </span>

                              <br />

                              <button
                                className="reschedule-btn"
                                onClick={() => rescheduleBlock(request)}
                              >
                                🔄 Reschedule
                              </button>

                              <button
                                className="ai-conflict-btn"
                                onClick={() =>
                                  analyzeConflictWithAI(request, conflictTrain)
                                }
                                disabled={loadingConflictId === request.id}
                              >
                                {loadingConflictId === request.id
                                  ? "🤖 Analyzing..."
                                  : "🤖 AI Analyze"}
                              </button>

                              {aiConflictResults[request.id] && (
                                <div className="ai-conflict-result">
                                  <p>
                                    <strong>Level:</strong>{" "}
                                    {aiConflictResults[request.id].conflictLevel}
                                  </p>
                                  <p>
                                    <strong>Reason:</strong>{" "}
                                    {aiConflictResults[request.id].reason}
                                  </p>
                                  <p>
                                    <strong>Suggested action:</strong>{" "}
                                    {
                                      aiConflictResults[request.id]
                                        .suggestedAction
                                    }
                                  </p>
                                  <p>
                                    <strong>Alternative window:</strong>{" "}
                                    {
                                      aiConflictResults[request.id]
                                        .alternativeWindow
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="safe-badge">✅ Safe</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* REPORTS PAGE */}

        {activePage === "Reports" && (
          <section className="maintenance-page">
            <div className="page-heading">
              <div>
                <h2>📊 Reports & Analytics</h2>
                <p>Railway maintenance and block planning performance</p>
              </div>
            </div>

            {/* SUMMARY CARDS */}

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">🔧</div>
                <div>
                  <span>Total Maintenance Tasks</span>
                  <strong>{tasks.length}</strong>
                  <small>All maintenance activities</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">🚧</div>
                <div>
                  <span>Total Block Requests</span>
                  <strong>{blockRequests.length}</strong>
                  <small>Maintenance block requests</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">📅</div>
                <div>
                  <span>Scheduled Blocks</span>
                  <strong>
                    {
                      blockRequests.filter(
                        (request) =>
                          request.status === "Approved" ||
                          request.status === "Rescheduled"
                      ).length
                    }
                  </strong>
                  <small>Approved & scheduled</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red">⚠️</div>
                <div>
                  <span>High Priority Tasks</span>
                  <strong>{highPriority}</strong>
                  <small>Requires attention</small>
                </div>
              </div>
            </div>

            {/* DEPARTMENT REPORT */}

            <div className="content-card">
              <div className="card-header">
                <div>
                  <h3>Department-wise Maintenance</h3>
                  <p>Maintenance workload by department</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Tasks</th>
                    <th>High Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <strong>Engineering</strong>
                    </td>

                    <td>
                      {
                        tasks.filter(
                          (task) => task.department === "Engineering"
                        ).length
                      }
                    </td>

                    <td>
                      {
                        tasks.filter(
                          (task) =>
                            task.department === "Engineering" &&
                            task.priority === "High"
                        ).length
                      }
                    </td>

                    <td>
                      <span className="status pending">Active</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <strong>S&T</strong>
                    </td>

                    <td>
                      {tasks.filter((task) => task.department === "S&T").length}
                    </td>

                    <td>
                      {
                        tasks.filter(
                          (task) =>
                            task.department === "S&T" &&
                            task.priority === "High"
                        ).length
                      }
                    </td>

                    <td>
                      <span className="status pending">Active</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <strong>Traction</strong>
                    </td>

                    <td>
                      {
                        tasks.filter((task) => task.department === "Traction")
                          .length
                      }
                    </td>

                    <td>
                      {
                        tasks.filter(
                          (task) =>
                            task.department === "Traction" &&
                            task.priority === "High"
                        ).length
                      }
                    </td>

                    <td>
                      <span className="status pending">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BLOCK REQUEST REPORT */}

            <div className="content-card">
              <div className="card-header">
                <div>
                  <h3>Block Request Summary</h3>
                  <p>Current status of maintenance block requests</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Total Requests</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <span className="status pending">Pending</span>
                    </td>

                    <td>
                      {
                        blockRequests.filter(
                          (request) => request.status === "Pending"
                        ).length
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="status approved">Approved</span>
                    </td>

                    <td>
                      {
                        blockRequests.filter(
                          (request) => request.status === "Approved"
                        ).length
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="status scheduled">Rescheduled</span>
                    </td>

                    <td>
                      {
                        blockRequests.filter(
                          (request) => request.status === "Rescheduled"
                        ).length
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span className="status rejected">Rejected</span>
                    </td>

                    <td>
                      {
                        blockRequests.filter(
                          (request) => request.status === "Rejected"
                        ).length
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* REPORT FOOTER */}

            <div className="content-card report-note">
              <h3>🤖 AI Planning Report</h3>

              <p>
                The Automatic Block Planning System analyses maintenance
                priority, block requests, train movements and conflicts to
                support optimized railway maintenance planning.
              </p>

              <strong>Railway Automatic Block Planning System</strong>
            </div>
          </section>
        )}

        {/* SETTINGS PAGE */}

        {activePage === "Settings" && (
          <section className="settings-page">
            <div className="page-heading">
              <div>
                <h2>⚙️ System Settings</h2>
                <p>Configure railway block planning system</p>
              </div>
            </div>

            <div className="settings-grid">
              {/* GENERAL SETTINGS */}
              <div className="settings-card">
                <h3>⚙️ General Settings</h3>
                <p>Basic system configuration</p>

                <div className="setting-row">
                  <div>
                    <strong>System Name</strong>
                    <small>Application name</small>
                  </div>

                  <input
                    type="text"
                    defaultValue="Railway Automatic Block Planning System"
                  />
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Default Block Duration</strong>
                    <small>Standard maintenance block duration</small>
                  </div>

                  <select defaultValue="3">
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="6">6 Hours</option>
                  </select>
                </div>
              </div>

              {/* PLANNING SETTINGS */}
              <div className="settings-card">
                <h3>🤖 Planning Settings</h3>
                <p>Configure automatic planning engine</p>

                <div className="setting-row">
                  <div>
                    <strong>AI Planning Engine</strong>
                    <small>Automatically generate block plans</small>
                  </div>

                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Train Conflict Detection</strong>
                    <small>Check blocks against train movements</small>
                  </div>

                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Multi-Department Planning</strong>
                    <small>Combine maintenance activities</small>
                  </div>

                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* NOTIFICATION SETTINGS */}
              <div className="settings-card">
                <h3>🔔 Notifications</h3>
                <p>System alert preferences</p>

                <div className="setting-row">
                  <div>
                    <strong>Block Request Alerts</strong>
                    <small>Notify when request status changes</small>
                  </div>

                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div>
                    <strong>Conflict Alerts</strong>
                    <small>Notify when train conflict is detected</small>
                  </div>

                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* DEPARTMENT SETTINGS */}
              <div className="settings-card">
                <h3>🏢 Departments</h3>
                <p>Active railway maintenance departments</p>

                <div className="department-list">
                  <div className="department-item">
                    <span>Engineering</span>
                    <span className="status active-status">Active</span>
                  </div>

                  <div className="department-item">
                    <span>S&T</span>
                    <span className="status active-status">Active</span>
                  </div>

                  <div className="department-item">
                    <span>Traction</span>
                    <span className="status active-status">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="settings-actions">
              <button
                className="primary-btn"
                onClick={() => alert("✅ Settings saved successfully!")}
              >
                💾 Save Settings
              </button>
            </div>
          </section>
        )}

        {/* AI Plan result modal */}
        {showAiPlanModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowAiPlanModal(false)}
          >
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🤖 AI Block Plan</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowAiPlanModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {loadingAiPlan ? (
                  <p>Generating plan, please wait...</p>
                ) : (
                  <pre className="ai-plan-text">{aiPlanText}</pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Module 3: AI Block Window Options modal */}
        {showOptionsModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowOptionsModal(false)}
          >
            <div
              className="modal-box options-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>🤖 Suggested Time Windows</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowOptionsModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {activeOptionsRequest && (
                  <p className="options-context">
                    <strong>{activeOptionsRequest.task}</strong> —{" "}
                    {activeOptionsRequest.location} on{" "}
                    {String(activeOptionsRequest.date).slice(0, 10)}
                  </p>
                )}

                {loadingOptions && <p>Analyzing train schedule and conflicts...</p>}

                {!loadingOptions && optionsData?.error && (
                  <p className="options-error">
                    ❌ Could not generate options: {optionsData.error}
                  </p>
                )}

                {!loadingOptions && optionsData?.options && (
                  <>
                    <div className="options-grid">
                      {optionsData.options.map((opt, i) => {
                        const isRecommended =
                          opt.label === optionsData.recommended_label;

                        return (
                          <div
                            key={i}
                            className={`option-card ${
                              isRecommended ? "recommended" : ""
                            }`}
                          >
                            {isRecommended && (
                              <span className="recommended-badge">
                                ⭐ AI Recommended
                              </span>
                            )}

                            <h4>{opt.label}</h4>
                            <div className="option-time">
                              {opt.startTime} – {opt.endTime}
                            </div>

                            <div className="option-tags">
                              <span
                                className={`impact-tag impact-${String(
                                  opt.train_impact
                                ).toLowerCase()}`}
                              >
                                Train Impact: {opt.train_impact}
                              </span>
                              <span
                                className={`impact-tag efficiency-${String(
                                  opt.work_efficiency
                                ).toLowerCase()}`}
                              >
                                Efficiency: {opt.work_efficiency}
                              </span>
                            </div>

                            {opt.pros?.length > 0 && (
                              <ul className="pros-list">
                                {opt.pros.map((p, idx) => (
                                  <li key={idx}>✅ {p}</li>
                                ))}
                              </ul>
                            )}

                            {opt.cons?.length > 0 && (
                              <ul className="cons-list">
                                {opt.cons.map((c, idx) => (
                                  <li key={idx}>⚠️ {c}</li>
                                ))}
                              </ul>
                            )}

                            <button
                              className="use-slot-btn"
                              onClick={() => applyBlockOption(opt)}
                            >
                              Use This Slot
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {optionsData.recommendation_reason && (
                      <div className="recommendation-note">
                        <strong>Why {optionsData.recommended_label}:</strong>{" "}
                        {optionsData.recommendation_reason}
                      </div>
                    )}

                    <p className="human-decision-note">
                      Final approval/rejection is still your decision — AI
                      only suggests time windows.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
