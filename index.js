const { ApolloServer, gql } = require('apollo-server');
const dotenv = require("dotenv");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const DEFAULT_JWT_SECRET = 'my-super-jwt-secret';
const DEFAULT_API_PORT = '4000';

const { JWT_SECRET, API_PORT } = process.env;

const users = [];

const createUser = async (firstname, lastname, email, username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return users.push({
    firstname,
    lastname,
    email,
    username,
    hashedPassword
  });
}

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

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      exampleData: (parent, args, context) => {
        // this if statement is our authentication check
        const { user } = context;
        if (!user) {
          throw new Error('Not Authenticated')
        }
        return [
          {key: "1", value: "Data 1"},
          {key: "2", value: "Data 2"},
          {key: "3", value: "Data 3"}
        ]
      },
    },
    Mutation: {
      register: async (parent, {firstname, lastname, email, username, password}) => {
        const userId = await createUser(firstname, lastname, email, username, password);
        return { id: userId, username: users[userId-1].username };
      },
      login: async (parent, {username, password}) => {
        const user = users.find(u => u.username == username);
      
        if (!user) {
          return { valid: false };
        }
      
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    
        if (!passwordMatch) {
          return { valid: false };
        }

        const token = jwt.sign(
          {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            roles: ['admin', 'power-user'],
          },
          JWT_SECRET || DEFAULT_JWT_SECRET,
          {
            expiresIn: '30d', // token will expire in 30days
          },
        )
        return { valid : true, token };
      }
    },
};
 
const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, JWT_SECRET || DEFAULT_JWT_SECRET);
    }
    return null;
  } catch (err) {
    return null;
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer ? tokenWithBearer.split(' ')[1] : '';
    const user = getUser(token);

    return { user };
  },
})

server.listen({ port: API_PORT || DEFAULT_API_PORT}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});