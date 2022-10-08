

const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');

// ENVIRONMENT VARIABLES
const PORT = 5000;
const FRONTEND_URL = "http://localhost:" + PORT

// SETTING UP THE PARSERS
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// SETTING THE RENDERING ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));

// SETTING THE PUBLIC PATHS
app.use('/js', express.static('frontend/js'));
app.use('/modules', express.static('node_modules'));
app.use('/models', express.static('frontend/models'));
app.use('/css', express.static('frontend/css'));

// SETTIGN THE RENDERING ENDPOINT
app.get('/', (req, res) => {
  return res.render('index',{
        subject: "Automobiles Surrounding Engine", 
        frontend_url:FRONTEND_URL
    });
});


app.post('/api/predict', (req, res) => {

    console.log(req.data, req.body)
    axios({
        method: 'post',
        url: 'http://127.0.0.1:50003/predict',
        data: {
            sensors_content : req.body.data_input,
            inputorder : req.body.data_order
        }
      }).then(resp => {
        console.log(resp.data);
        return res.status(200).send(resp.data);
    }).catch(err => {
        console.log('error: ', err)
        return res.status(500).send(err);
    })
   
})


app.listen(PORT, () => {
    console.log(`App is listening on port ${FRONTEND_URL}`);
});