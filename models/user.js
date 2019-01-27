const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const bcrypt = require("bcrypt");


const UserSchema = new mongoose.Schema({
  full_name: {type: String,required:true},
  username : {type: String, required:true, unique:true},
  email: {type: String, required:true, unique:true},
  password:{type:String,required:true},
  pastDeals : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deal' }]
});



UserSchema.plugin(URLSlugs('username'));
const User = module.exports = mongoose.model('User', UserSchema);
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          newUser.password = hash;
          newUser.save(callback);
      });
  });
}

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
}


// register your models

