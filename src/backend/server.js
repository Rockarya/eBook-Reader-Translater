const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 4000;

// Apollo server is the main server running express's middleware
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema/index');
const resolvers = require('./graphql/resolvers/users')
const server = new ApolloServer({
    typeDefs,
    resolvers
});
server.applyMiddleware({ app });
// routes
var testAPIRouter = require("./routes/testAPI");
var UserRouter = require("./routes/Users");
var {BookRouter} = require("./routes/Books");
const session = require("express-session");
const passport = require("passport");

require('passport-strategy')(passport);
require('dotenv').config();

var allowCrossDomain = function(req, res, next) {
    // origin allowance header shall correspond to the server where frontend is hosted.
    res.header('Access-Control-Allow-Origin', "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Credentials');
    next();
};

app.use(cors({
    // origin represents the frontend
    origin: "http://localhost:3000",
    credentials: true
}));


app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    // this creates a session for the admin user with a time limit of one day
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: {
        	// Age of 1 day
            maxAge: 24*60*60,
            httpOnly: false,
            secure: false,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    // res.locals.success_msg = req.flash('success_msg');
    // res.locals.error_msg = req.flash('error_msg');
    // res.locals.error = req.flash('error');
    next();
});

// setup API endpoints
app.use(express.static('public'));
app.use("/testAPI", testAPIRouter);
app.use("/user", UserRouter);
app.use("/book", BookRouter);



// Connection to MongoDB
const db = require('./config/atlasKeys').mongoURI;

mongoose.connect(db, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once('open', function() {
    console.log("MongoDB database connection established successfully !");
});

app.listen(PORT, () => {
    console.log('express server started on port ' + PORT);
});
