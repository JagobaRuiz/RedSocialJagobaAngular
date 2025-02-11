const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secretKey = 'JagobaX1234';

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

// Ruta para login por username
app.post('/login_username', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM Usuarios WHERE username = ? AND password = ?';
  const params = [username, password];

  db.get(sql, params, (err, row) => {
    if (err) {
      return res.status(500).json({ "error": "Error al conectar a la base de datos" });
    }
    if (row) {
      const token = jwt.sign({ idUsuario: row.id, username: row.username }, secretKey, { expiresIn: '1h' });
      res.json({
        message: 'Login exitoso',
        token: token
      });
      // Comparar la contraseña hashada
      // bcrypt.compare(password, row.password, (err, result) => {
      //   if (result) {
      //     // Crear y firmar el token JWT
      //
      //   } else {
      //     res.status(401).json({ error: 'Contraseña incorrecta' });
      //   }
      // });
    } else {
      res.status(404).json({ error: 'Usuario o contraseña incorrectos' });
    }
  });
});

//Obtener mensajes con toda la información

app.get('/mensajes', (req, res) => {
  const mensajesQuery = `
    SELECT
      m.id, m.texto, m.fecha, m.id_respuesta,
      u.id AS usuario_id, u.nombre AS usuario_nombre, u.username AS usuario_username, u.email AS usuario_email
    FROM Mensajes m
    JOIN Usuarios u ON m.id_usuario = u.id
  `;
  db.all(mensajesQuery, [], (err, mensajes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const mensajesConRespuestas = mensajes.map(mensaje => ({
      id: mensaje.id,
      texto: mensaje.texto,
      fecha: mensaje.fecha,
      usuario: {
        id: mensaje.usuario_id,
        nombre: mensaje.usuario_nombre,
        username: mensaje.usuario_username,
        email: mensaje.usuario_email
      },
      respuestas: [],
      lesGusta: []
    }));

    const respuestasQuery = `
      SELECT
        r.id, r.texto, r.fecha, r.id_respuesta,
        ur.id AS usuario_id, ur.nombre AS usuario_nombre, ur.username AS usuario_username, ur.email AS usuario_email,
        mr.id AS respuesta_id
      FROM Mensajes r
      JOIN Usuarios ur ON r.id_usuario = ur.id
      LEFT JOIN Mensajes mr ON r.id_respuesta = mr.id
    `;
    db.all(respuestasQuery, [], (err, respuestas) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      respuestas.forEach(respuesta => {
        const mensajeIndex = mensajesConRespuestas.findIndex(m => m.id === respuesta.id_respuesta);
        if (mensajeIndex > -1) {
          mensajesConRespuestas[mensajeIndex].respuestas.push({
            id: respuesta.id,
            texto: respuesta.texto,
            fecha: respuesta.fecha,
            usuario: {
              id: respuesta.usuario_id,
              nombre: respuesta.usuario_nombre,
              username: respuesta.usuario_username,
              email: respuesta.usuario_email
            },
            respuestas: []
          });
        }
      });

      const likesQuery = `
        SELECT
          l.id_mensaje, u.id AS usuario_id, u.nombre AS usuario_nombre, u.username AS usuario_username, u.email AS usuario_email
        FROM Likes l
        JOIN Usuarios u ON l.id_usuario = u.id
      `;
      db.all(likesQuery, [], (err, likes) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        likes.forEach(like => {
          const mensajeIndex = mensajesConRespuestas.findIndex(m => m.id === like.id_mensaje);
          if (mensajeIndex > -1) {
            mensajesConRespuestas[mensajeIndex].lesGusta.push({
              id: like.usuario_id,
              nombre: like.usuario_nombre,
              username: like.usuario_username,
              email: like.usuario_email
            });
          }
        });

        res.json({ data: mensajesConRespuestas });
      });
    });
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

// Ruta para crear un Mensaje
app.post('/mensajes', (req, res) => {
  const { texto, idUsuario, idRespuesta } = req.body;
  const insertSql = `INSERT INTO Mensajes (texto, id_usuario, fecha, id_respuesta) VALUES (?, ?, CURRENT_TIMESTAMP, ?)`;
  const insertParams = [texto, idUsuario, idRespuesta || null];

  db.run(insertSql, insertParams, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const mensajeId = this.lastID;
    const selectSql = `
      SELECT
        m.id, m.texto, m.fecha, m.id_respuesta,
        u.id AS usuario_id, u.nombre AS usuario_nombre, u.username AS usuario_username, u.email AS usuario_email
      FROM Mensajes m
      JOIN Usuarios u ON m.id_usuario = u.id
      WHERE m.id = ?
    `;
    const selectParams = [mensajeId];

    db.get(selectSql, selectParams, (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const mensajeCompleto = {
        id: row.id,
        texto: row.texto,
        fecha: row.fecha,
        usuario: {
          id: row.usuario_id,
          nombre: row.usuario_nombre,
          username: row.usuario_username,
          email: row.usuario_email
        },
        respuestas: [],
        lesGusta: []
      };

      res.json(mensajeCompleto);
    });
  });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
