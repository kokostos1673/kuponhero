const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const bcrypt = require("bcrypt");

// BUSINESS
const MerchantSchema = new mongoose.Schema({
  username: {type: String, required: true,unique:true},
  email: {type:String, required:true, unique:true},
  password:{type:String, required:true},
  location: {type: String, required: true},
  category: {type: String, required:true}
});

MerchantSchema.plugin(URLSlugs('username'));

const Merchant = module.exports = mongoose.model('Merchant', MerchantSchema);
module.exports.createMerchant = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          newUser.password = hash;
          newUser.save(callback);
      });
  });
}

module.exports.getMerchantByMerchantName = function(username, callback){
  var query = {username: username};
  Merchant.findOne(query, callback);
}

module.exports.getMerchantById = function(id, callback){
  Merchant.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
}


