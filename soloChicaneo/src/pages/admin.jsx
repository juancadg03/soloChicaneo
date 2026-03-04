import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

const ADMIN_USER = "admin";
const ADMIN_PASS = "holamundo";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function Admin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión activa en localStorage
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isAdminLoggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      cargarEstadisticas();
    }
  }, [isLoggedIn]);

  const cargarEstadisticas = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE}/estadisticas`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar las estadísticas");
      }
      const data = await response.json();
      setEstadisticas(data);
    } catch {
      console.error("Error loading statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const user = credentials.user.trim();
    const pass = credentials.pass.trim();

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    setError("");
    setIsLoggedIn(true);
    localStorage.setItem("adminLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    setEstadisticas(null);
  };

  return (
    <section className="admin">
      <header className="admin-header">
        <p>Panel</p>
        <h2>Administración de colección</h2>
      </header>

      {!isLoggedIn ? (
        <form className="admin-card" onSubmit={handleLogin}>
          <h3>Inicio de sesión</h3>

          <label htmlFor="admin-user">Usuario</label>
          <input
            id="admin-user"
            type="text"
            value={credentials.user}
            onChange={(event) =>
              setCredentials((prev) => ({ ...prev, user: event.target.value }))
            }
            placeholder="admin"
          />

          <label htmlFor="admin-pass">Contraseña</label>
          <input
            id="admin-pass"
            type="password"
            value={credentials.pass}
            onChange={(event) =>
              setCredentials((prev) => ({ ...prev, pass: event.target.value }))
            }
            placeholder="********"
          />

          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit">Entrar</button>
        </form>
      ) : (
        <>
          <section className="admin-card">
            <h3>Estadísticas</h3>
            {loadingStats ? (
              <p>Cargando estadísticas...</p>
            ) : estadisticas ? (
              <div className="admin-stats">
                <div className="admin-stat-item">
                  <p className="admin-stat-label">Visitas totales</p>
                  <p className="admin-stat-value">{estadisticas.totalVisitas}</p>
                </div>

                <div className="admin-stat-item">
                  <p className="admin-stat-label">Top 5 Artículos más valorados</p>
                  <ol className="admin-top-list">
                    {estadisticas.topArticulos && estadisticas.topArticulos.length > 0 ? (
                      estadisticas.topArticulos.map((articulo, index) => (
                        <li key={articulo._id} className="admin-top-item">
                          <span className="admin-top-name">{articulo.nombre}</span>
                          <span className="admin-top-likes">
                            ♥ {articulo.likes}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p>No hay artículos con likes aún</p>
                    )}
                  </ol>
                </div>
              </div>
            ) : (
              <p>Error cargando estadísticas</p>
            )}
          </section>

          <section className="admin-card">
            <h3>Opciones de administrador</h3>
            <button type="button" onClick={() => navigate("/admin/articulos")}>
              Gestionar artículos
            </button>
            <button type="button" onClick={() => navigate("/admin/intercambios")}>
              Ver solicitudes de intercambio
            </button>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </section>
        </>
      )}
    </section>
  );
}

export default Admin;
