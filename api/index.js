const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");
const app = require("express")();
const {v4} = require("uuid");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));

app.use(cors());
app.use(express.json());

const messageSchema = new mongoose.Schema({
  user: String,
  messageBody: String,
  room: String,
  when: String,
  dateCreated: Number,
});

const Message = mongoose.model("messages", messageSchema);

async function clearOldMessages() {
  let currentTime = Date.now();
  let allMessages = await Message.find({});
  for (let message of allMessages) {
    if (message.dateCreated && currentTime - message.dateCreated > 900000) {
      await Message.deleteOne({_id: message._id});
    }
  }
}

app.get("/api", (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get("/api/item/:slug", (req, res) => {
  const {slug} = req.params;
  res.end(`Item: ${slug}`);
});

app.get("/api/get-all-messages", async (req, res) => {
  let allMessages = await Message.find({});
  res.send(allMessages);
});

app.get("/api/clear-messages", async (req, res) => {
  await clearOldMessages();
});

app.post("/api/add-message", async (req, res) => {
  let message = new Message(req.body);
  let currentTime = new Date();
  let currentDate = currentTime.toLocaleString();
  message.when = currentDate;
  message.dateCreated = currentTime;
  await message.save();
});

app.listen(port, async () => {
  console.log("Now listening on http://localhost:" + port);
});

module.exports = app;
