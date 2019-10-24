'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const dotenv = require("dotenv");
const db = {};

dotenv.config();
let { DB_CONNECTION_STRING, DB_CONSOLE_LOGGING } = process.env;

DB_CONNECTION_STRING = DB_CONNECTION_STRING || 'mysql://user:pass@localhost:3306/bls';
DB_CONSOLE_LOGGING = DB_CONSOLE_LOGGING || 'false';

let sequelize = new Sequelize(DB_CONNECTION_STRING, { logging: DB_CONSOLE_LOGGING.toLowerCase() === 'true' });

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
