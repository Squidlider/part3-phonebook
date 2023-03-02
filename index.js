const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()

const Person = require('./models/contact')

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static('build'))

morgan.token('custom', (req) => {
  return 'POST' === req.method ? JSON.stringify(req.body) : ' '
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :custom'
  )
)

let persons = []

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/info', (req, response) => {
  Person.find({}).then((persons) => {
    const personCount = persons.length
    response.send(`
      <p>Phonebook has info for ${personCount} people</p>
      <p>${new Date()}</p>
    `)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      response.json(person)
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // const alreadyAdded = persons.find((person) => person.name === body.name)

  if (!body.number || !body.name) {
    return response.status(400).json({
      error: 'Name or number missing',
    })
  }

  // if (alreadyAdded) {
  //   return response.status(400).json({
  //     error: 'name must be unique',
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.number || !body.name) {
    return response.status(400).json({
      error: 'Name or number missing',
    })
  }

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
