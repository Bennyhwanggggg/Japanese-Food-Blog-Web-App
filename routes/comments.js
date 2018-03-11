var express = require("express");
var router = express.Router({ mergeParams: true });
var Comment = require("../models/comment");
var j_food = require("../models/j_food");
var middleware = require("../middleware")
var moment = require("moment")





//=================================================================
//New comment route
//=================================================================

router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find the j_food with provided ID
    j_food.findById(req.params.id, function(err, j_food) {
        if (err || !j_food) {
            req.flash("error","Something went wrong.");
            return res.redirect("/j_foods");
        }
        else {
            //Render show template with that j_food
            res.render("comments/new", { j_food: j_food });
        }
    });
});

//==============================================================
//CREATE - Add new comments to DB
//==============================================================
router.post("/", middleware.isLoggedIn, function(req, res) {
    // find the j_food with provided ID
    j_food.findById(req.params.id, function(err, foundj_food) {
        if (err || !foundj_food) {
            req.flash("error","Something went wrong.");
            return res.redirect("/j_foods");
        }
        else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    //add username and ID to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.dateAdded = moment(Date.now()).format("DD/MM/YYYY");
                    //Save comment
                     comment.save();
                    foundj_food.comments.push(comment._id);
                    foundj_food.save();
                    req.flash("success","Comment successfully added.");
                    res.redirect('/j_foods/' + foundj_food._id);
                }
            });
        }
    });
});

//Comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    j_food.findById(req.params.id, function(err, foundj_food) {
        if(err || !foundj_food){
            req.flash("error", "Error has occured")
            return res.redirect("/j_foods");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                req.flash("error","Something went wrong.");
                res.redirect("/j_foods");
            } else {
              res.render("comments/edit", {j_food_id: req.params.id, comment: foundComment}); 
            }
        });
    })
    
});

//comment update route
router.put("/:comment_id", function(req, res) {
    //find comment ID in DB
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            req.flash("error","Something went wrong.");
            res.redirect("back");
        }
        else {
            req.flash("success","Comment successfully updated.");
            res.redirect("/j_foods/" + req.params.id);
        }
    });
});

//comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //find Comment ID in DB
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            req.flash("error","Something went wrong.");
            res.redirect("/j_foods");

        }
        else {
            req.flash("success","Comment deleted.");
            res.redirect("/j_foods/" + req.params.id);

        }
    });
});




module.exports = router;
