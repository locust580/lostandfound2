const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');
const isActiveRoute = require('./server/helpers/routeHelpers');

const app = express();
const port = 5000 || process.env.port;

//Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'flippy dippy floppy',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),


}))



const path = require('path');
const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');
const src = path.join(__dirname,"views");

//establishes two static asset directories
//src is from google bin tutorial
//public is from express tutorial
app.use(express.static(src));
app.use(express.static('public'));

require('dotenv').config(); 



//Template engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');



app.locals.isActiveRoute = isActiveRoute;

//multer wack but used for middleman file transfer via request objects
//something something https://www.npmjs.com/package/multer
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits : {
        fileSize: 5 * 1024 * 1024,
    },
});

//all google cloud stuff; what this whole thing is for
//lol i don't know how to host a database for img files without blobbing everything
let projectId = 'top-moment-426818-q4';
let keyFilename = 'key.json';

const storage = new Storage({
    projectId,
    keyFilename
});

const bucket = storage.bucket('lost-found-storage');


app.get('/upload', async (req, res) => {
    const [files] = await bucket.getFiles();

    res.send([files]);
})



app.post('/upload', multer.single('imageFile'), (req,res) => {
    console.log('Made it to /upload')
    try {
        if(req.file){
            console.log('File found trying to upload...')
            const blob = bucket.file(req.file.originalname);
            const blobStream = blob.createWriteStream();

            blobStream.on('finish',() => {
                res.status(200).send('Success');
                console.log("Success");
            })
            blobStream.end(req.file.buffer);
        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error)
    }
})

//sets up express server on port 8080

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})