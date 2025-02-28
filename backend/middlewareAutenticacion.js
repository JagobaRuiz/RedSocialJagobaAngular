const jwt = require('jsonwebtoken');
require('dotenv').config();


function validarToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
  }

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token no válido o caducado' });
    }
    req.user = user;
    next();
  });
}

module.exports = validarToken;
