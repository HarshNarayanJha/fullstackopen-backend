const express = require("express")
var morgan = require("morgan")
const cors = require('cors')

const Person = require("./models/person")

// logging
morgan.token('body', function (req, res) { if (req.method === 'POST') { return JSON.stringify(req.body) } })

// express app
const app = express()
app.use(express.static('dist'))

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())

app.get('/', (request, response) => {
    response.send('<h1>Phonebook backend!</h1>')
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${Person.length} people</p>
        <br />
        <p>${new Date().toString()}</p>
    `)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    // const exists = Person.find(p => p.name === body.name)
    // if (exists) {
    //     return response.status(400).json({
    //         error: 'name must be unique`'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})