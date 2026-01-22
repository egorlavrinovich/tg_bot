import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

const { default: telegramHandler } = await import("./api/telegram.js");
const { default: pingHandler } = await import("./api/ping.js");

app.post("/api/telegram", telegramHandler);
app.get("/api/ping", pingHandler);
app.get("/", (_req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
