

const express = require('express');
const path = require('path');
const app = express();

// ENVIRONMENT VARIABLES
const PORT = 50000;
const FRONTEND_URL = "http://localhost:" + PORT


// SETTING THE RENDERING ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));

// SETTING THE PUBLIC PATHS
app.use('/js', express.static('frontend/js'));
app.use('/css', express.static('frontend/css'));

// SETTIGN THE RENDERING ENDPOINT
app.get('/', (req, res) => {
  return res.render('index',{
        subject: "Automobiles Surrounding Engine", 
        frontend_url:FRONTEND_URL
    });
});


app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});