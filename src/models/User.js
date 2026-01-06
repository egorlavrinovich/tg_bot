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
});

export default models.User || model("User", UserSchema);
