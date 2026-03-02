import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./detalle-articulo.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEFAULT_IMAGE = "/catalogo/default.jpg";

const initialRequester = {
  nombre: "",
  correo: "",
  telefono: "",
  mensaje: "",
};

const resolveFaces = (item) => {
  const front = item?.imagenFrenteUrl?.trim() || item?.imagenLocal?.trim() || item?.imagenUrl?.trim() || DEFAULT_IMAGE;
  const back = item?.imagenAtrasUrl?.trim() || front;
  return { front, back };
};

function DetalleArticulo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [detalleIndex, setDetalleIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requester, setRequester] = useState(initialRequester);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const cargarArticulo = async () => {
      try {
        const response = await fetch(`${API_BASE}/articulos/${id}`);
        if (!response.ok) {
          throw new Error("Artículo no encontrado");
        }
        const data = await response.json();
        setArticulo(data);
      } catch {
        setError("No se pudo cargar el artículo.");
      } finally {
        setCargando(false);
      }
    };

    cargarArticulo();
  }, [id]);

  const detailImages = articulo
    ? [resolveFaces(articulo).front, resolveFaces(articulo).back]
    : [];

  const moveSlide = (direction) => {
    if (!detailImages.length) {
      return;
    }
    setDetalleIndex((prev) => (prev + direction + detailImages.length) % detailImages.length);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1));

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    if (!articulo || !articulo.intercambiable) {
      setRequestError("Este articulo no esta disponible para intercambio.");
      return;
    }

    const nombre = requester.nombre.trim();
    const correo = requester.correo.trim();
    const telefono = requester.telefono.trim();
    const mensaje = requester.mensaje.trim();

    if (!nombre || !correo || !telefono || !mensaje) {
      setRequestError("Ingresa tu nombre, correo, telefono y mensaje.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(correo)) {
      setRequestError("Ingresa un correo valido.");
      return;
    }

    if (!foto) {
      setRequestError("Debes adjuntar una foto de tu articulo.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("articuloId", articulo._id);
      formData.append("articuloNombre", articulo.nombre);
      formData.append("articuloTipo", articulo.tipo);
      formData.append("articuloPais", articulo.pais);
      formData.append("articuloAnio", articulo.anio);
      formData.append("solicitanteNombre", nombre);
      formData.append("solicitanteCorreo", correo);
      formData.append("solicitanteTelefono", telefono);
      formData.append("mensaje", mensaje);
      formData.append("foto", foto);

      const response = await fetch(`${API_BASE}/solicitudes`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar la solicitud");
      }

      setRequestError("");
      setRequestSuccess("Solicitud enviada. Espere la respuesta del administrador en su correo electrónico.");
      setRequester(initialRequester);
      setFoto(null);
      setShowRequestForm(false);
    } catch {
      setRequestError("No se pudo enviar la solicitud. Intenta nuevamente.");
    }
  };

  if (cargando) {
    return (
      <section className="detalle-articulo">
        <p className="detalle-articulo__empty">Cargando artículo...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detalle-articulo">
        <p className="detalle-articulo__empty">{error}</p>
      </section>
    );
  }

  if (!articulo) {
    return (
      <section className="detalle-articulo">
        <p className="detalle-articulo__empty">Artículo no encontrado.</p>
      </section>
    );
  }

  return (
    <section className="detalle-articulo">
      <header className="detalle-articulo__head">
        <button
          type="button"
          className="detalle-articulo__back"
          onClick={() => navigate("/coleccion")}
        >
          ← Volver a colección
        </button>
      </header>

      <div className="detalle-articulo__container">
        <div className="detalle-articulo__left">
          <div className="detalle-articulo__slider">
            <button
              type="button"
              className="detalle-articulo__arrow"
              onClick={() => moveSlide(-1)}
            >
              &#10094;
            </button>
            <div className="detalle-articulo__track">
              <img
                className="detalle-articulo__img"
                src={detailImages[detalleIndex]}
                alt={`${articulo.nombre} ${detalleIndex === 0 ? "frontal" : "trasera"}`}
                onClick={() => setIsZoomOpen(true)}
              />
            </div>
            <button
              type="button"
              className="detalle-articulo__arrow"
              onClick={() => moveSlide(1)}
            >
              &#10095;
            </button>
          </div>
          <p className="detalle-articulo__counter">
            {detalleIndex + 1} / {detailImages.length}
          </p>
        </div>

        <div className="detalle-articulo__right">
          <div className="detalle-articulo__info">
            <p className="detalle-articulo__year">{articulo.anio}</p>
            <h1>{articulo.nombre}</h1>
            <p>
              <strong>País:</strong> {articulo.pais}
            </p>
            <p>
              <strong>Tipo:</strong> {articulo.tipo}
            </p>
            <p>
              <strong>Intercambiable:</strong> {articulo.intercambiable ? "Sí" : "No"}
            </p>
            <p className="detalle-articulo__description">{articulo.descripcion}</p>
          </div>

          {requestSuccess ? <p className="detalle-articulo__success">{requestSuccess}</p> : null}
          {requestError ? <p className="detalle-articulo__error">{requestError}</p> : null}

          <button
            type="button"
            disabled={!articulo.intercambiable}
            className="detalle-articulo__request-btn"
            onClick={() => {
              setShowRequestForm(true);
              setRequestError("");
              setRequestSuccess("");
            }}
          >
            Solicitar intercambio
          </button>
        </div>
        </div>

      {showRequestForm && articulo.intercambiable ? (
        <div className="detalle-articulo__modal" onClick={() => setShowRequestForm(false)}>
          <div className="detalle-articulo__modal-box" onClick={(event) => event.stopPropagation()}>
            <div className="detalle-articulo__modal-header">
              <h2>Solicitar Intercambio</h2>
              <button type="button" className="detalle-articulo__modal-close" onClick={() => setShowRequestForm(false)}>
                ✕
              </button>
            </div>
            <div className="detalle-articulo__modal-content">
              <form onSubmit={handleSubmitRequest}>
                <h3>DATOS DEL SOLICITANTE</h3>
                
                {requestSuccess ? <p className="detalle-articulo__success">{requestSuccess}</p> : null}
                {requestError ? <p className="detalle-articulo__error">{requestError}</p> : null}

                <label htmlFor="solicitante-nombre">Nombre</label>
                <input
                  id="solicitante-nombre"
                  type="text"
                  value={requester.nombre}
                  onChange={(event) =>
                    setRequester((prev) => ({ ...prev, nombre: event.target.value }))
                  }
                  placeholder="Tu nombre completo"
                  required
                />

                <label htmlFor="solicitante-correo">Correo</label>
                <input
                  id="solicitante-correo"
                  type="email"
                  value={requester.correo}
                  onChange={(event) =>
                    setRequester((prev) => ({ ...prev, correo: event.target.value }))
                  }
                  placeholder="tu@correo.com"
                  required
                />

                <label htmlFor="solicitante-telefono">Telefono</label>
                <input
                  id="solicitante-telefono"
                  type="tel"
                  value={requester.telefono}
                  onChange={(event) =>
                    setRequester((prev) => ({ ...prev, telefono: event.target.value }))
                  }
                  placeholder="3001234567"
                  required
                />

                <label htmlFor="solicitante-foto">Foto de tu articulo</label>
                <input
                  id="solicitante-foto"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFoto(e.target.files[0])}
                />

                <label htmlFor="solicitante-mensaje">Descripcion de su articulo</label>
                <textarea
                  id="solicitante-mensaje"
                  rows="4"
                  value={requester.mensaje}
                  onChange={(event) =>
                    setRequester((prev) => ({ ...prev, mensaje: event.target.value }))
                  }
                  placeholder="Detalles de tu propuesta"
                  required
                />

                <div className="detalle-articulo__form-actions">
                  <button type="submit" className="detalle-articulo__btn-submit">Enviar solicitud</button>
                  <button type="button" className="detalle-articulo__btn-cancel" onClick={() => setShowRequestForm(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {isZoomOpen ? (
        <div
          className="collection-modal"
          onClick={() => {
            setIsZoomOpen(false);
            setZoomLevel(1);
          }}
        >
          <div className="collection-modal__box" onClick={(event) => event.stopPropagation()}>
            <div className="collection-modal__tools">
              <button type="button" onClick={zoomOut}>
                -
              </button>
              <button type="button" onClick={zoomIn}>
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsZoomOpen(false);
                  setZoomLevel(1);
                }}
              >
                Cerrar
              </button>
            </div>
            <div
              className="collection-modal__viewport"
              onWheel={(event) => {
                event.preventDefault();
                if (event.deltaY < 0) zoomIn();
                else zoomOut();
              }}
            >
              <img
                src={detailImages[detalleIndex]}
                alt={`${articulo.nombre} ampliada`}
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default DetalleArticulo;
