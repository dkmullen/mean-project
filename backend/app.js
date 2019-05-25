const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require('./routes/posts');
const app = express();

mongoose.connect('mongodb://dkm:roger456@ds149146.mlab.com:49146/dkm-mean-course',
  { useNewUrlParser: true})
  .then(() => {
    console.log('Connected to database.');
  })
  .catch(() => {
    console.log('Connection failed');
  })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// allow images to be accessed and forward requests to backend/images
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use('/api/posts', postRoutes);


module.exports = app;
