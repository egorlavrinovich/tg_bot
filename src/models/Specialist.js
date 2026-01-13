import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const SpecialistSchema = new Schema({
  telegramId: { type: Number, unique: true },
  username: String,
  categories: [String],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  orders: [
    {
      requestId: { type: Schema.Types.ObjectId, ref: "Request" },
      reactedAt: Date,
      requestText: String,
      mark: String || undefined,
    },
  ],
});

export default models.Specialist || model("Specialist", SpecialistSchema);
