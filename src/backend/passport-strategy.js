const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

//Load the model
const User = require('./models/Users');

//the strategy
module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //find the user with given email
            User.findOne({ email: email }).then(user => {
                if (!user)
                    return done(null, false, { message: 'The email you threw, we throw it back'});

                //found that email
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) return done(err);
                    if (isMatch){
                        return done(null, user);
                    }
                    else
                        return done(null, false, { message: 'Password incorrect'});
                });

            });
        })
    );

    //don't know what serializer does
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //don't know what deserializer does as well
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};