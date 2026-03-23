const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  location: String,
  hotelName: String,
  pickupTime: String,
  expiryTime: String,
  status: { type: String, default: "available" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Food", foodSchema);