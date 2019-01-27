const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const config = require('./config/database');

const Deal = require('./models/deal');

mongoose.connect(config.database, { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
  console.log('Connected to Database '+config.database);
});

mongoose.connection.on('error', (err) => {
  console.log('Database error '+err);
});

const users = require('./routes/users');
const merchants = require('./routes/merchants');
const deals= require('./routes/deals');


app.set('view engine', 'hbs');
const staticPath = path.resolve(__dirname, 'public');
app.use(express.static(staticPath));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// session setup
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// passport.js init
app.use(passport.initialize());
app.use(passport.session());

// exp validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.use(function (req, res, next) {
  res.locals.user = req.user || req.session.user;
  next();
});

app.get('/', function(req, res){
  Deal.find({active:true},function(err, result,count) {
    res.render('index',{deals:result});
  });
});

app.post('/', function(req, res){
  if(req.body.category==='All Deals'){
    Deal.find({active:true},function(err, result,count) {
      res.render('index',{deals:result});
    });
  }
  else{
    Deal.find({category:req.body.category, active:true}, function(err, result,count) {
      res.render('index',{deals:result});
    });
  }
});

app.use('/users', users);
app.use('/merchants',merchants);
app.use('/deals',deals);

app.get('*', function(req, res){
  res.render('not_found');
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
