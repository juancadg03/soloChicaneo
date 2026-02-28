const express = require("express");
const multer = require("multer");
const {
  getSolicitudes,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
} = require("../controllers/solicitudes.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/", getSolicitudes);
router.post("/", upload.single("foto"), createSolicitud);
router.patch("/:id", updateSolicitud);
router.delete("/:id", deleteSolicitud);

module.exports = router;
