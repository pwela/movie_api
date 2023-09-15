const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  JsonStrategy = require("passport-json").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new JsonStrategy(
    {
      usernameProp: "Username",
      passwordProp: "Password",
    },

    async (username, password, done) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ username: username }).then((user) => {
        if (err) {
          console.log("General error");
          return done(err, {
            message: "General error",
          });
        }
        if (!user) {
          console.log("incorrect username");
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }
        if (!user.verifyPassword(password)) {
          console.log("Incorrect password");
          return done(null, false, { message: "Incorrect password." });
        }

        console.log("finished");
        return done(null, user);
      });
    }

    /*  function (username, password, done) {
    Users.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false) }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    })
    
  }*/
  )
);

/*passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username }).then((user) => {
        if (!user) {
          console.log("incorrect username");
          return callback(null, false, {
            message: "Incorrect username or password",
          });
        }
        if (!user.validatePassword(password)) {
          console.log("Incorrect password");
          return callback(null, false, { message: "Incorrect password." });
        }
        console.log("finished");
        return callback(null, user);
      });
    }
  )
); */

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
