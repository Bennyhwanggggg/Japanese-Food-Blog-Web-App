var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

//=======================
//Auth ROUTES
//=======================
//show sign up form
router.get("/register", function(req, res) {
    res.render("register");
});

//handling user sign up
router.post("/register", function(req, res) {
    req.body.username;
    req.body.password;
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.render('register');
        }
        else {
            passport.authenticate("local")(req, res, function() {
            req.flash("success","Welcome to J Food Blogger, " + user.username);
            res.redirect("/j_foods");
            });
        }
    });
});


//==============================================================
//Home page
//==============================================================

router.get("/", function(req, res) {
    res.render("landing");
});

//====================
//LOGIN ROUTES
//====================
//Render login form
router.get("/login", function(req, res) {
    res.render("login");
});

//Login logic
//middleware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/j_foods",
    failureRedirect: "/login"
}), function(req, res) {});


//====================
//LOGOUT ROUTES
//====================
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/j_foods");
});





module.exports = router;
