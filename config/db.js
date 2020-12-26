const mongoose = require('mongoose');

const coonectDb = async() => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });
    console.log(`mongo connected : ${conn.connection.host}`);
}

module.exports = coonectDb;