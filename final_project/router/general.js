const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// Punto de acceso interno con los datos de los libros.
// Las rutas públicas lo consultan con Axios (async/await) para practicar
// peticiones asíncronas contra el propio servidor.
public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

// Obtiene todos los libros mediante una petición Axios.
const getBooksData = async () => {
  const response = await axios.get(`${BASE_URL}/internal/books`);
  return response.data;
};

// Registrar un nuevo usuario
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Debes enviar usuario y contraseña' });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: 'El usuario ya existe' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'Usuario registrado con éxito. Ya puedes iniciar sesión' });
});

// Obtener la lista de todos los libros (async/await con Axios)
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await getBooksData();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener la lista de libros' });
  }
});

// Obtener los detalles de un libro por ISBN (async/await con Axios)
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const allBooks = await getBooksData();
    const book = allBooks[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: `No existe un libro con ISBN ${req.params.isbn}` });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar el libro por ISBN' });
  }
});

// Obtener los libros de un autor (async/await con Axios)
public_users.get('/author/:author', async (req, res) => {
  try {
    const allBooks = await getBooksData();
    const author = req.params.author.toLowerCase();

    const found = Object.keys(allBooks)
      .filter((isbn) => allBooks[isbn].author.toLowerCase() === author)
      .map((isbn) => ({ isbn, ...allBooks[isbn] }));

    if (found.length === 0) {
      return res.status(404).json({ message: `No hay libros del autor ${req.params.author}` });
    }
    return res.status(200).json(found);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar libros por autor' });
  }
});

// Obtener los libros por título (async/await con Axios)
public_users.get('/title/:title', async (req, res) => {
  try {
    const allBooks = await getBooksData();
    const title = req.params.title.toLowerCase();

    const found = Object.keys(allBooks)
      .filter((isbn) => allBooks[isbn].title.toLowerCase() === title)
      .map((isbn) => ({ isbn, ...allBooks[isbn] }));

    if (found.length === 0) {
      return res.status(404).json({ message: `No hay libros con el título ${req.params.title}` });
    }
    return res.status(200).json(found);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar libros por título' });
  }
});

// Obtener las reseñas de un libro
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const allBooks = await getBooksData();
    const book = allBooks[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: `No existe un libro con ISBN ${req.params.isbn}` });
    }
    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las reseñas' });
  }
});

module.exports.general = public_users;
