const express = require('express')
const crypto = require('node:crypto')
const PORT = process.env.PORT ?? 1234
const server = express()

const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const ACCEPTED_ORIGINS = [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5500/movies'
]

server.disable('x-powered-by')
server.use(express.json())

server.get('/', (req, res) => {
  res.json({ message: 'Hola mundo' })
})

// Todos los recursos que sean movies se identifican con /movies
server.get('/movies', (req, res) => {
  const origin = req.header('origin')
  console.log(origin)
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { genero } = req.query
  if (genero) {
    const filteredMovies = movies.filter(
      (movie) => movie.genero.toLowerCase() === genero.toLowerCase()
    )

    if (filteredMovies.length > 0) return res.status(200).json(filteredMovies)
    return res
      .status(404)
      .json({ message: 'No se encontraron resultados coincidente' })
  }

  return res.status(200).json(movies)
})

// Recuperar una pelicula por su id
server.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieFound = movies.find((movie) => movie.id === id)
  if (movieFound) return res.status(200).json(movieFound)
  return res.status(404).json({ message: 'Movie not found' })
})

// Crear una nueva pelicula
server.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

// Actualizar información de las peliculas
server.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({
      message: 'Movie not found'
    })
  }
  const movie = movies[movieIndex]
  const updatedMovie = {
    ...movie,
    ...result.data
  }
  movies[movieIndex] = updatedMovie
  return res.json(updatedMovie)
})

// Eliminar una pelicula por su id

server.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  console.log(origin)
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie Not Found' })
  }
  movies.slice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

server.options('/movies/:id', (req, res, next) => {
  const origin = req.header('origin')
  console.log(origin)
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
  }
  next()
})

server.listen(PORT, () => {
  console.log(`Server listening in port: http://localhost:${PORT}`)
})
