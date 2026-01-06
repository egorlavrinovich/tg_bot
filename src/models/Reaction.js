import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ReactionSchema = new Schema({
  requestId: Schema.Types.ObjectId,
  specialistId: String,
  reactedAt: Date,
});

export default models.Reaction || model("Reaction", ReactionSchema);
