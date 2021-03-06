require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


app.use(cors())

morgan.token('type', function (req)
{
  if(req.method==='POST') {
    const obby = { name: req.body.name,
      number: req.body.number }
    return  JSON.stringify(obby)
  }
  return ' '
}
)

app.use(express.static('build'))
app.use(morgan('tiny'))
app.use(morgan(':type'))
app.use(bodyParser.json())


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(people => {
      res.json(people.map(person => person.toJSON()))
      people.map(person => console.log(person))
    })
    .catch(error => next(error))
})

app.get('/info', (req, response, next) => {
  const date = new Date()
  Person.find({})
    .then(people => {
      response.send(`<p>This phonebook has info for ${people.length} people </p>
                     <p>${date}</p>`)
      console.log(people.length)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndUpdate(request.params.id, { number: request.body.number }, { new: true })
    .then(result => {
      console.log(result)
      response.json(result.toJSON())
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {

  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })

  person.save()
    .then(savedPerson => {
      console.log('person saved response okpokpokkf')
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error)
    )

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})