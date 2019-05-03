const express = require("express");
const app = express();
const compression = require("compression");
const db = require("./utils/db");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const csurf = require("csurf");
const bc = require("./utils/bcrypt");
const uidSafe = require("uid-safe");
const multer = require("multer");
const path = require("path");
const config = require("./config.json");
const s3 = require("./s3");

app.use(compression());
app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: "It's social network time!",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 14
    })
);
app.use(bodyParser.json());
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

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.get("/welcome", (req, res) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.post("/registration", (req, res) => {
    bc.hashPassword(req.body.password).then(hash => {
        console.log("show me req.body: ", req.body);
        return db
            .register(
                // req.body.id,
                req.body.first_name,
                req.body.last_name,
                req.body.email,
                hash
            )
            .then(data => {
                req.session.userId = data.rows[0].id;
                res.json({
                    success: true
                });
                console.log(req.session.userId);
            })
            .catch(err => {
                res.json({ success: false });
                console.log("Please try again", err);
            });
    });
});

app.post("/login", (req, res) => {
    db.login(req.body.email).then(user => {
        if (user.rows.length === 1) {
            bc.checkPassword(req.body.password, user.rows[0].password)
                .then(isAuthorized => {
                    req.session.userId = user.rows[0].id;
                    req.session.firstName = user.rows[0].first_name;
                    req.session.lastName = user.rows[0].last_name;
                    req.session.image = user.rows[0].image;
                    req.session.bio = user.rows[0].bio;
                    if (isAuthorized == true) {
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            err: true
                        });
                    }
                })
                .catch(err => {
                    req.session.userId = null;
                    res.json({
                        err: true
                    });
                    console.log("err, reason", err);
                });
        } else {
            res.json({
                err: "Invalid email"
            });
        }
    });
});

app.get("/api/user", (req, res) => {
    // console.log("POST/user session: ", req.body);
    db.getUserInfo(req.session.userId).then(results => {
        if (results) {
            console.log("results", results);
            res.json(results.rows[0]);
        } else {
            res.json({ success: false });
        }
    });
});

app.post("/api/upload", uploader.single("file"), s3.upload, (req, res) => {
    const image = config.s3Url + req.file.filename;
    db.uploadImage(image, req.session.userId)
        .then(results => {
            if (results.rowCount == 1) {
                res.json({
                    success: true,
                    url: image
                });
            } else {
                res.json({ success: false });
            }
        })
        .catch(err => {
            console.log("error in server upload", err);
        });
});

app.post("/api/bio", (req, res) => {
    const bio = req.body.bio;
    console.log("show me req.body: ", req.session, req.body);
    db.uploadBio(bio, req.session.userId)
        .then(results => {
            if (results.rowCount == 1) {
                res.json({
                    success: true,
                    bio: bio
                });
            } else {
                res.json({ err: true });
            }
        })
        .catch(err => {
            console.log("error in server upload", err);
        });
});

app.get("/api/logout", (req, res) => {
    req.session = null;
    res.redirect("/welcome");
});

app.get("/", (req, res) => {
    if (req.session.userId) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.redirect("/welcome");
    }
});

app.get("*", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.redirect("/");
    }
});

app.listen(process.env.PORT || 8080, () => console.log("I'm listening"));
