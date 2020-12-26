const { Console } = require('console');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const bootcampsrouter = require('./routes/bootcamps');
const corsesRouter = require('./routes/courses');
const logger = require('./middlewares/logger');
const authcontroller = require('./routes/auth');
const morgan = require('morgan');
const coonectDb = require('./config/db');
const { promises } = require('fs');
const errorHandler = require('./middlewares/error');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require("express-rate-limit");
const cors = require('cors')

dotenv.config({ path: './config/config.env' });

coonectDb();

const app = express();
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(express.json());

//app.use(logger);

// Dev Login Middlerware
if (process.env.NODE_ENV == 'devlopment') {
    app.use(morgan('dev'));
}

app.use(fileupload());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(limiter);
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
// mount router
app.use('/api/V1/bootcamps', bootcampsrouter);
app.use('/api/V1/courses', corsesRouter);
app.use('/api/V1/auth', authcontroller);

app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Server running on port ${port} 🔥 in mode ${process.env.NODE_ENV}`));

//handele undifined promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error : ${err.message}`);
    server.close(() => process.exit(1));
})