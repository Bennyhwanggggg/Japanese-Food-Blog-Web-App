var express = require("express");
var router = express.Router();
var j_food = require("../models/j_food");
var Comment = require("../models/comment");
var middleware = require("../middleware")

// Image upload
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'twicesana', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Text search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



//===============================================================
//INDEX  - Shows all j_foods
//================================================================
router.get("/", function(req, res) {
    if(req.query.search) {
        
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         //Get all j_foods fro the DB
        j_food.find({"name": regex}, function(err, allj_foods) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("j_foods/index", { j_foods: allj_foods });
            }
        });
    } else {
        //Get all j_foods fro the DB
        j_food.find({}, function(err, allj_foods) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("j_foods/index", { j_foods: allj_foods });
            }
        });
    }
});

//==============================================================
//CREATE - Add new j_foods to DB
//===============================================================
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    console.log(req.body);
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the j_food object under image property
      req.body.j_food.image = result.secure_url;
      // add author to j_food
      req.body.j_food.author = {
        id: req.user._id,
        username: req.user.username
      }
      j_food.create(req.body.j_food, function(err, j_food) {
        if (err || !j_food) {
          req.flash('error', err.message);
          return res.redirect('/j_foods');
        }
        res.redirect('/j_foods/' + j_food.id);
      });
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
router.put("/:id", middleware.checkj_foodOwnership, upload.single('image'), function(req, res) {
    if(req.file){
        cloudinary.uploader.upload(req.file.path, function(result) {
             
        
          // add cloudinary url for the image to the j_food object under image property
          req.body.j_food.image = result.secure_url;
          req.body.j_food.body = req.sanitize(req.body.j_food.body);
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

    } else {
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
    }
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




