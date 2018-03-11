var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var j_food = require("../models/j_food");

//=======================
//Auth ROUTES
//=======================
//show sign up form
router.get("/register", function(req, res) {
    res.render("register");
});

//handling user sign up
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            avatar: req.body.avatar
                        });
    if(req.body.adminCode === "TWICESANATZYU415"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/register');
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
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {});


//====================
//LOGOUT ROUTES
//====================
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged Out!");
    res.redirect("/j_foods");
});

//====================
//User Profile
//====================
router.get("/users/:id", function(req, res) {
   User.findById(req.params.id, function(err, foundUser){
      if(err){
          req.flash("error", "Something went wrong");
          res.redirect("/j_foods");
      } else {
          j_food.find().where('author.id').equals(foundUser._id).exec(function(err, foodFound){
              if(err) {
                  req.flash("error", "Something went wrong...");
                  res.redirect("/j_foods");
              } else {
                  res.render("users/show", {user: foundUser, j_foods: foodFound});
              }
          })
      }
   }); 
});



module.exports = router;
