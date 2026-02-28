import { useMemo, useState } from "react";
import { getSolicitudes, saveSolicitudes } from "../utils/solicitudesStorage";
import "./solicitudes.css";

const formatDate = (iso) => {
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
  const [solicitudes, setSolicitudes] = useState(() => getSolicitudes());

  const pendientes = useMemo(
    () => solicitudes.filter((item) => item.estado === "pendiente").length,
    [solicitudes],
  );

  const marcarRevisada = (id) => {
    const next = solicitudes.map((item) =>
      item.id === id ? { ...item, estado: "revisada" } : item,
    );
    setSolicitudes(next);
    saveSolicitudes(next);
  };

  const eliminarSolicitud = (id) => {
    const next = solicitudes.filter((item) => item.id !== id);
    setSolicitudes(next);
    saveSolicitudes(next);
  };

  return (
    <section className="requests">
      <header className="requests-head">
        <p>Panel / Intercambios</p>
        <h2>Dashboard de solicitudes</h2>
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

      {!solicitudes.length ? (
        <p className="requests-empty">No hay solicitudes por ahora.</p>
      ) : (
        <div className="requests-grid">
          {solicitudes.map((item) => (
            <article className="request-card" key={item.id}>
              <header className="request-card__head">
                <p className={`request-status ${item.estado === "revisada" ? "done" : "pending"}`}>
                  {item.estado}
                </p>
                <small>{formatDate(item.creadaEn)}</small>
              </header>

              <div className="request-card__block">
                <h3>{item.articuloNombre}</h3>
                <p>
                  <strong>Tipo:</strong> {item.articuloTipo}
                </p>
                <p>
                  <strong>Pais:</strong> {item.articuloPais}
                </p>
                <p>
                  <strong>Año:</strong> {item.articuloAnio}
                </p>
              </div>

              <div className="request-card__block">
                <p>
                  <strong>Solicitante:</strong> {item.solicitanteNombre}
                </p>
                <p>
                  <strong>Correo:</strong> {item.solicitanteCorreo}
                </p>
                <p>
                  <strong>Mensaje:</strong> {item.mensaje || "Sin mensaje"}
                </p>
              </div>

              <div className="request-card__actions">
                <button type="button" onClick={() => marcarRevisada(item.id)}>
                  Marcar revisada
                </button>
                <button type="button" onClick={() => eliminarSolicitud(item.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Solicitudes;
