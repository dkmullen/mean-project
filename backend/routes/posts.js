const express = require('express');
const multer = require('multer'); // handles images
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

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
    cb(error, 'backend/images'); // first arg is err state, set to null if none
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-'); // spaces to dashes
    const ext = MIME_TYPE_MAP[file.mimetype]; // get the right extention
    cb(null, name + '-' + Date.now() + '.' + ext); // make a unique filename
  }
})

              // pass storage to multer, tell it to find a single image
router.post('', checkAuth, multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        postId: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Creating a post failed.'
    });
  });

});

router.put('/:id', checkAuth, multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename

  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId }, post)
  .then(result => {
    console.log(result);
    if (result.nModified > 0) {
      res.status(200).json({message: 'Update successful'});
    } else {
      res.status(401).json({ message: 'Not authorized!' });
    }
  })
  .catch(error => { // catch block is for technical errors
    res.status(500).json({
      message: 'Couldn\'t update post.'
    });
  });
})

router.get('', (req, res, next) => {
  // get pagination info off the req header coming in
  const pageSize = +req.query.pagesize; // the last term is up to me
  const currentPage = +req.query.page; // the '+' converts str to int
  const postQuery = Post.find(); // returns all entries, unless modified (as below)
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1)) // skip to the requested page
    .limit(pageSize);   // fetch only the number of posts in a page
    // Post.find still operates on the entire db even with this filter, so it could
    // be inefficient for very large queries
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      })
    })
    .catch(error => { // catch block is for technical errors
      res.status(500).json({
        message: 'Fetching posts failed.'
      });
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found.'});
    }
  })
  .catch(error => { // catch block is for technical errors
    res.status(500).json({
      message: 'Fetching post failed.'
    });
  });
})

router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId })
  .then(result => {
    console.log(result);
    if (result.n > 0) {
      res.status(200).json({message: 'Deletion successful'});
    } else {
      res.status(401).json({ message: 'Not authorized!' });
    }
    res.status(200).json({ message: 'Post deleted.'})
  })
  .catch(error => { // catch block is for technical errors
    res.status(500).json({
      message: 'Fetching posts failed.'
    });
  });
})

module.exports = router;
