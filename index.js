const express = require('express'),
     app = express();
     morgan = require('morgan');
     fs = require('fs'), // import built in node modules fs and path 
     path = require('path')

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger with morgan middleware library
app.use(morgan('combined', {stream: accessLogStream}));

// Express.static method. As documentation.html is in "public" folder, no need to create the corresponding routing syntax
app.use(express.static('public'));

let topMovies = [
    {
        title: 'Kill Bill',
        director: 'Quentin Tarentino'
    },
    {
        title: 'Django Unchained',
        director: 'Quentin Tarentino'
    },
    { 
        title: 'The dark knight',
        director: 'Christopher Nolan'
    },
    {   
        title:' Avenger Endgame',
        director: 'Russo brothers'  
    },
    {
        title: 'I am a legend',
        director: ' Francis Lawrence'
    },
    {
        title: 'Jonh Wick',
        director: 'Chad Stahelski'
    },
    {
        title: 'Extraction',
        director: 'Sam Hargrave'
    },
    {
        title: 'Ocean\'s 11',
        director :'Steven Soderbergh' 
    },
    {
        title: 'The shape of water',
        director: 'Guillermo del Toro'
    },
    {
        title: 'Pulp fiction',
        director: 'Quentin Tarentino'
    }
]

// GET requests of movies
app.get('/movies', (req, res)=> {
    res.json(topMovies);
});

// GET request for root folder

app.get('/',(req,res) => {
    res.send('Hola! Bienvenido! Welcome! Salute! Bienvenue!');
});

// Return data (description, genre, director, image URL, whether it’s featured or not)
// about a single movie by title to the user
app.get('/movies/:title/description', (req, res) => {
    res.send('Get Request to return data (description, genre, director, image URL, whether it’s featured or not about a single movie by title to the user');
});
 
// Return data about a director (bio, birth year, death year) by name	
app.get('/movies/:name/director', (req, res) =>{
    res.send('GET request to return data about a director (bio, birth year, death year) by name');
});

// Allow new users to register
app.post('/users', (req, res) =>{
    res.send('POST requst to allow new users to register');
});

// Allow users to update their user info (username)	
app.put('/users/:userId/:username', (req, res) =>{
    res.send('Put requet to allow users to update their user info (username)');
});

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later)
app.post('/movies/:title/:userId/favorites', (req, res) =>{
    res.send('add request to allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later)');
});

// Allow users to remove a movie to their list of favorites (showing only a text that a movie has been added—more on this later)
app.delete('/movies/:title/:userId/favorites', (req, res) =>{
    res.send('delete request to allow users to remove a movie to their list of favorites (showing only a text that a movie has been added—more on this later)');
});

// Allow new users to register
app.delete('/users/:userId', (req, res) =>{
    res.send('delete request to allow existing users to deregister');
});


// error loging
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Well, quite a mess!!');
  });

// Listen for requests
app.listen(8080, () => {
    console.log('I\'m listening on port 8080!');
});