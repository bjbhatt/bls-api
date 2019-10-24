const { gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    username: String!
  }

  type LoginResponse {
    valid: Boolean!
    token: String
  }

  type ExampleData {
    key: String!
    value: String!
  }

  type Query {
    exampleData: [ExampleData!]!
  }

  type Mutation {
    register(firstname: String!, lastname: String!, email: String! username: String!, password: String!): User!
    login(username: String!, password: String!): LoginResponse!
  }
`;

module.exports = {
  typeDefs
}