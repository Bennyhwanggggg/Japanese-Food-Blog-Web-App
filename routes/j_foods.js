var express = require("express");
var router = express.Router();
var j_food = require("../models/j_food");
var Comment = require("../models/comment");
var middleware = require("../middleware")

//===============================================================
//INDEX  - Shows all j_foods
//================================================================
router.get("/", function(req, res) {
    //Get all j_foods fro the DB
    j_food.find({}, function(err, allj_foods) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("j_foods/index", { j_foods: allj_foods });
        }
    });
});

//==============================================================
//CREATE - Add new j_foods to DB
//===============================================================
router.post("/", middleware.isLoggedIn, function(req, res) {
    //get data from form and add to j_foods array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newj_food = {name: name, image: image, price: price, description: desc, author:author}
    //create a new j_food and save to DB
    j_food.create(newj_food, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            //redirect back to j_foods page
            req.flash("success","post successfully added.");
            res.redirect("/j_foods");
        }
    });
});

//=============================================================
//NEW - Show form to create new j_food
//=============================================================

router.get("/new",middleware.isLoggedIn, function(req, res) {
    res.render("j_foods/new");
});

//===============================================================
//SHOW - Show more infor about j_food
//===============================================================

router.get("/:id", function(req, res) {
    //find the j_food with provided ID
    j_food.findById(req.params.id).populate("comments").exec(function(err, foundj_food) {
        if (err || !foundj_food) {
            req.flash("error","Something went wrong.");
            res.redirect("/j_foods");
        }
        else {
            //Render show template with that j_food
            res.render("j_foods/show", { j_food: foundj_food });
        }
    });
});


//EDIT ROUTE=================================================

router.get("/:id/edit", middleware.checkj_foodOwnership, function(req, res) {
    //find j_food ID in DB
    j_food.findById(req.params.id, function(err, foundj_food ) {
        if (err || !foundj_food) {
             req.flash("error","Something went wrong.");
             res.redirect("/j_foods");
        } else {
            //show to the edit page
            res.render("j_foods/edit",  { j_food: foundj_food }); 
        }
    
    });
});

//UPDATE ROUTE===========================================
router.put("/:id", middleware.checkj_foodOwnership, function(req, res) {
    //senitize data
    req.body.j_food.body = req.sanitize(req.body.j_food.body);
    //find j_food ID in DB
    j_food.findByIdAndUpdate(req.params.id, req.body.j_food, function(err, updatedj_food) {
        if (err || !updatedj_food) {
            res.redirect("/j_foods");
        }
        else {
            req.flash("success","post successfully updated.");
            res.redirect("/j_foods/" + req.params.id);

        }
    });
});


//DELETE ROUTE===========================================
router.delete("/:id", middleware.checkj_foodOwnership, function(req, res) {
    //find j_food ID in DB
    j_food.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/j_foods");

        }
        else {
            req.flash("success","post successfully deleted.");
            res.redirect("/j_foods");

        }
    });
});

module.exports = router;




