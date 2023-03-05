const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Password missing')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://squidlider:${password}@cluster0.skv8ddh.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

const contact = new Contact({
  name: name,
  number: number,
})

if (process.argv.length === 5) {
  contact.save().then(() => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Contact.find({}).then((result) => {
    console.log('Phonebook')
    result.forEach((contact) => {
      console.log(contact.name, contact.number)
    })
    mongoose.connection.close()
  })
}
