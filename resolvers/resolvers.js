const userController = require('../controllers').user;
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');

dotenv.config();
let { JWT_SECRET, PASSWORD_HASH_CYCLES } = process.env;

JWT_SECRET = JWT_SECRET || 'my-super-jwt-secret';
PASSWORD_HASH_CYCLES = PASSWORD_HASH_CYCLES || '10';

const resolvers = {
    Query: {
      exampleData: async (parent, args, context) => {
        // this if statement is our authentication check
        const { user } = context;
        if (user) {
          const dbUser = await userController.getByUsername(user.username);
          if (dbUser) {
            return [
              {key: "1", value: "Data 1"},
              {key: "2", value: "Data 2"},
              {key: "3", value: "Data 3"}
            ];
          }
        }
        throw new Error('Not Authenticated');
      }
    },
    Mutation: {
      register: async (parent, {firstname, lastname, email, username, password}) => {
        const user = await userController.getByUsername(username);
        if (!user) {
          const passwordHash = await bcrypt.hash(password, parseInt(PASSWORD_HASH_CYCLES));
          const newUser = await userController.create(username, passwordHash, firstname, lastname, email);
          if (!newUser) {
            throw new Error('Error Registering User (Technical Error)');
          }
          return { id: newUser.id, username: newUser.username };
        }
        else {
          throw new Error('Error Registering User (Username already in use)');
        }
      },

      login: async (parent, {username, password}) => {
        const user = await userController.getByUsername(username);
      
        if (!user) {
          return { valid: false };
        }
      
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
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
          JWT_SECRET,
          {
            expiresIn: '30d', // token will expire in 30days
          },
        )
        return { valid : true, token };
      }
    },
};

module.exports = {
    resolvers
}