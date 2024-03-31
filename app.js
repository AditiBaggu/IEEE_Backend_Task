const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/User-Routes");
const db = require("./db");

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method == "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api/ieee", userRoutes);

db.connect((err) => {
  if (err) {
    console.error("Failed to connect to SQL database:", err);
    return;
  }
  console.log("Connected to SQL database");
  app.listen(4444, () => {
    console.log("Server started on port 4444");
  });
});
