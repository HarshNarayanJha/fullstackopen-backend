const express = require('express')
var morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

// logging
// eslint-disable-next-line no-unused-vars
morgan.token('body', function (req, _res) { if (req.method === 'POST') { return JSON.stringify(req.body) } })

// express app
const app = express()
app.use(express.static('dist'))

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())

app.get('/', (_request, response) => {
  response.send('<h1>Phonebook backend!</h1>')
})

app.get('/info', (_request, response) => {
  Person.collection.countDocuments().then(count => {
    response.send(`
            <p>Phonebook has info for ${count} people</p>
            <br />
            <p>${new Date().toString()}</p>
        `)
  // eslint-disable-next-line no-unused-vars
  }).catch(_error => {
    response.send(500).end()
  })
})

app.get('/api/persons', (_request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  // const exists = Person.find(p => p.name === body.name)
  // if (exists) {
  //     return response.status(400).json({
  //         error: 'name must be unique`'// const exists = Person.find(p => p.name === body.name)
  // if (exists) {
  //     return response.status(400).json({
  //         error: 'name must be unique`'
  //     })
  // }
  //     })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (result) {
        const deleted = {}
        deleted.id = result._id.toString()
        response.json(deleted)
      } else {
        response.status(204).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'ValidatorError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})