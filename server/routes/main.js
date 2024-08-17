const express = require('express');
const router = express.Router();
const Post = require('../models/Post');







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

router.post('/search', async (req, res) => {
  try {

    const locals = {
        title: "Search",
        description: "Search"
      }
    
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Post.find({
        $or: [
            { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
            { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
    });

    res.render("search", {
        data,
        locals
    });

  } catch (error) {
    console.log(error);
  }

});









router.get('/about', (req, res) => {
    res.render('about');
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