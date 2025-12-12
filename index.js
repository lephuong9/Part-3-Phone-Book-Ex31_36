const express = require('express')
const app = express()
require('dotenv').config();


const cors = require('cors')
app.use(cors())


app.use(express.static('dist'))
app.use(express.json())


const morgan = require('morgan')

const Person = require('./model/person')

/* let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",  
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
] */

app.use(morgan('tiny'))


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    console.log('persons: ', persons)
    response.json(persons)
  })
})

/* app.get('/info', (request, response) => {
  response.send(`
    <h1>Phonebook has info for ${persons.length} people</h1>
    <h1>${new Date()}</h1>
    `)
}) */

app.get('/info', (request, response) => { 
  Person.countDocuments({}).then(count => { //  find({}) is also ok just less efficient
    response.send(`
      <h1>Phonebook has info for ${count} people</h1>
      <h1>${new Date()}</h1>
    `)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

/* const generateId = () => {
  const newId = Math.floor(Math.random() * 1000000)
  return String(newId)
} */

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number is missing' 
    })
  }
  
  Person.findOne({ name: body.name })
    .then(person => {
      if (person) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        })

        return person.save().then(savedPerson => {
          response.json(savedPerson)
        })
      }
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  
  Person.findById(request.params.id)
    .then(foundPerson => {
      if (foundPerson) {
        /* foundPerson = {...foundPerson, ...person} */ // this one is only for practice with hardcoded data
        // the spread operator create a plain JavaScript object, not a Mongoose document anymore. 
        // Plain objects don't have the .save() method in Mongoose

        foundPerson.name = body.name
        foundPerson.number = body.number

        // You need to save it!
        return foundPerson.save().then(updatedPerson => { // updatedPerson is foundPerson
          response.json(updatedPerson)
        })
      } else {
        response.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
  
  /* Person.findByIdAndUpdate(request.params.id, person, { new: true })    or this is better
  .then(updatedPerson => {
    if (updatedPerson) {
      response.json(updatedPerson)
    } else {
      response.status(404).json({ error: 'person not found' })
    }
  }) */
})




app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(request.params.id)
    .then(deletedPerson => {
      if (deletedPerson) {
        response.status(204).end()
      } else { // no need for this cause delete something not existed is still fine and users dont need to know
        response.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})




const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// errorHandler at the end 
// Help not to repeat the catch in every route


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message }) 
  }

  next(error) 
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)




const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})