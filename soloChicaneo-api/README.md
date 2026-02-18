# soloChicaneo API

Backend para catalogo numismatico con MongoDB Atlas + Cloudinary.

## Requisitos
- Node.js 18+
- Cuenta MongoDB Atlas
- Cuenta Cloudinary

## Variables de entorno
Crea `.env` con:

PORT=4000
MONGO_URI=mongodb+srv://diazguevarajuancarlos_db_user:72CFjZGG9XNaURQL@chicaneo.qztrzet.mongodb.net/numismatica?retryWrites=true&w=majority&appName=chicaneo
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

## Ejecutar
npm install
npm run dev

Healthcheck:
GET http://localhost:4000/api/health

## Endpoints
- GET `/api/articulos`
- GET `/api/articulos/:id`
- POST `/api/articulos` (multipart/form-data)
- PUT `/api/articulos/:id` (multipart/form-data)
- DELETE `/api/articulos/:id`

## Filtros de GET /api/articulos
- `tipo=moneda|billete|exclusivo`
- `pais=Ecuador`
- `intercambiable=true|false`
- `anio=1988`
- `q=texto`

Ejemplo:
`GET /api/articulos?tipo=moneda&intercambiable=true&q=plata`

## Imagenes locales (recomendado por ahora)
Guarda las imagenes en el frontend en:
`soloChicaneo/public/catalogo/`

Y en Mongo guarda la ruta publica en `imagenLocal`, por ejemplo:
`/catalogo/20-sucres-republica.jpg`

## Subida de imagen (opcional)
Tambien puedes usar `POST /api/articulos` con `form-data`:
- `nombre` (text)
- `tipo` (text)
- `anio` (text/number)
- `pais` (text)
- `intercambiable` (text: true/false)
- `descripcion` (text)
- `imagenLocal` (text, opcional, para imagen local)
- `imagen` (file, opcional, Cloudinary)

Campos de imagen en Mongo:
- `imagenLocal` (ruta local del frontend)
- `imagenUrl` (si se sube a Cloudinary)
- `imagenPublicId` (si se sube a Cloudinary)
