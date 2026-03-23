const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Food = require("./models/Food");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔗 CONNECT DB */
mongoose.connect("mongodb://127.0.0.1:27017/food_rescue")
.then(() => console.log("✅ DB Connected"))
.catch(err => console.log("❌ DB Error:", err));

/* 🔔 SSE CLIENTS */
let clients = [];

/* 📡 EVENTS */
app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  res.flushHeaders();

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

/* 🟢 ADD FOOD (DB) */
app.post("/add-food", async (req, res) => {
  try {
    const food = new Food({
      ...req.body,
      status: "Available",
      createdAt: new Date(),
      acceptedAt: null,
      deliveredAt: null
    });

    await food.save();

    // 🔔 notify volunteers
    clients.forEach(client =>
      client.res.write(`data: ${JSON.stringify({ type: "newFood", food })}\n\n`)
    );

    res.json({ message: "Food Added", data: food });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 🟢 GET ALL FOOD */
app.get("/foods", async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});

/* 🟡 ACCEPT FOOD */
app.post("/accept/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food || food.status !== "Available") {
      return res.json({ message: "Invalid ID or Already Accepted" });
    }

    food.status = "Accepted";
    food.acceptedAt = new Date();

    await food.save();

    // 🔥 Notify NGO
    clients.forEach(client =>
      client.res.write(`data: ${JSON.stringify({ type: 'acceptedFood', food })}\n\n`)
    );

    res.json({ message: "Accepted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* 🔴 DELIVER FOOD */
app.post("/deliver/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (food && food.status === "Accepted") {
      food.status = "Delivered";
      food.deliveredAt = new Date();

      await food.save();

      res.json({ message: "Delivered", data: food });
    } else {
      res.json({ message: "Not accepted yet or invalid" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ⚫ EDIT FOOD */
app.post("/edit/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (food) {
      food.name = req.body.name;
      food.qty = req.body.qty;
      food.location = req.body.location;

      await food.save();

      res.json({ message: "Updated", data: food });
    } else {
      res.json({ message: "Invalid ID" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ⚫ DELETE FOOD */
app.post("/delete/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 🚀 START SERVER */
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));