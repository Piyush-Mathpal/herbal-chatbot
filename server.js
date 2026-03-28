
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message; // 👈 get message from frontend

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

   console.log("CHOICES:", JSON.stringify(data.choices, null, 2));

    if (data.error) {
      return res.json({ reply: "⚠️ " + data.error.message });
    }

    const aiReply =
  data?.choices?.[0]?.message?.content ||
  data?.choices?.[0]?.text ||
  JSON.stringify(data); // 👈 fallback to see real structure

    return res.json({ reply: aiReply });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ reply: "❌ Server error" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});