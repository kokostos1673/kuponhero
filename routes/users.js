const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');
const Deal = require('../models/deal');

// user Register
router.get('/register', function (req, res) {
  res.render('register_user');
});

router.post('/register', function (req, res) {
  const full_name=req.body.full_name;
  const username=req.body.username;
  const email=req.body.email;
  const password=req.body.password;

  req.checkBody('email').isEmail();
  const invalidEmail = req.validationErrors();
  if (invalidEmail) {
    res.render('register_user', {
      invalidEmail: invalidEmail
    });
  }
  else{
    User.findOne({ username: { "$regex": "^" + username + "\\b", "$options": "i"}}, 
      function (err, user) {
        User.findOne({ email: { "$regex": "^" + email + "\\b", "$options": "i" }}, 
          function (err, mail) {
            if (user || mail) {
              res.render('register_user', {
                user: user,
                mail: mail
              });
            }
            else {
              const newUser = new User({
                full_name: full_name,
                username:username,
                email: email,
                password: password
              });
              User.createUser(newUser, function (err, user) {
                if (err) throw err;
              });
              res.redirect('/users/login');
            }
          });
        });
  }
});

//login user 
router.get('/login', function (req, res) {
  res.render('login_user');
});

passport.use('user-local',new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false);
      }

      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });
  }));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});


router.post('/login', function(req, res, next) {
  passport.authenticate('user-local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('login_user',{error:'error'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/profile',(req, res)=>{
  if(req.user){
    User.findOne({username: req.user.username}, (err, user, count) => {
      if(user){
        let user_deals=[];
        user.pastDeals.forEach(function(user){Deal.findOne({_id: user._id}, (err, deal, count) => {
            if(deal){
              user_deals.push(deal);
            }
          });});
        setTimeout(function(){ res.render('profile_user',{deals:user_deals});}, 500);
      }
      else{
        res.redirect('/users/login');
      }
    });
  }
  else{
    res.redirect('/users/login');
  }
  
});
router.post('/profile/:slug',(req, res)=>{
  Deal.findOne({slug: req.params.slug}, (err, deal, count) => {
    if(deal){
      if(deal.participants.indexOf(req.user._id)!==-1){
        res.render('deal_detail',{deal:deal, errMessage:'deal already taken by user'});
      }
      else{
        Deal.findOneAndUpdate({_id: deal._id}, {$push: {participants: req.user._id}},(err,done,count)=>{
          if(done){
            console.log('Updated deal ', deal._id);
          }
        });
        Deal.findOneAndUpdate({_id: deal._id}, {$inc: { current_used: 1}}, (err,done,count)=>{
          if(done){
            console.log('Updated deal ', deal._id);
          }
        });
        if((deal.current_used+1)<=deal.limit){
          User.findOne({username: req.user.username}, (err, user, count) => {
            if(user){
              User.findOneAndUpdate({username: req.user.username}, {$push: {pastDeals: deal._id}}, (err,done,count)=>{
                if(done){
                  console.log('Updated user ', req.user._id);
                }
              });
              res.redirect('/users/profile');
            }
          }); 
        }
        else{
          Deal.findOneAndUpdate({_id:deal._id},{$set:{active:false}},(err,done,count)=>{
            if(done){
              res.render('deal_detail',{deal:deal, dealLimit:'deal limit reached'});
            }
          });
        }
        
      }
    }
  }); 
});
router.get('/logout', function (req, res) {
  if(req.user){
    req.logout();
  }
  res.redirect('/');
});
module.exports = router;

