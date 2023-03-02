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

app.get('/api/persons', (reuest, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/info', (req, res) => {
  const personCount = persons.length
  res.send(`
  <p>Phonebook has info for ${personCount} people</p>
  <p>${new Date()}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  const alreadyAdded = persons.find((person) => person.name === body.name)

  if (!body.number || !body.name) {
    return response.status(400).json({
      error: 'Name or number missing',
    })
  }

  if (alreadyAdded) {
    return response.status(400).json({
      error: 'name must be unique',
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.put('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)

  if (!person) {
    return response.status(404).json({
      error: 'person not found',
    })
  }

  const body = request.body
  const updatedPerson = {
    ...person,
    number: body.number,
  }

  persons = persons.map((person) => (person.id !== id ? person : updatedPerson))

  response.json(updatedPerson)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
