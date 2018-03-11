var j_food =require("../models/j_food");
var Comment =require("../models/comment");
//All middleware goes here
var middlewareObj = {};


middlewareObj.checkj_foodOwnership = function (req, res, next) {
       if (req.isAuthenticated()) {
        j_food.findById(req.params.id, function(err, foundj_food) {
            if (err || !foundj_food) {
                req.flash("error","post not found.");
                res.redirect("/j_foods");
            } else {
                //does the user own the j_food?
                if (foundj_food.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error","You do not have permission to this post.");
                    res.redirect("back");
                }
            }
        })
        
    } else {
        req.flash("error","You need to be logged in to that.");
        res.redirect("back"); 
    }
}



middlewareObj.checkCommentOwnership = function (req, res, next) {
     if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error","Comment not found.");
                res.redirect("/j_foods");
            } else {
                
                j_food.findById(req.params.id, function(err, foundj_food) {
                    if (err || !foundj_food) {
                        req.flash("error","post not found.");
                        res.redirect("/j_foods");
                    } else {
                        //does the user own the comment?
                        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                            next();
                        } else {
                            req.flash("error","You do not have permission to this comment.");
                            res.redirect("back");
                        }
                    }
                })
            }
        })
    } else {
        req.flash("error","You need to be logged in to do that.");
        res.redirect("back"); 
    }
}


//middleware
middlewareObj.isLoggedIn = function (req, res, next) {
        if (req.isAuthenticated()) {
        return next();

    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}


module.exports = middlewareObj;