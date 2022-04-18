var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var UserRoutes = require('./routes/UserRoutes');

require('dns').lookup(require('os').hostname(), function(err, add, fam) {
    console.log('addr: ' + add);
})

var app = express();

var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://endo:pmJQfxLtUWc2l6UK@cluster0.rvmw9.mongodb.net/project2022?retryWrites=true&w=majority';
mongoose.connect(mongoDB);
mongoose.connection.on('error', err => {
    logError(err);
});

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
    secret: 'project2020as',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoDB })
}));

var indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', UserRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;