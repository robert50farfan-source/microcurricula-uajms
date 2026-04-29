'use strict';

module.exports = function adminAuth(req, res, next) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(503).json({ error: 'Módulo de administración no configurado (ADMIN_PASSWORD no definido en .env).' });
  }
  const provided = req.headers['x-admin-password'];
  if (!provided || provided !== password) {
    return res.status(401).json({ error: 'Contraseña de administrador incorrecta.' });
  }
  next();
};
