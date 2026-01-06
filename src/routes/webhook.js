import bot from "../bot/bot.js";
import Request from "../models/Request.js";
import Reaction from "../models/Reaction.js";
import Specialist from "../models/Specialist.js";
import { CATEGORIES } from "../lib/constants.js";
import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

export default router;
