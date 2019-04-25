const express = require("express");
const app = express();
const compression = require("compression");
const db = require("./db");
const cookieSession = require("cookie-session");
var csurf = require("csurf");

app.use(compression());

// app.use(
//     require("body-parser").urlencoded({
//         extended: false
//     })
// );
app.use(require("body-parser").json());

app.use(
    cookieSession({
        secret: `I'm always hungry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/"
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

app.post("/register", (req, res) => {
    console.log(req.body);
    hashPassword(req.body.password)
        .then(hash => {
            db.addUser(
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                hash
            )
                .then(() => {
                    res.status(200);
                    res.end();
                })
                .catch(err => {
                    res.status(500);
                    res.end("An error occured. Please try again.");
                    console.log("err in addUser: ", err);
                });
        })
        .catch(err => {
            res.status(500);
            res.end("An error occured. Please try again.");
            console.log("err in addUser: ", err);
        });
});

app.post("/login", (req, res) => {
    db.getUser(req.body.email)
        .then(results => {
            if (results.rows.length == 1) {
                checkPassword(req.body.password, results.rows[0].password)
                    .then(() => {
                        req.session.firstname = results.rows[0].firstname;
                        req.session.lastname = results.rows[0].lastname;
                        req.session.email = results.rows[0].email;
                        req.session.userId = results.rows[0].id;

                        console.log("finishing login", req.session);
                        res.status(200);
                        res.end();
                    })
                    .catch(() => {
                        res.status(401);
                        res.end("Invalid email or password. Please try again.");
                    });
            } else {
                res.status(401);
                res.end("Invalid email or password. Please try again.");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500);
            res.end("An error occured. Please try again.");
        });
});

var bcrypt = require("bcryptjs");

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}
function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}
app.get("*", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

module.exports = app;
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log("I'm listening."));
}
