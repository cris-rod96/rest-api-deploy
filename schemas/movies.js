const z = require('zod')
const movieSchema = z.object({
  titulo: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  año: z.number().int().min(1900).max(2025),
  director: z.string(),
  genero: z.string()
})

const validateMovie = (object) => {
  return movieSchema.safeParse(object)
}

const validatePartialMovie = (input) => {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
