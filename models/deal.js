const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const bcrypt = require("bcrypt");

// DEAL
const DealSchema = new mongoose.Schema({
  merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subject: {type: String, required:true}, 
  limit: {type : Number, required: true}, 
  location :{type:String, required:true},
  current_used: {type : Number},
  active: {type : Boolean},
  category: {type : String, required: true},
  comments: {type : String}
});

DealSchema.plugin(URLSlugs('subject category'));
const Deal = module.exports = mongoose.model('Deal', DealSchema);