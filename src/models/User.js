import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
  telegramId: { type: Number, unique: true },
  role: { type: String, enum: ["client", "specialist"], default: null },
  state: {
    type: String,
    enum: ["START", "ROLE_SELECT", "CATEGORY_SELECT", "WAIT_MESSAGE"],
    default: "START",
  },
  selectedCategory: String,
  categories: [String],
  state: String,
  pendingInvites: [
    {
      categoryKey: String,
      channelId: Number,
      expiresAt: Date,
    },
  ],
  lastInviteSentAt: Date,
});

export default models.User || model("User", UserSchema);
