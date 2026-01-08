import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const RequestSchema = new Schema(
  {
    clientId: Number,
    category: String,
    text: String,
    channelMessageId: Number,
    expiresAt: Date,
    status: {
      type: String,
      enum: ["active", "closed", "done"],
      default: "active",
    },
    messageId: String,
    telegramId: String,
    closeRequestId: null || String,
  },
  { timestamps: true }
);

export default models.Request || model("Request", RequestSchema);
