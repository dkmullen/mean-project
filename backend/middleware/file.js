const multer = require('multer'); // handles images

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]; // returns null if filetype isn't in our map
    let error = new Error('Invalide mime type');
    if (isValid) {
      error = null;
    }
    // this path below is relative to server.js file
    cb(error, 'images'); // first arg is err state, set to null if none
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-'); // spaces to dashes
    const ext = MIME_TYPE_MAP[file.mimetype]; // get the right extention
    cb(null, name + '-' + Date.now() + '.' + ext); // make a unique filename
  }
});
              // pass storage to multer, tell it to find a single image
module.exports =   multer({storage: storage}).single('image');
