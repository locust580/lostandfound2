const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const searchFor = require('../helpers/search');




//home page

router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Lost and Found",
            description: "Lost and Found"
        }

        let perPage = 10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { 
            locals, 
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
        });

    } catch (error) {
        console.log(error);
    }

})


//post access pages

router.get('/post/:id', async (req, res) => {
    try {
        
        let slug = req.params.id;

        const data = await Post.findById({ 
            _id: slug,
        });

        

        const locals = {
            title: data.title,
            description: "Lost and Found",
        }

        res.render('post', { locals, data });

    }   catch (error) {
        console.log(error);
    }
  
});

//seperate claim pages 

router.get('/claim/:id', async (req, res) => {
    try {
        
        let slug = req.params.id;

        const data = await Post.findById({ 
            _id: slug,
        });

        const apiKey = process.env.emailAPIKey;

        const locals = {
            title: data.title,
            description: "LF Claim Item",
        }

        res.render('claim', { locals, data, apiKey });

    }   catch (error) {
        console.log(error);
    }
  
});

//search function

router.post('/search', async (req, res) => {
    try {
  
      const locals = {
          title: "Search",
          description: "Search"
        }
      
      let searchTerm = req.body.searchTerm;
      let data = await searchFor(searchTerm);
      
      res.render("search", {
          data,
          locals
      });
  
    } catch (error) {
      console.log(error);
    }
  
});

//contact page

router.get('/contact', async (req, res) => {
    try {
        
        const locals = {
            title: "Contact",
            description: "LF Contact Form",
        }

        const apiKey = process.env.emailAPIKey;

        res.render('contact', { locals, apiKey });

    } catch (error) {
        console.log(error)
    }
})





//about page

router.get('/about', (req, res) => {

    const locals = {
        title: "About",
        description: "About WALF",
    }

    res.render('about', { locals });
})

module.exports = router;


/*
function insertPostData () {
    Post.insertMany([
        {
            title: "Building a Blog",
            body: "This is the body text"
        },
        {
            title: "Building a Blog",
            body: "This is the body text"
        },
        {
            title: "Building a Blog",
            body: "This is the body text"
        }
    ])
}
insertPostData();

*/