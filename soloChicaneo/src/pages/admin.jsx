import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

function Admin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

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
        <section className="admin-card">
          <h3>Opciones de administrador</h3>
          <button type="button" onClick={() => navigate("/admin/articulos")}>
            Gestionar artículos
          </button>
          <button type="button" onClick={() => navigate("/admin/intercambios")}>
            Ver solicitudes de intercambio
          </button>
          <button type="button" onClick={() => setIsLoggedIn(false)}>
            Cerrar sesión
          </button>
        </section>
      )}
    </section>
  );
}

export default Admin;
