var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var UserRoutes = require('./routes/UserRoutes');
var TrafficRoutes = require('./routes/TrafficRoutes');
var UserNavigatorRoutes = require('./routes/UserNavigatorRoutes');

var TrafficController = require('./controllers/TrafficController');

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log(results);

var app = express();

var cors = require('cors');
var allowedOrigins = ['http://localhost:3000', 'https://localhost:3001']
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

var mongoose = require('mongoose');
var mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB);
mongoose.connection.on('error', err => {
    console.log(err);
});

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
    secret: 'project2020as',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoDB })
}));

setInterval(TrafficController.scrapper, 1000 * 5);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users/navigator', UserNavigatorRoutes);
app.use('/users', UserRoutes);
app.use('/traffic', TrafficRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ message: err.message, error: err });
});

module.exports = app;