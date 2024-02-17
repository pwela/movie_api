const { error } = require("console"),
  { check, validationResult } = require("express-validator");

const express = require("express"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  bodyParser = require("body-parser"),
  Movies = Models.Movie,
  Users = Models.User,
  app = express(),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path"),
  port = process.env.PORT || 8080;

// Connect to remote Database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to local database. Use one of the options
//mongoose.connect('mongodb://localhost:27017/myPrimeDB', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect("mongodb://127.0.0.1:27017/myPrimeDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
//CORS integration, should always be before let auth = require('./auth')(app); and all route middleware

const cors = require("cors");
/**
 *List all the allowed domains
 @var {array}
 */
let alloweddOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://myprime.netlify.app/",
  "https://myprime.netlify.app",
  "https://pwela.github.io/",
  "https://pwela.github.io",
  "http://15.157.60.95/",
  "http://15.157.60.95",
  "http://35.182.26.14",
  "http://35.182.26.14/",
]; // allowed domains

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (alloweddOrigins.indexOf(origin) === -1) {
        // a specified origin isn't found
        let message =
          "The CORS policy for this pplication doesn't allow acess from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// importation of auth.js file
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

// setup the logger with morgan middleware library
app.use(morgan("combined", { stream: accessLogStream }));

// Express.static method. As documentation.html is in "public" folder, no need to create the corresponding routing syntax
app.use(express.static("public"));

/**
 * importation of body-parser,
 * replaces app.use(bodyParser.json()); and app.use(bodyParser.urlencoded({ extended: true })); see chapter 2.5 and 2.8
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Return a list of ALL movies to the user
 * URL: /movies
 * @method get
 * @returns {JSON} A JSON object holding data about all the movies
 */

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //app.get("/movies", async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

// GET request for root folder

app.get("/", (req, res) => {
  res.send("Hola! Bienvenido! Welcome! Salute! Bienvenue!");
});

/**
 * Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
 * /movies/[Title]
 * @method get
 * @param {string} endpoint movies/:Title
 * @returns {JSON} A JSON object holding data about a single movie, containing a title description, genre, director, featured property, etc.
 * Example:
*{
title: 'The shape of water',
director: {
    name:'Guillermo del Toro',
    bio: 'Author from south america',
    birth : 1960 ,
    death : 1989
             }
genre: {
   Name: 'Drama'
    Description: 'Drame genre description'}
Decription: Surnatural fiction and romance story,
featured: true
}
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        if (!movie) {
          return res.status(404).send(req.params.Title + " not found!");
        } else {
          res.status(201).json(movie);
        }
      })
      .catch((err) => {
        res.status(500).send("Error " + err);
      });
  }
);
/**
 * Return data about a genre (description) by name/title (e.g., “Thriller”)
 *@method get 
 * @param {urlencoded} endpoint /movies/[GenreName]/genre
 * @returns {JSON} A JSON object holding data about a genre 
 * Example:
{
Name: 'Drama'
Description: 'Drame genre description'
}
 */

app.get(
  "/movies/:GenreName/genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.GenreName })
      .then((movie) => {
        if (!movie) {
          return res.status(404).send(req.params.Genre + " not found!");
        } else {
          res.status(201).json(movie.Genre);
        }
      })
      .catch((err) => {
        res.status(500).send("Error " + err);
      });
  }
);

/**Return data about a director (bio, birth , death ) by name
 * @method get
 * @param {urlencoded} endpoint /movies/[DirectorName]/director
 * @returns {JSON} A JSON object holding data about a director
description, genre, director, featured property, etc. Example:
{
Name:'Guillermo del Toro',
Bio: 'Author from south america',
Birth : 1960 ,
Death:
}
*/
app.get(
  "/movies/:DirectorName/director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.DirectorName })
      .then((movie) => {
        if (!movie) {
          return res.status(404).send(req.params.DirectorName + " not found!");
        } else {
          res.status(201).json(movie.Director);
        }
      })
      .catch((err) => {
        res.status(500).send("Error " + err);
      });
  }
);

/**
 * Allow new users to register	
 * @method post
 * @param {urlencoded} endpoint /user
 * @param {JSON} body A JSON object holding data about the new user:
{
Username:'John Doe',
Password: 'TestPassword',
email: jdoe@mail.com,
Birthday: 1950
}

*@returns {JSON} A JSON object holding data about the registred user, including ID.
* Example
{
id:15,
Username:'John Doe',
Password: 'TestPassword',
Email: jdoe@mail.com
Birth: 1950 ,
}
 */

app.post(
  "/users",
  // validation logic for request
  [
    check("Username", "Username is required").isLength({ min: 5 }), // minumun 5 characters
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],

  async (req, res) => {
    // check validation logic object
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists!");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Get all users

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

// Get user by username

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Check if the user wanting to update infos is the logged user

    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }

    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(error);
      });
  }
);

/**
 * Allow users to update their user info
 * @method put
 * @param {urlencoded} endpoint /users/[Username]
 * @param {JSON} body A JSON object holding data about the files to update:
{
Username:'John Doe',
Password: 'TestPassword',
email: jdoe@mail.com,
Birthday: 1950
}
 * @returns {JSON} A JSON object holding data about the registred user, including ID. Example
{
id:15,
Username:'John ',
Password: 'TestPasswordupdated',
Email: jdoe@mailupdated.com
Birth: 1955 ,
FavoriteMovies:[]
}
 */
// As the object with informations to update will not be passed in the http request, endpoint will be updated to /users/:username
app.put(
  "/users/:Username",
  // validation logic for request
  [
    check("Username", "Username is required").isLength({ min: 5 }), // minumun 5 characters
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],

  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // check validation logic object
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Check if the user wanting to update infos is the logged user

    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }

    // Hashed the new password
    let hashedPassword = Users.hashPassword(req.body.Password);

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

/**
 * Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later)
 * @method post
 * @param {urlencoded} endpoint /users/[Unsername]/movies/[MovieID]
 * @returns {JSON} A JSON object holding data about the registred user, including newMvieID. Example:
{
id:15,
Username:'John ',
Password: 'TestPasswordupdated',
Email: jdoe@mailupdated.com
Birth: 1955 ,
FavoriteMovies:[MovieID]
}
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Check if the user wanting to update infos is the logged user

    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })

      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

/** 
 * Allow users to remove a movie to their list of favorites (showing only a text that a movie has been added—more on this later)
 * @method delete
 * @param {urlencoded} endpoint /users/:Username/movies/:MovieID
 * @returns {JSON} A JSON object holding data about the registred user, without MovieID in FavoriteMovies. 
 * Example:
{
id:15,
Username:'John ',
Password: 'TestPasswordupdated',
Email: jdoe@mailupdated.com
Birth: 1955 ,
FavoriteMovies:[]
}
  */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Check if the user wanting to update infos is the logged user

    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })

      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

/**
 * Allow new users to deregister
 * @param {urlencoded} endpoint /users/[Unsername]/movies/[MovieID]
 * @returns {string}   A Confirmation message that the user was deleted
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Check if the user wanting to update infos is the logged user

    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }

    await Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " Was not found!");
        } else {
          res.status(200).send(req.params.Username + " Was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error " + err);
      });
  }
);

// error loging
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Well, quite a mess!!");
});

// Listen for requests

// listen online server
app.listen(port, "0.0.0.0", () => {
  console.log("I'm listening on port " + port);
});

// Listen local port
// app.listen(8080, () => {
//   console.log("Your app is listening on port 8080");
// });
