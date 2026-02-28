const { Readable } = require("stream");
const Solicitud = require("../models/Solicitud");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "solicitudes",
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

const getSolicitudes = async (_req, res) => {
  const solicitudes = await Solicitud.find().sort({ createdAt: -1 });
  res.json(solicitudes);
};

const createSolicitud = async (req, res) => {
  const {
    articuloId,
    articuloNombre,
    articuloTipo,
    articuloPais,
    articuloAnio,
    solicitanteNombre,
    solicitanteCorreo,
    solicitanteTelefono,
    mensaje = "",
  } = req.body;

  if (
    !articuloId ||
    !articuloNombre ||
    !articuloTipo ||
    !articuloPais ||
    !articuloAnio ||
    !solicitanteNombre ||
    !solicitanteCorreo ||
    !solicitanteTelefono ||
    !mensaje.trim() ||
    !req.file
  ) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  const nuevaSolicitudData = {
    articuloId,
    articuloNombre,
    articuloTipo,
    articuloPais,
    articuloAnio: Number(articuloAnio),
    solicitanteNombre,
    solicitanteCorreo,
    solicitanteTelefono,
    mensaje: mensaje.trim(),
  };

  const uploadResult = await uploadToCloudinary(req.file.buffer);
  nuevaSolicitudData.imagenUrl = uploadResult.secure_url;
  nuevaSolicitudData.imagenPublicId = uploadResult.public_id;

  const nuevaSolicitud = await Solicitud.create(nuevaSolicitudData);

  res.status(201).json(nuevaSolicitud);
};

const updateSolicitud = async (req, res) => {
  const { estado } = req.body;
  const solicitud = await Solicitud.findById(req.params.id);

  if (!solicitud) {
    return res.status(404).json({ message: "Solicitud no encontrada" });
  }

  if (estado) {
    solicitud.estado = estado;
  }

  await solicitud.save();
  res.json(solicitud);
};

const deleteSolicitud = async (req, res) => {
  const solicitud = await Solicitud.findById(req.params.id);

  if (!solicitud) {
    return res.status(404).json({ message: "Solicitud no encontrada" });
  }

  if (solicitud.imagenPublicId) {
    await cloudinary.uploader.destroy(solicitud.imagenPublicId);
  }

  await solicitud.deleteOne();
  res.json({ message: "Solicitud eliminada" });
};

module.exports = {
  getSolicitudes,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
};


