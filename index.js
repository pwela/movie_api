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


// error loging
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Well, quite a mess!!');
  });

// Listen for requests
app.listen(8080, () => {
    console.log('I\'m listening on port 8080!');
});