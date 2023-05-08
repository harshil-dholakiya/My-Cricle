require('custom-env').env()
const createError = require('http-errors');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport')
const md5 = require('md5');
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const session = require('express-session')
const flash = require('connect-flash');
const userModel = require('./models/users');
const moment = require('moment')
const handlebars = require('handlebars-helpers')()
const savedPostModel = require('./models/save-post');
const postModel = require('./models/posts');
const { log } = require('handlebars/runtime');
const CronJob = require('cron').CronJob;
const statisticsModel = require('./models/statistics')
const fs = require('fs')
const nodemailer = require('nodemailer');


// fs.mkdir(path.join(__dirname, ''), (err) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log('Directory created successfully!');
// });

// fs.mkdir(path.join(__dirname, '/public/images/users'), (err) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log('Directory created successfully!');
// });

try {
  mongoose.connect(process.env.connectionString)
  console.log("Connected with mongoDb");
} catch (error) {
  console.log(error);
}

var app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    ...handlebars,
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    dateFormat: function (createdOn, format) {
      var mmnt = moment(createdOn).fromNow();
      return mmnt;
    },
    inArray: function (array, value, options) {
      array = array.map(val => {
        if (typeof val == "object") {
          val = val.toString()
        }
        return val;
      })

      if (typeof value == "object") {
        value = value.toString()
      }

      if (array.includes(value)) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    compare: function (a, operator, b, options) {
      if (typeof a === "object") {
        a = a.toString()
      }

      if (typeof b === "object") {
        b = b.toString()
      }

      if (arguments.length < 4) {
        throw new Error('handlebars Helper {{compare}} expects 4 arguments');
      }

      var result;
      switch (operator) {
        case '==':
          result = a == b;
          break;
        case '===':
          result = a === b;
          break;
        case '!=':
          result = a != b;
          break;
        case '!==':
          result = a !== b;
          break;
        case '<':
          result = a < b;
          break;
        case '>':
          result = a > b;
          break;
        case '<=':
          result = a <= b;
          break;
        case '>=':
          result = a >= b;
          break;
        case 'typeof':
          result = typeof a === b;
          break;
        default: {
          throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
        }
      }

      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }

    }
  }
});

app.use(cookieSession({
  secret: "session",
  key: "abhH4re5Uf4Rd0KnddSsdf05f3V",
}));

//express session
app.use(session({
  secret: "abhH4re5Uf4Rd0KnddS05sdff3V",
  saveUninitialized: true,
  resave: true,
  maxAge: Date.now() + 30 * 86400 * 1000,
  cookie: { secure: true }
}));

app.use(flash())
app.use(cookieParser());

require('./helpers/auth').commonMiddileware(app);

app.engine('hbs', hbs.engine)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
  res.locals.imageFormat = req.flash('imageFormat')
  res.locals.flashMessage = req.flash('error')
  res.locals.registered = req.flash('registered')
  res.locals.verify = req.flash('verify')
  next()
})

app.use(function (req, res, next) {
  if (req.xhr) {
    res.locals.layout = "blank";
  }
  next()
})

app.use('/', require('./routes/index'));


app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.userDetails = req.user
    next()
  }
  else {
    if (req.xhr) {
      res.locals.layout = "blank"
      return res.send({ type: "error" });
    }
    return res.redirect('/')
  }
})

app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

require('./cron')

module.exports = app;
