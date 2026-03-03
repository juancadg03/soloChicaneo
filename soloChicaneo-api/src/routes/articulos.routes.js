const express = require("express");
const multer = require("multer");
const {
  getArticulos,
  getArticuloById,
  createArticulo,
  updateArticulo,
  deleteArticulo,
  toggleLike,
} = require("../controllers/articulos.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/", getArticulos);
router.get("/:id", getArticuloById);
router.post("/", upload.fields([{ name: "imagenFrente" }, { name: "imagenAtras" }]), createArticulo);
router.put("/:id", upload.fields([{ name: "imagenFrente" }, { name: "imagenAtras" }]), updateArticulo);
router.delete("/:id", deleteArticulo);
router.post("/:id/like", toggleLike);

module.exports = router;