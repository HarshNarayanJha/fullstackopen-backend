const mongoose = require("mongoose")

if (process.argv.length < 3) {
    console.log("Error: password required")
    console.log("Usage:\n\tTo list all added persons: node mongo.js <password>");
    console.log("\tTo add a new person: node mongo.js <password> <name> number");
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://mario:${password}@phonebook-backend.64aowfq.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Phonebook-Backend`

mongoose.set('strictQuery', false);

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
    // list mode
    console.log("phonebook:");

    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number);
        })
    
        mongoose.connection.close()
        process.exit(0)
    })

} else if (process.argv.length == 5) {
    // add mode

    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name,
        number
    })

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
        process.exit(0)
    })

} else {
    console.log("Error: Unknown number of agruments! Run without arguments to see usage info!");
    process.exit(0)
}