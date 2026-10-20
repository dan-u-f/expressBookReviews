const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

// Usuarios registrados: [{ username, password }]
const users = [];

// Devuelve true si el nombre de usuario es válido para registrarse (no está en uso).
const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

// Devuelve true si el usuario existe y la contraseña coincide.
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Solo los usuarios registrados pueden iniciar sesión
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Debes enviar usuario y contraseña' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Usuario o contraseña inválidos' });
  }

  const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: 'Inicio de sesión exitoso', username });
});

// Agregar o modificar una reseña (la reseña va en la query: ?review=texto)
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `No existe un libro con ISBN ${isbn}` });
  }
  if (!review) {
    return res.status(400).json({ message: 'Debes enviar el texto de la reseña (?review=...)' });
  }

  const updated = books[isbn].reviews[username] !== undefined;
  books[isbn].reviews[username] = review; // una reseña por usuario y libro

  return res.status(200).json({
    message: updated
      ? `La reseña del libro con ISBN ${isbn} fue modificada`
      : `La reseña del libro con ISBN ${isbn} fue agregada`,
    reviews: books[isbn].reviews,
  });
});

// Eliminar la reseña del usuario que inició sesión
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `No existe un libro con ISBN ${isbn}` });
  }
  if (books[isbn].reviews[username] === undefined) {
    return res.status(404).json({ message: `No tienes una reseña para el libro con ISBN ${isbn}` });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `La reseña del usuario ${username} para el libro con ISBN ${isbn} fue eliminada`,
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
