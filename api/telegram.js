import bot from "../src/bot/bot.js";
import Request from "../src/models/Request.js";
import Reaction from "../src/models/Reaction.js";
import Specialist from "../src/models/Specialist.js";
import { CATEGORIES } from "../src/lib/constants.js";
import { CATEGORIES } from "../src/lib/constants.js";
import express from "express";
import dbConnect from "../src/lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    await dbConnect();
    await bot.processUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return res.status(500).json({ ok: false });
  }
}
