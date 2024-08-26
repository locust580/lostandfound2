const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

const multer = require('multer');
const { error } = require('console');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image-uploads/")
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})


const upload = multer({
  storage: storage
  },
)


/**
 * Check Login
 */

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if(!token) {
    return res.render('admin');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    return res.render('admin');
  }

}





/**
 * Get /
 * Admin - Login Page
 */

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }

});

/**
 * POST /
 * Admin - Check Login
 */

router.post('/admin', async (req, res) => {
  try {

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if(!user) {
      return res.render('admin');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.render('admin');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }

});


/**
 * Get /
 * Admin Dashboard
 */

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Admin Dashboard",
      description: "Admin only portion of the site"
    }


    const data = await Post.find();
    res.render('admin/dashboard', { 
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});


/**
 * Get /
 * Page for making new posts
 */

router.get('/add-post', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Add Post",
      description: "Admin only portion of the site"
    }


    const data = await Post.find();
    res.render('admin/add-post', { 
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});

/**
 * Post /
 * Create New Post
 */

router.post('/add-post', authMiddleware, upload.single('imgfile'), async (req, res) => {
  try {
    try {
      console.log(req.file);
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        imagePath: req.file.filename,
        createdAt: Date.now()
      })

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error);
  }
});

/**
 * Get /
 * Edit/Delete Posts Page
 */

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Admin only portion of the site"
    }

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      data,
      locals,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }
});

/**
 * Put /
 * Edit Posts
 */

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, { 
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    })

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE /
 * Delete Posts
 */

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {

    postData = await Post.findById(req.params.id);

    console.log(postData);

    try {
      fs.unlink("public/image-uploads/" + postData.imagePath, (err) => {
        if (err) throw err;
        console.log(`${postData.imagePath} was deleted`);
      });
    } catch (err) {
      console.log(err);
    }
    
    await Post.deleteOne( { _id: req.params.id } );

    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin Logout
 */

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/')
})

module.exports = router;



// router.post('/admin', async (req, res) => {
//   try {

//     const { username, password } = req.body;
//     console.log(req.body);

//     res.redirect('/admin');
//   } catch (error) {
//     console.log(error);
//   }

// });




/**
 * POST /
 * Admin - Register
 */


// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//       const user = await User.create({ username, password:hashedPassword });
//       res.status(201).json({ message: 'User Created', user })
//     } catch (error) {
//       if(error.code == 11000) {
//         res.status(409),json({ message: 'User already in use' });
//       }
//       res.status(500).json({ message: "Internal server error" })
//     }



//   } catch (error) {
//     console.log(error);
//   }

// });



