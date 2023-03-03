const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d{5,}$/.test(v)
      },
      message: (props) =>
        `${props.value} ei ole kelvollinen puhelinnumero! Puhelinnumeron tulee olla muotoa XX-XXXXXXX tai XXX-XXXXXXX`,
    },
  },
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Contact', contactSchema)
