require('dotenv').config();
const bodyParser = require('body-parser');
const shortId = require('shortid');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const { Schema } = mongoose;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected')
  }).catch(err => {
    console.log(err)
  });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlSchema = new Schema({original_url: {type: String, required: true}, short_url: Number});
let Url = mongoose.model('Url', urlSchema);


app.post('/api/shorturl/', (req, res) => {
  if(/(https?:\/\/).*/.test(req.body.url)){
    const randomNum = Math.floor(Math.random() * 10000);
    let shortUrl = new Url({original_url: req.body.url, short_url: randomNum})
    shortUrl.save((err, doc) => {
      if(err) return console.error(err);
      console.log('Document inserted');
    })
    res.json({original_url: req.body.url, short_url: randomNum})
  } else {
    res.json({error: 'Invalid URL'})
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  let findUrl = Url.findOne({short_url: req.params.id}, (err, data) => {
    if(err) return console.error(err);
    res.redirect(data.original_url)
  });
  console.log();
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});