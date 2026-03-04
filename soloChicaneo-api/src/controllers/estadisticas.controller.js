const Articulo = require("../models/Articulo");
const Visita = require("../models/Visita");

const getEstadisticas = async (req, res) => {
  try {
    // Get total visits
    const totalVisitas = await Visita.countDocuments();

    // Get top 5 articles by likes
    const topArticulos = await Articulo.find()
      .sort({ likes: -1 })
      .limit(5)
      .select("nombre likes pais anio tipo");

    res.json({
      totalVisitas,
      topArticulos,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas", error: error.message });
  }
};

const registrarVisita = async (req, res) => {
  try {
    const visita = new Visita();
    await visita.save();
    res.status(201).json({ message: "Visita registrada" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar visita", error: error.message });
  }
};

module.exports = {
  getEstadisticas,
  registrarVisita,
};
