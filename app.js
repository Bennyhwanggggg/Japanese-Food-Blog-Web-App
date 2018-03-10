//Requiring packages
var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    mongoose         = require("mongoose"),
    seedDB           = require("./seed"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    User             = require("./models/user"),
    methodOverride   = require("method-override"),
    flash            = require("connect-flash");
    

//requiring routes
var commentRoutes    = require("./routes/comments"),
    j_foodRoutes = require("./routes/j_foods"),
    indexRoutes      = require("./routes/index");

//Seed DB
// seedDB();

//Using packages
mongoose.connect("mongodb://localhost/j_food");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));



//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "yennb",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//Use routes
app.use(indexRoutes);
app.use("/j_foods/:id/comments", commentRoutes);
app.use("/j_foods", j_foodRoutes);



//PORT to listen for request
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("J Food Blogger App Server has Started!!!");
});
