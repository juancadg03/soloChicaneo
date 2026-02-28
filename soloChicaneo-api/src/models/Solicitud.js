const mongoose = require("mongoose");

const solicitudSchema = new mongoose.Schema(
  {
    articuloId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Articulo" },
    articuloNombre: { type: String, required: true, trim: true },
    articuloTipo: { type: String, required: true, trim: true },
    articuloPais: { type: String, required: true, trim: true },
    articuloAnio: { type: Number, required: true },
    solicitanteNombre: { type: String, required: true, trim: true },
    solicitanteCorreo: { type: String, required: true, trim: true },
    solicitanteTelefono: { type: String, required: true, trim: true },
    mensaje: { type: String, default: "", trim: true },
    estado: { type: String, enum: ["pendiente", "revisada"], default: "pendiente" },
    imagenUrl: { type: String, default: "" },
    imagenPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solicitud", solicitudSchema);



