const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}



const password = process.argv[2]

const name = process.argv[3]

const number = process.argv[4]

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('show all entries in phone book')
  
  Person.find({}).then(result => {
    console.log("phonebook")
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
  })
  mongoose.connection.close()
})
} else {
  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(result => {
    console.log(`added ${name} ${number} to phonebook`)  
    mongoose.connection.close()
  })
}


