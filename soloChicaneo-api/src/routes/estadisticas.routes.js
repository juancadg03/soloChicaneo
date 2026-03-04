const express = require("express");
const { getEstadisticas, registrarVisita } = require("../controllers/estadisticas.controller");

const router = express.Router();

router.get("/", getEstadisticas);
router.post("/visita", registrarVisita);

module.exports = router;
