require("dotenv").config();
const mongoose = require("mongoose");
const Articulo = require("../models/Articulo");
const catalogSeed = require("../data/catalog.seed");

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo conectado para seed");

    await Articulo.deleteMany({ sourceId: { $exists: true } });
    const inserted = await Articulo.insertMany(catalogSeed);

    console.log(`Seed completado: ${inserted.length} articulos insertados.`);
  } catch (error) {
    console.error("Error en seed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Mongo desconectado");
  }
}

runSeed();
