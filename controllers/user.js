const User = require('../models').User;
module.exports = {
    create(username, passwordHash, firstName, lastName, email) {
        return User
        .create({
            username,
            passwordHash,
            firstName,
            lastName,
            email
        })
        .then(user => user)
        .catch(error => null);
    },
    getByUsername(username) {
        return User
        .findOne({
            where: {
                username: username
            }
        })
        .then(user => user)
        .catch(error => null);
    }
}