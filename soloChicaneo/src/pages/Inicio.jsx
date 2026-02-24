import "./inicio.css";

function Inicio({ onNavigateCollection }) {
  return (
    <main className="home">
      <section className="home-hero">
        <div className="home-hero__media" aria-hidden="true">
          <img src="/numismatica.jpg" alt="Coleccion numismatica" />
        </div>
        <article className="home-hero__copy">
          <p className="home-kicker">Catalogo personal</p>
          <h1>Mi colección numismática</h1>
          <p>
            Explora monedas y billetes clasificados por año, país y
            disponibilidad de intercambio. Un espacio para registrar piezas con
            historia y compartirlas con otros coleccionistas.
          </p>
          <button type="button" onClick={() => onNavigateCollection()}>
            Ver la coleccion
          </button>
        </article>
      </section>

      <section className="home-categories">
        <h2>Elige una seccion</h2>
        <div className="home-categories__grid">
          <button
            type="button"
            className="home-category-card"
            onClick={() =>
              onNavigateCollection({
                filtroIntercambio: "false",
              })
            }
          >
            <img className="home-category-card__img" src="/chicaneo.jpg" alt="Chicaneo" />
            <h3>Chicaneo</h3>
            <p>Piezas para mostrar y documentar.</p>
          </button>
          <button
            type="button"
            className="home-category-card"
            onClick={() =>
              onNavigateCollection({
                filtroIntercambio: "true",
              })
            }
          >
            <img
              className="home-category-card__img"
              src="/foto-grandejpg.webp"
              alt="Intercambiables"
            />
            <h3>Intercambiables</h3>
            <p>Artículos disponibles para trueque.</p>
          </button>
        </div>
      </section>

      <section className="home-discover">
        <h2>Descubre</h2>
        <div className="home-discover__grid">
          <button
            type="button"
            onClick={() =>
              onNavigateCollection({
                filtroTipo: "billete",
              })
            }
          >
            <img className="home-discover__thumb" src="/billetes.jpg" alt="Billetes" />
            <h3>Billetes</h3>
            <p>Series por decada, banco emisor y estado de conservación.</p>
          </button>
          <button
            type="button"
            onClick={() =>
              onNavigateCollection({
                filtroTipo: "moneda",
              })
            }
          >
            <img className="home-discover__thumb" src="/monedas.webp" alt="Monedas" />
            <h3>Monedas</h3>
            <p>Piezas conmemorativas y de circulación de distintas epocas.</p>
          </button>
          <button
            type="button"
            onClick={() =>
              onNavigateCollection({
                filtroTipo: "exclusivo",
              })
            }
          >
            <img className="home-discover__thumb" src="/exclusivos.jpg" alt="Exclusivos" />
            <h3>Mejor Valorados</h3>
            <p>Rarezas con baja tirada y alto valor historico.</p>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Inicio;
