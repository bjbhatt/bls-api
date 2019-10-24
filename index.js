const { ApolloServer } = require('apollo-server');
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const { typeDefs } = require('./schema/schema.js');
const { resolvers } = require('./resolvers/resolvers.js');

dotenv.config();
let { JWT_SECRET, API_PORT } = process.env;

JWT_SECRET = JWT_SECRET || 'my-super-jwt-secret';
API_PORT = API_PORT || '4000';
 
const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, JWT_SECRET);
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

server.listen({ port: API_PORT }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});