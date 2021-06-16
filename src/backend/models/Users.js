// UserSchema stores the details about the admin credentials
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Please remember that the admin credentials are still to be assigned
// manually by the maintainer of the website

// Create Schema
const UserSchema = new Schema({
	// Name of the admin
	name: {
		type: String,
		required: true
	},
	// Email of the admin user which shall also act as the username of the admin 
	email: {
		type: String,
		required: true
	},
	// this is a fully encrypted and secure password
	password:{
	    type: String,
	    required: true
	}
});

// Saving the password after hashing it using bcrypt library
UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        console.log(salt)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
    } catch (error){
        next(error)
    }
})

module.exports = User = mongoose.model("Users", UserSchema);
