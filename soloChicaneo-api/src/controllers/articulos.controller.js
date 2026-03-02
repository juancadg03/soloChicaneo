const { Readable } = require("stream");
const Articulo = require("../models/Articulo");
const cloudinary = require("../config/cloudinary");

const buildFilter = (query) => {
  const { tipo, pais, intercambiable, anio, q } = query;
  const filter = {};

  if (tipo && tipo !== "todos") filter.tipo = tipo;
  if (pais && pais !== "todos") filter.pais = pais;
  if (intercambiable && intercambiable !== "todos") {
    filter.intercambiable = intercambiable === "true";
  }
  if (anio && anio !== "todos") filter.anio = Number(anio);
  if (q && q.trim()) {
    filter.$or = [
      { nombre: { $regex: q.trim(), $options: "i" } },
      { descripcion: { $regex: q.trim(), $options: "i" } },
    ];
  }

  return filter;
};

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "numismatica",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

const getArticulos = async (req, res) => {
  const filter = buildFilter(req.query);
  const articulos = await Articulo.find(filter).sort({ createdAt: -1 });
  res.json(articulos);
};

const getArticuloById = async (req, res) => {
  const articulo = await Articulo.findById(req.params.id);
  if (!articulo) {
    return res.status(404).json({ message: "Articulo no encontrado" });
  }
  res.json(articulo);
};

const createArticulo = async (req, res) => {
  const {
    nombre,
    tipo,
    anio,
    pais,
    intercambiable,
    descripcion,
    imagenLocal = "",
  } = req.body;

  const nuevoArticuloData = {
    nombre,
    tipo,
    anio: Number(anio),
    pais,
    intercambiable: intercambiable === "true" || intercambiable === true,
    descripcion,
    imagenLocal,
  };

  // Manejar imagen del frente
  if (req.files?.imagenFrente) {
    const uploadResult = await uploadToCloudinary(req.files.imagenFrente[0].buffer);
    nuevoArticuloData.imagenFrenteUrl = uploadResult.secure_url;
    nuevoArticuloData.imagenFrentePublicId = uploadResult.public_id;
  }

  // Manejar imagen de atrás
  if (req.files?.imagenAtras) {
    const uploadResult = await uploadToCloudinary(req.files.imagenAtras[0].buffer);
    nuevoArticuloData.imagenAtrasUrl = uploadResult.secure_url;
    nuevoArticuloData.imagenAtrasPublicId = uploadResult.public_id;
  }

  const nuevoArticulo = await Articulo.create(nuevoArticuloData);

  res.status(201).json(nuevoArticulo);
};

const updateArticulo = async (req, res) => {
  const { nombre, tipo, anio, pais, intercambiable, descripcion, imagenLocal } =
    req.body;
  const articulo = await Articulo.findById(req.params.id);

  if (!articulo) {
    return res.status(404).json({ message: "Articulo no encontrado" });
  }

  // Manejar imagen del frente
  if (req.files?.imagenFrente) {
    if (articulo.imagenFrentePublicId) {
      await cloudinary.uploader.destroy(articulo.imagenFrentePublicId);
    }
    const uploadResult = await uploadToCloudinary(req.files.imagenFrente[0].buffer);
    articulo.imagenFrenteUrl = uploadResult.secure_url;
    articulo.imagenFrentePublicId = uploadResult.public_id;
  }

  // Manejar imagen de atrás
  if (req.files?.imagenAtras) {
    if (articulo.imagenAtrasPublicId) {
      await cloudinary.uploader.destroy(articulo.imagenAtrasPublicId);
    }
    const uploadResult = await uploadToCloudinary(req.files.imagenAtras[0].buffer);
    articulo.imagenAtrasUrl = uploadResult.secure_url;
    articulo.imagenAtrasPublicId = uploadResult.public_id;
  }

  if (nombre !== undefined) articulo.nombre = nombre;
  if (tipo !== undefined) articulo.tipo = tipo;
  if (anio !== undefined) articulo.anio = Number(anio);
  if (pais !== undefined) articulo.pais = pais;
  if (intercambiable !== undefined) {
    articulo.intercambiable = intercambiable === "true" || intercambiable === true;
  }
  if (descripcion !== undefined) articulo.descripcion = descripcion;
  if (imagenLocal !== undefined) articulo.imagenLocal = imagenLocal;

  await articulo.save();
  res.json(articulo);
};

const deleteArticulo = async (req, res) => {
  const articulo = await Articulo.findById(req.params.id);

  if (!articulo) {
    return res.status(404).json({ message: "Articulo no encontrado" });
  }

  // Eliminar imagen del frente
  if (articulo.imagenFrentePublicId) {
    await cloudinary.uploader.destroy(articulo.imagenFrentePublicId);
  }

  // Eliminar imagen de atrás
  if (articulo.imagenAtrasPublicId) {
    await cloudinary.uploader.destroy(articulo.imagenAtrasPublicId);
  }

  // Compatibilidad con anterior
  if (articulo.imagenPublicId) {
    await cloudinary.uploader.destroy(articulo.imagenPublicId);
  }

  await articulo.deleteOne();

  res.json({ message: "Articulo eliminado" });
};

module.exports = {
  getArticulos,
  getArticuloById,
  createArticulo,
  updateArticulo,
  deleteArticulo,
};
