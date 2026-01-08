import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
  telegramId: { type: Number, unique: true },
  role: { type: String, enum: ["client", "specialist"], default: null },
  state: {
    type: String,
    enum: [
      "START",
      "ROLE_SELECT",
      "CATEGORY_SELECT",
      "WAIT_MESSAGE",
      "SPECIALIST_CATEGORY_SELECT",
      "CLIENT_CREATE_REQUEST",
      "AWAITING_CHANNEL_JOIN",
    ],
    default: "START",
  },
  selectedCategory: String, // категория, выбранная клиентом
  categories: { type: [String], default: [] }, // категории специалиста
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
