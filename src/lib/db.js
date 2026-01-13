import express from "express";
import mongoose from "mongoose";
const app = express();
app.use(express.json());

(async function run() {
  try {
    await mongoose.connect(process.env.DB_TOKEN);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
})().catch((e) => console.log(e));
