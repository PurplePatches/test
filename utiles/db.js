const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/socialnetwork"
);

exports.createUser = function createUser(firstname, lastname, email, password) {
    let q = `INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    let params = [firstname, lastname, email, password];
    return db.query(q, params);
};

exports.logIn = function logIn(email) {
    let q = `SELECT * FROM users WHERE email = $1`;
    let params = [email];
    return db.query(q, params);
};

exports.getUserProfile = function getUserProfile(userId) {
    let q = `SELECT firstname, lastname, image, id FROM users WHERE id = $1`;
    let params = [userId];
    return db.query(q, params);
};

exports.addImage = function addImage(image, userId) {
    let q = `UPDATE users SET image = COALESCE(NULLIF($1, ''), image) WHERE id = $2 RETURNING image`;
    let params = [image, userId];
    return db.query(q, params);
};
