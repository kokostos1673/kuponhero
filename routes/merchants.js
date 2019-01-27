const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Merchant = require('../models/merchant');
const Deal = require('../models/deal');

router.get('/register', function (req, res) {
  res.render('register_merchant');
});

router.post('/register', function (req, res) {
  const username=req.body.username;
  const email=req.body.email;
  const location =req.body.location;
  const category=req.body.category;
  const password=req.body.password;
  req.checkBody('email').isEmail();
  const invalidEmail = req.validationErrors();
  if (invalidEmail) {
    res.render('register_merchant', {
      invalidEmail: invalidEmail
    });
  }
  else{
    Merchant.findOne({ username: { "$regex": "^" + username + "\\b", "$options": "i"}}, 
      function (err, user) {
        Merchant.findOne({ email: { "$regex": "^" + email + "\\b", "$options": "i" }}, 
          function (err, mail) {
            if (user || mail) {
              res.render('register_merchant', {
                user: user,
                mail: mail
              });
            }
            else {
              const newMerchant = new Merchant({
                username: username,
                location:location,
                category:category,
                email: email,
                password: password
              });
              Merchant.createMerchant(newMerchant, function (err, user) {
                if (err) throw err;
              });
              res.redirect('/merchants/login');
            }
          });
        });
  }
});


router.get('/login', function (req, res) {
  res.render('login_merchant');
});

passport.use('local-merchant',new LocalStrategy(
  function (username, password, done) {
    Merchant.getMerchantByMerchantName(username, function (err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false);
      }

      Merchant.comparePassword(password, user.password, function (err, isMatch) {
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
  Merchant.getMerchantById(id, function (err, user) {
    done(err, user);
  });
});



router.post('/login', function(req, res, next) {
  passport.authenticate('local-merchant', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('login_merchant',{error:"username or passwoord error"}); }
    req.session.regenerate((err) => {
      if (!err) {
        req.session.user= user;
        res.redirect('/')
    } 
});
  })(req, res, next);
});

router.get('/profile',(req, res)=>{
  if(req.session.user){
    Deal.find({merchant_id: req.session.user._id}, (err, deals, count) => {
      if(deals){
        res.render('profile_merchant', {deals:deals});
      }
      else{
        res.render('profile_merchant');
      }
    }); 
  }
  else {
    res.redirect('/merchants/login');
  }
  
});

router.get('/deals/:slug',(req,res)=>{
  if(req.session.user){
    Deal.findOne({slug: req.params.slug}, (err, deal, count) => {
      if(deal){
        res.render('deal_edit', {deal:deal});
      }
      else{
        res.redirect('*');
      }
    }); 
  }
  else {
    res.redirect('/merchants/login');
  }
});

router.post('/deals/:slug',(req,res)=>{
  const newSubject=req.body.subject;
  const newLimit=req.body.limit;
  const newCategory=req.body.category;
  const newComments=req.body.comments;
  Deal.updateOne({slug: req.params.slug}, {subject : newSubject, limit : newLimit, category: newCategory, comments: newComments}, (err,done,count)=>{
    if(done){
      res.redirect('/merchants/profile');
    }
  });
});


router.get('/deals/delete/:slug',(req,res)=>{
  if(req.session.user){
    Deal.deleteOne({slug:req.params.slug},(err,done,count)=>{
      if(done){
        res.redirect('/merchants/profile');
      }
    });
  }
  else {
    res.redirect('/merchants/login');
  }
});

router.get('/logout', function (req, res) {
  if(req.session.user){
    req.session.user=null;
  }
  res.redirect('/');
});

module.exports = router;