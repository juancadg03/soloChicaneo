const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const articulosRoutes = require("./src/routes/articulos.routes");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "soloChicaneo-api" });
});

app.use("/api/articulos", articulosRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Error interno del servidor",
  });
});

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});