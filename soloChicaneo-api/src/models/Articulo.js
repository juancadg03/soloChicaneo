const mongoose = require("mongoose");

const articuloSchema = new mongoose.Schema(
  {
    sourceId: { type: Number },
    nombre: { type: String, required: true, trim: true },
    tipo: {
      type: String,
      enum: ["moneda", "billete", "exclusivo"],
      required: true,
    },
    anio: { type: Number, required: true },
    pais: { type: String, required: true, trim: true },
    intercambiable: { type: Boolean, default: false },
    descripcion: { type: String, required: true, trim: true },
    imagenLocal: { type: String, default: "" },
    imagenUrl: { type: String, default: "" },
    imagenPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Articulo", articuloSchema);
