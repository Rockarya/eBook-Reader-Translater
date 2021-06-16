// Apollo Graphql server has been deployed but not all the APIs have been migrated.
// Infact, all the APIs still run on REST system using a middleware deployed in the server.js file

const User = require('../../models/Users');

module.exports = {
    RootQuery:{
        async details(_, { email }){
            const user = await User.findOne({email: email});
            return user
        }
    }
};