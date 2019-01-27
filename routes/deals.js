const express = require('express');
const router = express.Router();

const Deal = require('../models/deal');
const User = require('../models/user');
const Merchant= require('../models/merchant');

router.get('/add', function (req, res) {
  if(req.session.user){
    res.render('add');
  }
  else {
    res.redirect('/merchants/login');
  }
  
});

router.post('/add', function (req, res) {
  const subject=req.body.subject;
  const limit=req.body.limit;
  const category=req.body.category;
  const comments=req.body.comments;
  const newDeal = new Deal({
        merchant_id:req.session.user._id,
        subject:subject,
        limit:limit,
        current_used:0,
        active: true,
        location:req.session.user.location,
        category:category,
        comments:comments,
    });
    newDeal.save(function(err, result, count) {
    res.redirect("/");
  });
});

router.get('/:slug', (req,res) =>{
  Deal.findOne({slug: req.params.slug}, (err, deal, count) => {
    if(deal){
      let participants=[];
      let merchantName='';
      deal.participants.forEach(function(userId){
        User.findOne({_id:userId},(err,user,count)=>{
          if(user){
            participants.push(user.username);
          }
        })
      })
      Merchant.findOne({_id:deal.merchant_id},(err, merchant,count)=>{
        if(merchant){
          merchantName=merchant.username;
        }
      })
      setTimeout(function(){ res.render('deal_detail',{deal:deal,participants:participants,merchant:merchantName});}, 500);
    }
    else {res.redirect('/');}
  }); 
});

module.exports = router;

