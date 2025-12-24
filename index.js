const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const webhookRouter = require('./src/routes/webhook');

const app = express();
app.use(express.json());

// MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error(err));

// Routes
// app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});