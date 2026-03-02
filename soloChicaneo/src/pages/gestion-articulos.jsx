import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./gestion-articulos.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const initialFormData = {
  nombre: "",
  tipo: "moneda",
  anio: new Date().getFullYear(),
  pais: "",
  descripcion: "",
  intercambiable: false,
};

function GestionArticulos() {
  const navigate = useNavigate();
  const [articulos, setArticulos] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [imagenFrente, setImagenFrente] = useState(null);
  const [imagenAtras, setImagenAtras] = useState(null);
  const [imagenFrenteActual, setImagenFrenteActual] = useState(null);
  const [imagenAtrasActual, setImagenAtrasActual] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    // Verificar si hay sesión activa
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    
    cargarArticulos();
  }, [navigate]);

  const cargarArticulos = async () => {
    try {
      const response = await fetch(`${API_BASE}/articulos`);
      if (!response.ok) throw new Error("No se pudo cargar");
      const data = await response.json();
      setArticulos(data);
    } catch {
      setError("No se pudo cargar los artículos.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleImagenFrenteChange = (e) => {
    setImagenFrente(e.target.files[0] || null);
  };

  const handleImagenAtrasChange = (e) => {
    setImagenAtras(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setExito("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("tipo", formData.tipo);
      formDataToSend.append("anio", formData.anio);
      formDataToSend.append("pais", formData.pais);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("intercambiable", formData.intercambiable);

      if (imagenFrente) {
        formDataToSend.append("imagenFrente", imagenFrente);
      }

      if (imagenAtras) {
        formDataToSend.append("imagenAtras", imagenAtras);
      }

      const url = editandoId
        ? `${API_BASE}/articulos/${editandoId}`
        : `${API_BASE}/articulos`;
      const method = editandoId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el artículo");
      }

      setExito(editandoId ? "Artículo actualizado" : "Artículo creado");
      setFormData(initialFormData);
      setImagenFrente(null);
      setImagenAtras(null);
      setImagenFrenteActual(null);
      setImagenAtrasActual(null);
      setEditandoId(null);
      cargarArticulos();

      setTimeout(() => setExito(""), 3000);
    } catch {
      setError("Error al guardar el artículo.");
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (articulo) => {
    setFormData({
      nombre: articulo.nombre,
      tipo: articulo.tipo,
      anio: articulo.anio,
      pais: articulo.pais,
      descripcion: articulo.descripcion,
      intercambiable: articulo.intercambiable,
    });
    setImagenFrenteActual(articulo.imagenFrenteUrl || null);
    setImagenAtrasActual(articulo.imagenAtrasUrl || null);
    setEditandoId(articulo._id);
    setImagenFrente(null);
    setImagenAtras(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelarEdicion = () => {
    setFormData(initialFormData);
    setEditandoId(null);
    setImagenFrente(null);
    setImagenAtras(null);
    setImagenFrenteActual(null);
    setImagenAtrasActual(null);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/articulos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar");
      }

      setExito("Artículo eliminado");
      cargarArticulos();
      setTimeout(() => setExito(""), 3000);
    } catch {
      setError("Error al eliminar el artículo.");
    }
  };

  return (
    <section className="gestion-articulos">
      <header className="gestion-articulos__head">
        <div className="gestion-articulos__head-content">
          <div>
            <p>Panel</p>
            <h2>Gestión de artículos</h2>
          </div>
          <button
            type="button"
            className="gestion-articulos__btn-volver"
            onClick={() => navigate("/admin")}
          >
            ← Volver al panel
          </button>
        </div>
      </header>

      <div className="gestion-articulos__container">
        <form className="gestion-articulos__form" onSubmit={handleSubmit}>
          <h3>{editandoId ? "Editar artículo" : "Crear nuevo artículo"}</h3>

          {error && <p className="gestion-articulos__error">{error}</p>}
          {exito && <p className="gestion-articulos__success">{exito}</p>}

          <label htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: 20 sucres República"
            required
          />

          <label htmlFor="tipo">Tipo *</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            required
          >
            <option value="moneda">Moneda</option>
            <option value="billete">Billete</option>
            <option value="exclusivo">Exclusivo</option>
          </select>

          <label htmlFor="anio">Año *</label>
          <input
            id="anio"
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleInputChange}
            min="1800"
            max={new Date().getFullYear()}
            required
          />

          <label htmlFor="pais">País *</label>
          <input
            id="pais"
            type="text"
            name="pais"
            value={formData.pais}
            onChange={handleInputChange}
            placeholder="Ej: Ecuador"
            required
          />

          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción del artículo..."
            rows="4"
            required
          />

          <label htmlFor="imagenFrente">Imagen del frente {editandoId ? "(opcional)" : "*"}</label>
          <input
            id="imagenFrente"
            type="file"
            name="imagenFrente"
            onChange={handleImagenFrenteChange}
            accept="image/*"
            required={!editandoId}
          />
          {imagenFrenteActual && editandoId && !imagenFrente && (
            <div className="gestion-articulos__imagen-actual">
              <p className="gestion-articulos__texto-imagen">Imagen del frente actual:</p>
              <img src={imagenFrenteActual} alt="Imagen del frente actual" />
            </div>
          )}

          <label htmlFor="imagenAtras">Imagen de atrás {editandoId ? "(opcional)" : "(opcional)"}</label>
          <input
            id="imagenAtras"
            type="file"
            name="imagenAtras"
            onChange={handleImagenAtrasChange}
            accept="image/*"
          />
          {imagenAtrasActual && editandoId && !imagenAtras && (
            <div className="gestion-articulos__imagen-actual">
              <p className="gestion-articulos__texto-imagen">Imagen de atrás actual:</p>
              <img src={imagenAtrasActual} alt="Imagen de atrás actual" />
            </div>
          )}

          <label htmlFor="intercambiable" className="gestion-articulos__checkbox-label">
            <input
              id="intercambiable"
              type="checkbox"
              name="intercambiable"
              checked={formData.intercambiable}
              onChange={handleInputChange}
            />
            <span>Disponible para intercambiar</span>
          </label>

          <div className="gestion-articulos__form-actions">
            <button type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : editandoId ? "Actualizar" : "Crear artículo"}
            </button>
            {editandoId && (
              <button type="button" onClick={handleCancelarEdicion} className="secundario">
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        <div className="gestion-articulos__lista">
          <h3>Artículos en la colección ({articulos.length})</h3>

          {articulos.length === 0 ? (
            <p className="gestion-articulos__empty">
              No hay artículos aún. Crea uno para comenzar.
            </p>
          ) : (
            <div className="gestion-articulos__grid">
              {articulos.map((articulo) => (
                <article key={articulo._id} className="articulo-card">
                  {articulo.imagenFrenteUrl ? (
                    <img
                      src={articulo.imagenFrenteUrl}
                      alt={articulo.nombre}
                      className="articulo-card__imagen"
                    />
                  ) : (
                    <div className="articulo-card__imagen-empty">Sin imagen</div>
                  )}

                  <div className="articulo-card__info">
                    <h4>{articulo.nombre}</h4>
                    <p>
                      <strong>Tipo:</strong> {articulo.tipo}
                    </p>
                    <p>
                      <strong>Año:</strong> {articulo.anio}
                    </p>
                    <p>
                      <strong>País:</strong> {articulo.pais}
                    </p>
                    <p className="articulo-card__descripcion">
                      <strong>Descripción:</strong> {articulo.descripcion}
                    </p>
                    <p>
                      <strong>Intercambiable:</strong>{" "}
                      {articulo.intercambiable ? "Sí" : "No"}
                    </p>
                  </div>

                  <div className="articulo-card__acciones">
                    <button
                      type="button"
                      onClick={() => handleEditar(articulo)}
                      className="btn-editar"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(articulo._id)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default GestionArticulos;
