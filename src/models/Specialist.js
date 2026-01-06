import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const SpecialistSchema = new Schema({
  telegramId: { type: Number, unique: true },
  username: String,
  categories: [String],
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
});

export default models.Specialist || model("Specialist", SpecialistSchema);
