const mongoose = require("mongoose");

const UserDetailsScehma = new mongoose.Schema({
  uname: String,
  email: String,
  password: String,
},{
    collection:"UserInfo",
});

const UserInfo = mongoose.model("UserInfo", UserDetailsScehma);

module.exports = UserInfo