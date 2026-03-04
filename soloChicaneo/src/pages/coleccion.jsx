import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./coleccion.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEFAULT_IMAGE = "/catalogo/default.jpg";

const resolveImageSrc = (item) =>
  item?.imagenFrenteUrl?.trim() || item?.imagenLocal?.trim() || item?.imagenUrl?.trim() || DEFAULT_IMAGE;

const resolveFaces = (item) => {
  const front = item?.imagenFrenteUrl?.trim() || item?.imagenLocal?.trim() || item?.imagenUrl?.trim() || DEFAULT_IMAGE;
  const back = item?.imagenAtrasUrl?.trim() || front;
  return { front, back };
};

function Coleccion({ searchQuery = "", preset }) {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState(searchQuery);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroAnio, setFiltroAnio] = useState("todos");
  const [filtroPais, setFiltroPais] = useState("todos");
  const [filtroIntercambio, setFiltroIntercambio] = useState("todos");
  const [catalogo, setCatalogo] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBusqueda(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (preset && (preset.filtroTipo || preset.filtroIntercambio)) {
      if (preset.filtroTipo) {
        setFiltroTipo(preset.filtroTipo);
      }
      if (preset.filtroIntercambio) {
        setFiltroIntercambio(preset.filtroIntercambio);
      }
      setFiltroAnio("todos");
      setFiltroPais("todos");
    }
  }, [preset]);

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

  useEffect(() => {
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

  const anios = useMemo(
    () => [...new Set(catalogo.map((item) => item.anio))].sort((a, b) => b - a),
    [catalogo],
  );

  const paises = useMemo(
    () => [...new Set(catalogo.map((item) => item.pais))].sort(),
    [catalogo],
  );

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
              {(() => {
                const maxLikes = Math.max(...resultados.map(item => item.likes || 0));
                return resultados.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className="collection-card"
                    onClick={() => navigate(`/articulo/${item._id}`)}
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
                    <div className="collection-card__likes-container">
                      <span className="collection-card__likes">
                        ♥ {item.likes || 0}
                      </span>
                      {item.likes === maxLikes && item.likes > 0 && (
                        <span className="collection-card__badge">Artículo de la semana</span>
                      )}
                    </div>
                  </button>
                ));
              })()}
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}

export default Coleccion;

























