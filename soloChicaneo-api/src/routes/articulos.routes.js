const express = require("express");
const multer = require("multer");
const {
  getArticulos,
  getArticuloById,
  createArticulo,
  updateArticulo,
  deleteArticulo,
  likeArticulo,
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
router.post("/", upload.single("imagen"), createArticulo);
router.put("/:id", upload.single("imagen"), updateArticulo);
router.post("/:id/like", likeArticulo);
router.delete("/:id", deleteArticulo);

module.exports = router;