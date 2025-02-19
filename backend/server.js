const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

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

// Función para obtener mensajes con sus respuestas recursivamente
const obtenerMensajes = (mensajeId, callback) => {

  const sql = `
    SELECT
      m.id AS mensaje_id,
      m.texto AS mensaje_texto,
      m.fecha AS mensaje_fecha,
      m.id_respuesta AS respuesta_de_id,
      u.id AS usuario_id,
      u.nombre AS usuario_nombre,
      u.username AS usuario_username,
      u.email AS usuario_email,
      r.id AS respuesta_mensaje_id,
      r.texto AS respuesta_mensaje_texto,
      r.fecha AS respuesta_mensaje_fecha,
      ru.id AS respuesta_usuario_id,
      ru.nombre AS respuesta_usuario_nombre,
      ru.username AS respuesta_usuario_username,
      ru.email AS respuesta_usuario_email,
      lm.id_usuario AS like_mensaje_usuario_id,
      ulm.nombre AS like_mensaje_usuario_nombre,
      ulm.username AS like_mensaje_usuario_username,
      ulm.email AS like_mensaje_usuario_email,
      lr.id_usuario AS like_respuesta_usuario_id,
      ulr.nombre AS like_respuesta_usuario_nombre,
      ulr.username AS like_respuesta_usuario_username,
      ulr.email AS like_respuesta_usuario_email
    FROM Mensajes m
    JOIN Usuarios u ON m.id_usuario = u.id
    LEFT JOIN Mensajes r ON m.id_respuesta = r.id
    LEFT JOIN Usuarios ru ON r.id_usuario = ru.id
    LEFT JOIN Likes lm ON lm.id_mensaje = m.id
    LEFT JOIN Usuarios ulm ON lm.id_usuario = ulm.id
    LEFT JOIN Likes lr ON lr.id_mensaje = r.id
    LEFT JOIN Usuarios ulr ON lr.id_usuario = ulr.id
    WHERE m.id_respuesta = ?;
  `;
  const params = [mensajeId];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return callback(err);
    }

    const mensajesMap = new Map();
    const likesMap = new Map();

    rows.forEach(row => {
      if (!mensajesMap.has(row.mensaje_id)) {
        mensajesMap.set(row.mensaje_id, {
          id: row.mensaje_id,
          texto: row.mensaje_texto,
          fecha: row.mensaje_fecha,
          usuario: {
            id: row.usuario_id,
            nombre: row.usuario_nombre,
            username: row.usuario_username,
            email: row.usuario_email
          },
          respuestaDe: row.respuesta_de_id ? {
            id: row.respuesta_mensaje_id,
            texto: row.respuesta_mensaje_texto,
            fecha: row.respuesta_mensaje_fecha,
            usuario: {
              id: row.respuesta_usuario_id,
              nombre: row.respuesta_usuario_nombre,
              username: row.respuesta_usuario_username,
              email: row.respuesta_usuario_email
            },
            respuestas: [],
            lesGusta: []
          } : null,
          respuestas: [],
          lesGusta: []
        });
      }

      if (row.like_mensaje_usuario_id) {
        if (!likesMap.has(row.mensaje_id)) {
          likesMap.set(row.mensaje_id, []);
        }
        likesMap.get(row.mensaje_id).push({
          id: row.like_mensaje_usuario_id,
          nombre: row.like_mensaje_usuario_nombre,
          username: row.like_mensaje_usuario_username,
          email: row.like_mensaje_usuario_email
        });
      }

      if (row.like_respuesta_usuario_id) {
        if (!likesMap.has(row.respuesta_mensaje_id)) {
          likesMap.set(row.respuesta_mensaje_id, []);
        }
        likesMap.get(row.respuesta_mensaje_id).push({
          id: row.like_respuesta_usuario_id,
          nombre: row.like_respuesta_usuario_nombre,
          username: row.like_respuesta_usuario_username,
          email: row.like_respuesta_usuario_email
        });
      }
    });

    const mensajes = Array.from(mensajesMap.values());

    mensajes.forEach(mensaje => {
      if (likesMap.has(mensaje.id)) {
        mensaje.lesGusta = likesMap.get(mensaje.id);
      }
      if (mensaje.respuestaDe && likesMap.has(mensaje.respuestaDe.id)) {
        mensaje.respuestaDe.lesGusta = likesMap.get(mensaje.respuestaDe.id);
      }
    });

    let count = 0;
    if (mensajes.length === 0) {
      return callback(null, mensajes);
    }

    mensajes.forEach((mensaje, index) => {
      obtenerMensajes(mensaje.id, (err, nestedRespuestas) => {
        if (err) {
          return callback(err);
        }

        mensajes[index].respuestas = nestedRespuestas;

        if (++count === mensajes.length) {
          callback(null, mensajes);
        }
      });
    });
  });
};

// Función para obtener todos los mensajes y sus respuestas recursivamente
const obtenerTodosMensajes = (callback) => {
  const sql = `
    SELECT m.id           AS mensaje_id,
           m.texto        AS mensaje_texto,
           m.fecha        AS mensaje_fecha,
           m.id_respuesta AS respuesta_de_id,
           u.id           AS usuario_id,
           u.nombre       AS usuario_nombre,
           u.username     AS usuario_username,
           u.email        AS usuario_email,
           r.id           AS respuesta_mensaje_id,
           r.texto        AS respuesta_mensaje_texto,
           r.fecha        AS respuesta_mensaje_fecha,
           ru.id          AS respuesta_usuario_id,
           ru.nombre      AS respuesta_usuario_nombre,
           ru.username    AS respuesta_usuario_username,
           ru.email       AS respuesta_usuario_email,
           lm.id_usuario  AS like_mensaje_usuario_id,
           ulm.nombre     AS like_mensaje_usuario_nombre,
           ulm.username   AS like_mensaje_usuario_username,
           ulm.email      AS like_mensaje_usuario_email,
           lr.id_usuario  AS like_respuesta_usuario_id,
           ulr.nombre     AS like_respuesta_usuario_nombre,
           ulr.username   AS like_respuesta_usuario_username,
           ulr.email      AS like_respuesta_usuario_email
    FROM Mensajes m
           JOIN Usuarios u ON m.id_usuario = u.id
           LEFT JOIN Mensajes r ON m.id_respuesta = r.id
           LEFT JOIN Usuarios ru ON r.id_usuario = ru.id
           LEFT JOIN Likes lm ON lm.id_mensaje = m.id
           LEFT JOIN Usuarios ulm ON lm.id_usuario = ulm.id
           LEFT JOIN Likes lr ON lr.id_mensaje = r.id
           LEFT JOIN Usuarios ulr ON lr.id_usuario = ulr.id ORDER BY m.fecha DESC;
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return callback(err);
    }

    const mensajesMap = new Map();
    const likesMap = new Map();

    rows.forEach(row => {
      if (!mensajesMap.has(row.mensaje_id)) {
        mensajesMap.set(row.mensaje_id, {
          id: row.mensaje_id,
          texto: row.mensaje_texto,
          fecha: row.mensaje_fecha,
          usuario: {
            id: row.usuario_id,
            nombre: row.usuario_nombre,
            username: row.usuario_username,
            email: row.usuario_email
          },
          respuestaDe: row.respuesta_de_id ? {
            id: row.respuesta_mensaje_id,
            texto: row.respuesta_mensaje_texto,
            fecha: row.respuesta_mensaje_fecha,
            usuario: {
              id: row.respuesta_usuario_id,
              nombre: row.respuesta_usuario_nombre,
              username: row.respuesta_usuario_username,
              email: row.respuesta_usuario_email
            },
            respuestas: [],
            lesGusta: []
          } : null,
          respuestas: [],
          lesGusta: []
        });
      }

      if (row.like_mensaje_usuario_id) {
        if (!likesMap.has(row.mensaje_id)) {
          likesMap.set(row.mensaje_id, []);
        }
        likesMap.get(row.mensaje_id).push({
          id: row.like_mensaje_usuario_id,
          nombre: row.like_mensaje_usuario_nombre,
          username: row.like_mensaje_usuario_username,
          email: row.like_mensaje_usuario_email
        });
      }

      if (row.like_respuesta_usuario_id) {
        if (!likesMap.has(row.respuesta_mensaje_id)) {
          likesMap.set(row.respuesta_mensaje_id, []);
        }
        likesMap.get(row.respuesta_mensaje_id).push({
          id: row.like_respuesta_usuario_id,
          nombre: row.like_respuesta_usuario_nombre,
          username: row.like_respuesta_usuario_username,
          email: row.like_respuesta_usuario_email
        });
      }
    });

    const mensajes = Array.from(mensajesMap.values());

    mensajes.forEach(mensaje => {
      if (likesMap.has(mensaje.id)) {
        mensaje.lesGusta = likesMap.get(mensaje.id);
      }
      if (mensaje.respuestaDe && likesMap.has(mensaje.respuestaDe.id)) {
        mensaje.respuestaDe.lesGusta = likesMap.get(mensaje.respuestaDe.id);
      }
    });

    let count = 0;
    if (mensajes.length === 0) {
      return callback(null, mensajes);
    }

    mensajes.forEach((mensaje, index) => {
      obtenerMensajes(mensaje.id, (err, nestedRespuestas) => {
        if (err) {
          return callback(err);
        }
        mensajes[index].respuestas = nestedRespuestas;
        if (++count === mensajes.length) {
          callback(null, mensajes);
        }
      });
    });
  });
};

// Endpoint para obtener todos los mensajes y sus respuestas
app.get('/mensajes', (req, res) => {
  obtenerTodosMensajes((err, mensajes) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'success', data: mensajes });
  });
});


// app.get('/mensajes', (req, res) => {
//   const mensajesQuery = `
//     SELECT
//       m.id, m.texto, m.fecha, m.id_respuesta,
//       u.id AS usuario_id, u.nombre AS usuario_nombre, u.username AS usuario_username, u.email AS usuario_email
//     FROM Mensajes m
//     JOIN Usuarios u ON m.id_usuario = u.id
//   `;
//   db.all(mensajesQuery, [], (err, mensajes) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//
//     const mensajesConRespuestas = mensajes.map(mensaje => ({
//       id: mensaje.id,
//       texto: mensaje.texto,
//       fecha: mensaje.fecha,
//       usuario: {
//         id: mensaje.usuario_id,
//         nombre: mensaje.usuario_nombre,
//         username: mensaje.usuario_username,
//         email: mensaje.usuario_email
//       },
//       respuestas: [],
//       lesGusta: []
//     }));
//
//     const respuestasQuery = `
//       SELECT
//         r.id, r.texto, r.fecha, r.id_respuesta,
//         ur.id AS usuario_id, ur.nombre AS usuario_nombre, ur.username AS usuario_username, ur.email AS usuario_email,
//         mr.id AS respuesta_id
//       FROM Mensajes r
//       JOIN Usuarios ur ON r.id_usuario = ur.id
//       LEFT JOIN Mensajes mr ON r.id_respuesta = mr.id
//     `;
//     db.all(respuestasQuery, [], (err, respuestas) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//
//       respuestas.forEach(respuesta => {
//         const mensajeIndex = mensajesConRespuestas.findIndex(m => m.id === respuesta.id_respuesta);
//         if (mensajeIndex > -1) {
//           mensajesConRespuestas[mensajeIndex].respuestas.push({
//             id: respuesta.id,
//             texto: respuesta.texto,
//             fecha: respuesta.fecha,
//             usuario: {
//               id: respuesta.usuario_id,
//               nombre: respuesta.usuario_nombre,
//               username: respuesta.usuario_username,
//               email: respuesta.usuario_email
//             },
//             respuestas: []
//           });
//         }
//       });
//
//       const likesQuery = `
//         SELECT
//           l.id_mensaje, u.id AS usuario_id, u.nombre AS usuario_nombre, u.username AS usuario_username, u.email AS usuario_email
//         FROM Likes l
//         JOIN Usuarios u ON l.id_usuario = u.id
//       `;
//       db.all(likesQuery, [], (err, likes) => {
//         if (err) {
//           return res.status(500).json({ error: err.message });
//         }
//
//         likes.forEach(like => {
//           const mensajeIndex = mensajesConRespuestas.findIndex(m => m.id === like.id_mensaje);
//           if (mensajeIndex > -1) {
//             mensajesConRespuestas[mensajeIndex].lesGusta.push({
//               id: like.usuario_id,
//               nombre: like.usuario_nombre,
//               username: like.usuario_username,
//               email: like.usuario_email
//             });
//           }
//         });
//
//         res.json({ data: mensajesConRespuestas });
//       });
//     });
//   });
// });

// Ruta para obtener un mensaje y sus respuestas

// const obtenerRespuestas = (mensajeId, callback) => {
//   const sql = `
//     SELECT
//       r.id AS respuesta_id,
//       r.texto AS respuesta_texto,
//       r.fecha AS respuesta_fecha,
//       ur.id AS respuesta_usuario_id,
//       ur.nombre AS respuesta_usuario_nombre,
//       ur.username AS respuesta_usuario_username,
//       ur.email AS respuesta_usuario_email,
//       m.id AS mensaje_id,
//       m.texto AS mensaje_texto,
//       m.fecha AS mensaje_fecha,
//       um.id AS mensaje_usuario_id,
//       um.nombre AS mensaje_usuario_nombre,
//       um.username AS mensaje_usuario_username,
//       um.email AS mensaje_usuario_email,
//       lr.id_usuario AS like_usuario_id,
//       ul.nombre AS like_usuario_nombre,
//       ul.username AS like_usuario_username,
//       ul.email AS like_usuario_email
//     FROM Mensajes r
//     JOIN Usuarios ur ON r.id_usuario = ur.id
//     LEFT JOIN Mensajes m ON r.id_respuesta = m.id
//     LEFT JOIN Usuarios um ON m.id_usuario = um.id
//     LEFT JOIN Likes lr ON lr.id_mensaje = r.id
//     LEFT JOIN Usuarios ul ON lr.id_usuario = ul.id
//     WHERE r.id_respuesta = ?;
//   `;
//   const params = [mensajeId];
//
//   db.all(sql, params, (err, rows) => {
//     if (err) {
//       return callback(err);
//     }
//
//     const respuestas = rows.map(row => ({
//       id: row.respuesta_id,
//       texto: row.respuesta_texto,
//       fecha: row.respuesta_fecha,
//       usuario: {
//         id: row.respuesta_usuario_id,
//         nombre: row.respuesta_usuario_nombre,
//         username: row.respuesta_usuario_username,
//         email: row.respuesta_usuario_email
//       },
//       id_respuesta: row.mensaje_id,
//       mensaje: row.mensaje_id ? {
//         id: row.mensaje_id,
//         texto: row.mensaje_texto,
//         fecha: row.mensaje_fecha,
//         usuario: {
//           id: row.mensaje_usuario_id,
//           nombre: row.mensaje_usuario_nombre,
//           username: row.mensaje_usuario_username,
//           email: row.mensaje_usuario_email
//         },
//         respuestas: [],
//         lesGusta: []
//       } : null,
//       respuestas: [],
//       lesGusta: []
//     }));
//
//     // Obtener respuestas de cada respuesta de manera recursiva
//     let count = 0;
//     if (respuestas.length === 0) {
//       return callback(null, respuestas);
//     }
//
//     respuestas.forEach((respuesta, index) => {
//       obtenerRespuestas(respuesta.id, (err, nestedRespuestas) => {
//         if (err) {
//           return callback(err);
//         }
//
//         respuestas[index].respuestas = nestedRespuestas;
//
//         if (++count === respuestas.length) {
//           callback(null, respuestas);
//         }
//       });
//     });
//   });
// };

const obtenerRespuestas = (mensajeId, callback) => {
  const sql = `
    SELECT
      r.id AS respuesta_id,
      r.texto AS respuesta_texto,
      r.fecha AS respuesta_fecha,
      ur.id AS respuesta_usuario_id,
      ur.nombre AS respuesta_usuario_nombre,
      ur.username AS respuesta_usuario_username,
      ur.email AS respuesta_usuario_email,
      m.id AS mensaje_id,
      m.texto AS mensaje_texto,
      m.fecha AS mensaje_fecha,
      um.id AS mensaje_usuario_id,
      um.nombre AS mensaje_usuario_nombre,
      um.username AS mensaje_usuario_username,
      um.email AS mensaje_usuario_email,
      lr.id_usuario AS like_respuesta_usuario_id,
      ulr.nombre AS like_respuesta_usuario_nombre,
      ulr.username AS like_respuesta_usuario_username,
      ulr.email AS like_respuesta_usuario_email,
      lm.id_usuario AS like_mensaje_usuario_id,
      ulm.nombre AS like_mensaje_usuario_nombre,
      ulm.username AS like_mensaje_usuario_username,
      ulm.email AS like_mensaje_usuario_email
    FROM Mensajes r
    JOIN Usuarios ur ON r.id_usuario = ur.id
    LEFT JOIN Mensajes m ON r.id_respuesta = m.id
    LEFT JOIN Usuarios um ON m.id_usuario = um.id
    LEFT JOIN Likes lr ON lr.id_mensaje = r.id
    LEFT JOIN Usuarios ulr ON lr.id_usuario = ulr.id
    LEFT JOIN Likes lm ON lm.id_mensaje = m.id
    LEFT JOIN Usuarios ulm ON lm.id_usuario = ulm.id
    WHERE r.id_respuesta = ? ORDER BY r.fecha DESC;
  `;
  const params = [mensajeId];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return callback(err);
    }

    const respuestaMap = new Map();
    const mensajeLikesMap = new Map();

    rows.forEach(row => {
      if (!respuestaMap.has(row.respuesta_id)) {
        respuestaMap.set(row.respuesta_id, {
          id: row.respuesta_id,
          texto: row.respuesta_texto,
          fecha: row.respuesta_fecha,
          usuario: {
            id: row.respuesta_usuario_id,
            nombre: row.respuesta_usuario_nombre,
            username: row.respuesta_usuario_username,
            email: row.respuesta_usuario_email
          },
          respuestaDe: row.mensaje_id ? {
            id: row.mensaje_id,
            texto: row.mensaje_texto,
            fecha: row.mensaje_fecha,
            usuario: {
              id: row.mensaje_usuario_id,
              nombre: row.mensaje_usuario_nombre,
              username: row.mensaje_usuario_username,
              email: row.mensaje_usuario_email
            },
            respuestas: [],
            lesGusta: []
          } : null,
          respuestas: [],
          lesGusta: []
        });
      }

      if (row.like_respuesta_usuario_id) {
        respuestaMap.get(row.respuesta_id).lesGusta.push({
          id: row.like_respuesta_usuario_id,
          nombre: row.like_respuesta_usuario_nombre,
          username: row.like_respuesta_usuario_username,
          email: row.like_respuesta_usuario_email
        });
      }

      if (row.mensaje_id && row.like_mensaje_usuario_id) {
        if (!mensajeLikesMap.has(row.mensaje_id)) {
          mensajeLikesMap.set(row.mensaje_id, []);
        }
        mensajeLikesMap.get(row.mensaje_id).push({
          id: row.like_mensaje_usuario_id,
          nombre: row.like_mensaje_usuario_nombre,
          username: row.like_mensaje_usuario_username,
          email: row.like_mensaje_usuario_email
        });
      }
    });

    const respuestas = Array.from(respuestaMap.values());

    respuestas.forEach(respuesta => {
      if (respuesta.respuestaDe && mensajeLikesMap.has(respuesta.respuestaDe.id)) {
        respuesta.respuestaDe.lesGusta = mensajeLikesMap.get(respuesta.respuestaDe.id);
      }
    });

    let count = 0;
    if (respuestas.length === 0) {
      return callback(null, respuestas);
    }

    respuestas.forEach((respuesta, index) => {
      obtenerRespuestas(respuesta.id, (err, nestedRespuestas) => {
        if (err) {
          return callback(err);
        }

        respuestas[index].respuestas = nestedRespuestas;

        if (++count === respuestas.length) {
          callback(null, respuestas);
        }
      });
    });
  });
};

app.get('/mensajes/:id/respuestas', (req, res) => {
  const mensajeId = req.params.id;
  obtenerRespuestas(mensajeId, (err, respuestas) => {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": respuestas
    });
  });
});



// app.get('/mensajes/:id/respuestas', (req, res) => {
//   const mensajeId = req.params.id;
//   const sql = `
//     SELECT
//         m1.id AS mensaje_id,
//         m1.texto AS mensaje_texto,
//         m1.fecha AS mensaje_fecha,
//         u1.nombre AS usuario_nombre,
//         r.id AS respuesta_id,
//         r.texto AS respuesta_texto,
//         r.fecha AS respuesta_fecha,
//         u2.nombre AS respuesta_usuario_nombre
//     FROM
//         Mensajes m1
//     LEFT JOIN
//         Mensajes r ON r.id_respuesta = m1.id
//     LEFT JOIN
//         Usuarios u1 ON m1.id_usuario = u1.id
//     LEFT JOIN
//         Usuarios u2 ON r.id_usuario = u2.id
//     WHERE
//         m1.id = ?
//   `;
//   const params = [mensajeId];
//   db.all(sql, params, (err, rows) => {
//     if (err) {
//       res.status(400).json({"error": err.message});
//       return;
//     }
//     res.json({
//       "message": "success",
//       "data": rows
//     });
//   });
// });

// Ruta para crear un Mensaje
app.post('/mensajes', (req, res) => {
  const { texto, idUsuario, idRespuesta } = req.body;
  const fecha = moment().tz('Europe/Madrid').format('YYYY-MM-DD HH:mm:ss');
  const insertSql = `INSERT INTO Mensajes (texto, id_usuario, fecha, id_respuesta) VALUES (?, ?, ?, ?)`;
  const insertParams = [texto, idUsuario, fecha, idRespuesta || null];

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

//Endpoint para crear like
app.post('/mensajes/darLike', (req, res) => {
  const { idUsuario, idMensaje} = req.body;
  const sql = 'INSERT INTO Likes (id_usuario, id_mensaje) VALUES (?, ?)';
  const params = [idUsuario, idMensaje];

  console.log(req.body);

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({"errorMessage": err.message, "error": err});
      return;
    }
    res.json({
      "message": "Like añadido",
      "data": {
        idUsuario,
        idMensaje
      }
    });
  });
});

//Endpoint para quitar like
app.post('/mensajes/quitarLike', (req, res) => {
  const { idUsuario, idMensaje} = req.body;
  const sql = 'DELETE FROM Likes WHERE id_usuario = ? AND id_mensaje = ?';
  const params = [idUsuario, idMensaje];

  console.log(req.body);

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({"errorMessage": err.message, "error": err});
      return;
    }
    res.json({
      "message": "Like borrado",
      "data": {
        idUsuario,
        idMensaje
      }
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
