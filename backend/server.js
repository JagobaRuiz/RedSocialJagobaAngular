const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('../bdd.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Rutas para Usuarios
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT * FROM Usuarios';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        username: row.username,
        email: row.email,
        password: row.password // Evita enviar la contraseña en respuestas JSON en producción
      }))
    });
  });
});

app.get('/usuarios/:id', (req, res) => {
  const sql = 'SELECT * FROM Usuarios WHERE id = ?';
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    if (row) {
      res.json({
        "message": "success",
        "data": {
          id: row.id,
          nombre: row.nombre,
          username: row.username,
          email: row.email,
          password: row.password // Evita enviar la contraseña en respuestas JSON en producción
        }
      });
    } else {
      res.status(404).json({"error": "User not found"});
    }
  });
});


// Ruta para Crear un Usuario
app.post('/usuarios', (req, res) => {
  const { nombre, username, email, password } = req.body;
  const sql = 'INSERT INTO Usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)';
  const params = [nombre, username, email, password];

  console.log(req.body);

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({"errorMessage": err.message, "error": err});
      return;
    }
    res.json({
      "message": "success",
      "data": {
        id: this.lastID,
        nombre,
        username,
        email,
        password // Evita enviar la contraseña en respuestas JSON en producción
      }
    });
  });
});

// Rutas para Mensajes
app.get('/mensajes', (req, res) => {
  const sql = 'SELECT * FROM Mensajes';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows.map(row => ({
        id: row.id,
        texto: row.texto,
        id_usuario: row.id_usuario,
        fecha: row.fecha,
        id_respuesta: row.id_respuesta
      }))
    });
  });
});

app.get('/mensajes/:id', (req, res) => {
  const sql = 'SELECT * FROM Mensajes WHERE id = ?';
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    if (row) {
      res.json({
        "message": "success",
        "data": {
          id: row.id,
          texto: row.texto,
          id_usuario: row.id_usuario,
          fecha: row.fecha,
          id_respuesta: row.id_respuesta
        }
      });
    } else {
      res.status(404).json({"error": "Message not found"});
    }
  });
});

// Ruta para obtener un mensaje y sus respuestas
app.get('/mensajes/:id/respuestas', (req, res) => {
  const mensajeId = req.params.id;
  const sql = `
    SELECT
        m1.id AS mensaje_id,
        m1.texto AS mensaje_texto,
        m1.fecha AS mensaje_fecha,
        u1.nombre AS usuario_nombre,
        r.id AS respuesta_id,
        r.texto AS respuesta_texto,
        r.fecha AS respuesta_fecha,
        u2.nombre AS respuesta_usuario_nombre
    FROM
        Mensajes m1
    LEFT JOIN
        Mensajes r ON r.id_respuesta = m1.id
    LEFT JOIN
        Usuarios u1 ON m1.id_usuario = u1.id
    LEFT JOIN
        Usuarios u2 ON r.id_usuario = u2.id
    WHERE
        m1.id = ?
  `;
  const params = [mensajeId];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
