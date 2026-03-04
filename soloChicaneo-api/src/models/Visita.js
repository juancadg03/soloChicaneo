const mongoose = require("mongoose");

const visitaSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visita", visitaSchema);
