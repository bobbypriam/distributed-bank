const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user_id: Number,
  nama: String,
  ip_domisili: String,
  saldo: Number
});

module.exports = mongoose.model('User', UserSchema);
