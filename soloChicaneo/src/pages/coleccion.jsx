import { useEffect, useMemo, useState } from "react";
import "./coleccion.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEFAULT_IMAGE = "/catalogo/default.jpg";
const COUNTRY_IMAGE_PAIRS = {
  Ecuador: ["/1.webp", "/2.webp"],
  Mexico: ["/3.webp", "/4.webp"],
  "Estados Unidos": ["/5.webp", "/6.webp"],
  Peru: ["/7.webp", "/8.webp"],
  Colombia: ["/9.webp", "/10.webp"],
  Espana: ["/11.webp", "/12.webp"],
};

const resolveImageSrc = (item) =>
  item?.imagenLocal?.trim() || item?.imagenUrl?.trim() || DEFAULT_IMAGE;

const resolveFaces = (item) => {
  const local = resolveImageSrc(item);
  const pair = COUNTRY_IMAGE_PAIRS[item?.pais];
  if (!pair) {
    return { front: local, back: local };
  }
  return { front: pair[0], back: pair[1] };
};

const initialRequester = {
  nombre: "",
  correo: "",
  telefono: "",
  mensaje: "",
};

function Coleccion({ searchQuery = "", preset }) {
  const [busqueda, setBusqueda] = useState(searchQuery);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroAnio, setFiltroAnio] = useState("todos");
  const [filtroPais, setFiltroPais] = useState("todos");
  const [filtroIntercambio, setFiltroIntercambio] = useState("todos");
  const [catalogo, setCatalogo] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [cargando, setCargando] = useState(false);
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
    setBusqueda(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!preset?.token) {
      return;
    }
    setFiltroTipo(preset.filtroTipo ?? "todos");
    setFiltroIntercambio(preset.filtroIntercambio ?? "todos");
    setFiltroAnio("todos");
    setFiltroPais("todos");
  }, [preset]);

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const response = await fetch(`${API_BASE}/articulos`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el catalogo");
        }
        const data = await response.json();
        setCatalogo(data);
      } catch {
        setError("No se pudo conectar con la base de datos.");
      }
    };

    cargarCatalogo();
  }, []);

  useEffect(() => {
    const cargarResultados = async () => {
      setCargando(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (busqueda.trim()) params.set("q", busqueda.trim());
        if (filtroTipo !== "todos") params.set("tipo", filtroTipo);
        if (filtroAnio !== "todos") params.set("anio", filtroAnio);
        if (filtroPais !== "todos") params.set("pais", filtroPais);
        if (filtroIntercambio !== "todos") {
          params.set("intercambiable", filtroIntercambio);
        }

        const query = params.toString();
        const endpoint = query
          ? `${API_BASE}/articulos?${query}`
          : `${API_BASE}/articulos`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("No se pudo filtrar el catalogo");
        }

        const data = await response.json();
        setResultados(data);
      } catch {
        setError("No se pudo conectar con la base de datos.");
        setResultados([]);
      } finally {
        setCargando(false);
      }
    };

    cargarResultados();
  }, [busqueda, filtroAnio, filtroIntercambio, filtroPais, filtroTipo]);

  useEffect(() => {
    if (!resultados.length) {
      setSeleccionadoId(null);
      return;
    }

    const existeSeleccion = resultados.some((item) => item._id === seleccionadoId);
    if (!existeSeleccion) {
      setSeleccionadoId(resultados[0]._id);
    }
  }, [resultados, seleccionadoId]);

  const anios = useMemo(
    () => [...new Set(catalogo.map((item) => item.anio))].sort((a, b) => b - a),
    [catalogo],
  );

  const paises = useMemo(
    () => [...new Set(catalogo.map((item) => item.pais))].sort(),
    [catalogo],
  );

  const seleccionado = resultados.find((item) => item._id === seleccionadoId);
  const detailImages = seleccionado
    ? [resolveFaces(seleccionado).front, resolveFaces(seleccionado).back]
    : [];

  useEffect(() => {
    setDetalleIndex(0);
    setIsZoomOpen(false);
    setZoomLevel(1);
    setShowRequestForm(false);
    setRequester(initialRequester);
    setRequestError("");
    setRequestSuccess("");
  }, [seleccionadoId]);

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

    if (!seleccionado || !seleccionado.intercambiable) {
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
      formData.append("articuloId", seleccionado._id);
      formData.append("articuloNombre", seleccionado.nombre);
      formData.append("articuloTipo", seleccionado.tipo);
      formData.append("articuloPais", seleccionado.pais);
      formData.append("articuloAnio", seleccionado.anio);
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
      setRequestSuccess("Solicitud enviada. El administrador la vera en su dashboard.");
      setRequester(initialRequester);
      setFoto(null);
      setShowRequestForm(false);
    } catch {
      setRequestError("No se pudo enviar la solicitud. Intenta nuevamente.");
    }
  }; 

  return (
    <section className="collection">
      <header className="collection-top">
        <p>Inicio / Colección</p>
        <h2>Catálogo de numismática</h2>
      </header>

      <div className="collection-layout">
        <aside className="collection-filters">
          <h3>Filtrar por</h3>

          <label htmlFor="search">Busqueda</label>
          <input
            className="mi-input-busqueda"
            id="search"
            type="text"
            placeholder ="Nombre o descripcion"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />

          <label htmlFor="tipo">Categoría</label>
          <select
            id="tipo"
            value={filtroTipo}
            onChange={(event) => setFiltroTipo(event.target.value)}
          >
            <option value="todos">Todas</option>
            <option value="moneda">Moneda</option>
            <option value="billete">Billete</option>
            <option value="exclusivo">Mejor Valorados</option>
          </select>

          <label htmlFor="anio">Año</label>
          <select
            id="anio"
            value={filtroAnio}
            onChange={(event) => setFiltroAnio(event.target.value)}
          >
            <option value="todos">Todos</option>
            {anios.map((anio) => (
              <option key={anio} value={String(anio)}>
                {anio}
              </option>
            ))}
          </select>

          <label htmlFor="pais">País</label>
          <select
            id="pais"
            value={filtroPais}
            onChange={(event) => setFiltroPais(event.target.value)}
          >
            <option value="todos">Todos</option>
            {paises.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>

          <label htmlFor="intercambio">Intercambiable</label>
          <select
            id="intercambio"
            value={filtroIntercambio}
            onChange={(event) => setFiltroIntercambio(event.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="true">Si</option>
            <option value="false">No</option>
          </select>
        </aside>

        <main className="collection-main">
          <div className="collection-tabs">
            <button
              type="button"
              className={filtroIntercambio === "true" ? "" : "is-active"}
              onClick={() => setFiltroIntercambio("todos")}
            >
              Catalogo
            </button>
            <button
              type="button"
              className={filtroIntercambio === "true" ? "is-active" : ""}
              onClick={() => setFiltroIntercambio("true")}
            >
              Intercambiables
            </button>
          </div>

          {cargando && <p className="collection-empty">Cargando artículos...</p>}
          {!cargando && error && <p className="collection-empty">{error}</p>}
          {!cargando && !error && !resultados.length ? (
            <p className="collection-empty">
              No se encontraron articulos con los filtros seleccionados.
            </p>
          ) : null}

          {!cargando && !error && resultados.length ? (
            <div className="collection-grid">
              {resultados.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className={`collection-card ${
                    seleccionadoId === item._id ? "is-selected" : ""
                  }`}
                  onClick={() => setSeleccionadoId(item._id)}
                >
                  <span className="collection-card__flip">
                    <img
                      className="collection-card__img collection-card__img--front"
                      src={resolveFaces(item).front}
                      alt={`${item.nombre} frontal`}
                    />
                    <img
                      className="collection-card__img collection-card__img--back"
                      src={resolveFaces(item).back}
                      alt={`${item.nombre} trasera`}
                    />
                  </span>
                  <strong>{item.nombre}</strong>
                  <small>
                    {item.pais} - {item.anio}
                  </small>
                </button>
              ))}
            </div>
          ) : null}
        </main>

        <aside className="collection-detail">
          {seleccionado ? (
            <>
              <div className="collection-detail__slider">
                <button
                  type="button"
                  className="collection-detail__arrow"
                  onClick={() => moveSlide(-1)}
                >
                  &#10094;
                </button>
                <div className="collection-detail__track">
                  <img
                    className="collection-detail__img"
                    src={detailImages[detalleIndex]}
                    alt={`${seleccionado.nombre} ${detalleIndex === 0 ? "frontal" : "trasera"}`}
                    onClick={() => setIsZoomOpen(true)}/> </div>
                <button
                  type="button"
                  className="collection-detail__arrow"
                  onClick={() => moveSlide(1)}
                >
                  &#10095;
                </button>
              </div>
              <p className="collection-detail__counter">
                {detalleIndex + 1} / {detailImages.length}
              </p>
              <p className="collection-detail__year">{seleccionado.anio}</p>
              <h3>{seleccionado.nombre}</h3>
              <p>
                <strong>Pais:</strong> {seleccionado.pais}
              </p>
              <p>
                <strong>Tipo:</strong> {seleccionado.tipo}
              </p>
              <p>
                <strong>Intercambiable:</strong> {seleccionado.intercambiable ? "Si" : "No"}
              </p>
              <p>{seleccionado.descripcion}</p>

              {requestSuccess ? <p className="collection-request__success">{requestSuccess}</p> : null}
              {requestError ? <p className="collection-request__error">{requestError}</p> : null}

              <button
                type="button"
                disabled={!seleccionado.intercambiable}
                onClick={() => {
                  setShowRequestForm((prev) => !prev);
                  setRequestError("");
                  setRequestSuccess("");
                }}
              >
                Solicitar intercambio
              </button>

              {showRequestForm && seleccionado.intercambiable ? (
                <form className="collection-request" onSubmit={handleSubmitRequest}>
                  <h4>DATOS DEL SOLICITANTE</h4>
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
                    rows="3"
                    value={requester.mensaje}
                    onChange={(event) =>
                      setRequester((prev) => ({ ...prev, mensaje: event.target.value }))
                    }
                    placeholder="Detalles de tu propuesta"
                    required
                  />

                  <div className="collection-request__actions">
                    <button type="submit">Enviar solicitud</button>
                    <button type="button" onClick={() => setShowRequestForm(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}
            </>
          ) : (
            <p className="collection-empty">
              Selecciona un artículo para ver su descripción.
            </p>
          )}
        </aside>
      </div>

      {isZoomOpen && seleccionado ? (
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
                alt={`${seleccionado.nombre} ampliada`}
                style={{ transform: `scale(${zoomLevel})` }}
              /></div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Coleccion;

























