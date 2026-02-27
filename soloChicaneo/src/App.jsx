import { useMemo, useState } from "react";
import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Coleccion from "./pages/coleccion";
import Admin from "./pages/admin";
import Solicitudes from "./pages/solicitudes";
import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const collectionPreset = useMemo(() => {
    const preset = location.state?.collectionPreset;
    return {
      token: location.key,
      filtroTipo: preset?.filtroTipo ?? "todos",
      filtroIntercambio: preset?.filtroIntercambio ?? "todos",
    };
  }, [location.key, location.state]);

  const abrirColeccion = (preset = {}) => {
    navigate("/coleccion", { state: { collectionPreset: preset } });
  };

  const handleCatalogSearch = (event) => {
    event.preventDefault();
    navigate("/coleccion");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <p>Solo Chicaneo</p>
      </header>

      <nav className="nav-main">
        <div className="nav-main__logo">
          <img src="/logo.webp" alt="Logo Solo Chicaneo" />
        </div>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : "")}>
          Inicio
        </NavLink>
        <NavLink
          to="/coleccion"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          Coleccion
        </NavLink>
        <NavLink
          to="/sobremi"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          Sobre mi
        </NavLink>

        <form className="nav-main__search" onSubmit={handleCatalogSearch}>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar en catalogo"
          />
          <button type="submit">Buscar</button>
        </form>
      </nav>

      <div className="page-frame">
        <Routes>
          <Route path="/" element={<Inicio onNavigateCollection={abrirColeccion} />} />
          <Route
            path="/coleccion"
            element={<Coleccion searchQuery={searchValue} preset={collectionPreset} />}
          />
          <Route
            path="/sobremi"
            element={
              <section className="about">
                <h2>Sobre mi</h2>
                <p>Espacio reservado para presentar al coleccionista y su historia.</p>
              </section>
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/intercambios" element={<Solicitudes />} />
          <Route
            path="/admin/articulos"
            element={
              <section className="about">
                <h2>Gestion de articulos</h2>
                <p>Esta pagina se implementara en una siguiente fase.</p>
              </section>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
