// sample data types that are used in graphql queries
const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        _id: ID!
        email: String!
        name: String!
    }

    input UserInput {
        email: String!
        password: String!
        confirm: String!
    }

    type RootQuery {
        details(email: String!): User
        login(email: String!, password: String!): User
        verifyToken(token: String!): User
    }

    type RootMutation {
        createUser(userInput: UserInput): User
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`;

module.exports = typeDefs;

// var { buildSchema } = require('graphql');

// const Vschema = buildSchema(`
//     type User {
//         _id: ID!
//         email: String!
//         name: String!
//     }

//     input UserInput {
//         email: String!
//         password: String!
//         confirm: String!
//     }

//     type RootQuery {
//         details(email: String): User
//         login(email: String!, password: String!): User
//         verifyToken(token: String!): User
//     }

//     type RootMutation {
//         createUser(userInput: UserInput): User
//     }

//     schema {
//         query: RootQuery
//         mutation: RootMutation
//     }
// `)

// module.exports = Vschema