import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./solicitudes.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

function Solicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [imagenActiva, setImagenActiva] = useState(null);
  const [articulosMap, setArticulosMap] = useState({});

  useEffect(() => {
    // Verificar si hay sesión activa
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }

    const cargarDatos = async () => {
      setCargando(true);
      setError("");
      try {
        const [solicitudesRes, articulosRes] = await Promise.all([
          fetch(`${API_BASE}/solicitudes`),
          fetch(`${API_BASE}/articulos`),
        ]);

        if (!solicitudesRes.ok || !articulosRes.ok) {
          throw new Error("No se pudo cargar");
        }

        const solicitudesData = await solicitudesRes.json();
        const articulosData = await articulosRes.json();

        // Crear un mapa de artículos por ID para acceso rápido
        const mapa = {};
        articulosData.forEach((art) => {
          mapa[art._id] = art;
        });
        setArticulosMap(mapa);
        setSolicitudes(solicitudesData);
      } catch {
        setError("No se pudo conectar con la base de datos.");
        setSolicitudes([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const pendientes = useMemo(
    () => solicitudes.filter((item) => item.estado === "pendiente").length,
    [solicitudes],
  );

  const marcarRevisada = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/solicitudes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "revisada" }),
      });
      if (!response.ok) {
        throw new Error("No se pudo actualizar");
      }
      const updated = await response.json();
      setSolicitudes((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch {
      setError("No se pudo actualizar la solicitud.");
    }
  };

  const eliminarSolicitud = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/solicitudes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("No se pudo eliminar");
      }
      setSolicitudes((prev) => prev.filter((item) => item._id !== id));
    } catch {
      setError("No se pudo eliminar la solicitud.");
    }
  };

  return (
    <section className="requests">
      <header className="requests-head">
        <div className="requests-head__content">
          <div>
            <p>Panel / Intercambios</p>
            <h2>Dashboard de solicitudes</h2>
          </div>
          <button
            type="button"
            className="requests-head__btn-volver"
            onClick={() => navigate("/admin")}
          >
            ← Volver al panel
          </button>
        </div>
      </header>

      <div className="requests-stats">
        <article>
          <p>Total</p>
          <strong>{solicitudes.length}</strong>
        </article>
        <article>
          <p>Pendientes</p>
          <strong>{pendientes}</strong>
        </article>
      </div>

      {cargando ? <p className="requests-empty">Cargando solicitudes...</p> : null}
      {!cargando && error ? <p className="requests-empty">{error}</p> : null}

      {!cargando && !error && !solicitudes.length ? (
        <p className="requests-empty">No hay solicitudes por ahora.</p>
      ) : null}

      {!cargando && !error && solicitudes.length ? (
        <div className="requests-grid">
          {solicitudes.map((item) => (
            <article className="request-card" key={item._id}>
              <header className="request-card__head">
                <p className={`request-status ${item.estado === "revisada" ? "done" : "pending"}`}>
                  {item.estado}
                </p>
                <small>{formatDate(item.creadaEn || item.createdAt)}</small>
              </header>

              <div className="request-card__layout">
                <div className="request-card__article">
                  <h3>Artículo</h3>

                  <aside className="request-card__article-image" aria-label="Foto del artículo">
                    {(() => {
                      const imagenUrl = articulosMap[item.articuloId]?.imagenFrenteUrl;
                      return imagenUrl ? (
                        <button
                          type="button"
                          className="request-card__thumb"
                          onClick={() => setImagenActiva(imagenUrl)}
                        >
                          <img src={imagenUrl} alt={`Foto artículo ${item.articuloNombre}`} />
                          <span>Expandir imagen</span>
                        </button>
                      ) : (
                        <p className="request-card__image-empty">Sin imagen</p>
                      );
                    })()}
                  </aside>

                  <div className="request-card__block">
                    <h4>{item.articuloNombre}</h4>
                    <p>
                      <strong>Tipo:</strong> {item.articuloTipo}
                    </p>
                    <p>
                      <strong>País:</strong> {item.articuloPais}
                    </p>
                    <p>
                      <strong>Año:</strong> {item.articuloAnio}
                    </p>
                  </div>
                </div>

                <div className="request-card__right">
                  <h3>Solicitante</h3>

                  <aside className="request-card__image" aria-label="Foto de la solicitud">
                    {item.imagenUrl ? (
                      <button
                        type="button"
                        className="request-card__thumb"
                        onClick={() => setImagenActiva(item.imagenUrl)}
                      >
                        <img src={item.imagenUrl} alt={`Foto solicitud ${item.solicitanteNombre}`} />
                        <span>Expandir imagen</span>
                      </button>
                    ) : (
                      <p className="request-card__image-empty">Sin imagen</p>
                    )}
                  </aside>

                  <div className="request-card__solicitud">
                    <div className="request-card__block">
                      <p>
                        <strong>Nombre:</strong> {item.solicitanteNombre}
                      </p>
                      <p>
                        <strong>Correo:</strong> {item.solicitanteCorreo}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {item.solicitanteTelefono}
                      </p>
                      <p>
                        <strong>Mensaje:</strong> {item.mensaje || "Sin mensaje"}
                      </p>
                    </div>
                    <div className="request-card__actions">
                      <button type="button" onClick={() => marcarRevisada(item._id)}>
                        Marcar revisada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const subject = encodeURIComponent("Respuesta a solicitud de intercambio");
                          const to = encodeURIComponent(item.solicitanteCorreo);
                          window.open(
                            `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${to}&su=${subject}`,
                            "_blank"
                          );
                        }}
                        className="request-card__link-button"
                      >
                        Responder vía correo
                      </button>
                      <button type="button" onClick={() => eliminarSolicitud(item._id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {imagenActiva ? (
        <div
          className="request-modal"
          onClick={() => setImagenActiva(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="request-modal__box" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setImagenActiva(null)}>
              Cerrar
            </button>
            <img src={imagenActiva} alt="Foto solicitud ampliada" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Solicitudes;

