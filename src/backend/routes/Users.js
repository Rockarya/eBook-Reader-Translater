var express = require("express");
var router = express.Router();
const passport = require("passport");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const {uploadTranslatedBook} = require("./Books");
const { PythonShell } = require("python-shell");
// PDFNet shall specially cause some trouble while installing
// It is a good choice to replace this library with an opensource one
const { PDFNet } = require('@pdftron/pdfnet-node');

// Loading User and File models
const File = require("../models/files");
const User = require("../models/Users");
const { url } = require("inspector");

require("../passport-strategy")(passport);

isItAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/register");
};

// This file contains all the APIs the have urls of the form
// https://aws...../user/ + extension


// GET request
// Getting all the users
router.get("/", function (req, res) {
  User.find(function (err, users, req) {
    if (err) {
      // console.log(err);
    } else {
      res.json(users);
    }
  });
});

// POST request
// Add a user to db
router.post("/register", async (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  //Checking if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(204).send("Email already exists!");

  await newUser
    .save()
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// POST request
// Login
router.post("/login", (req, res, next) => {
  // console.log(req.body);
  passport.authenticate("local", function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(204).redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.status(200).json(user);
    });
  })(req, res, next);
});

// logged in admin can logout
router.get("/logout", (req, res) => {
  req.logout();
  var success = true;
  res.status(200).json(success);
  console.log("logged out successfully");
});

// Check if user is authenticated
router.get("/legit", (req, res) => {
  var success = false;
  console.log("Checking legit");
  if (req.isAuthenticated()) success = true;
  console.log(success);
  res.status(200).json(success);
});

//DELETE SPECIFIC USER
router.delete("/:userId", async (req, res) => {
  try {
    const removeduser = await User.remove({ _id: req.params.userId });
    res.json(removeduser);
  } catch (err) {
    res.json({ message: err });
  }
});

var fileName = '';

// Used to store the uploaded pdf in the backend service temporarily
// until the translation is completed
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/pdf");
  },
  filename: function (req, file, cb) {
      // this is where the book receives its distinct file_name structure
      fileName = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(
      null,
      fileName
    );
  },
});

// renaming the multer function as upload
var upload = multer({ storage: storage });


// s3 file uploading
const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'ap-south-1',
    accessKeyId: 'AKIA3BOLL3RQUMBQY2NC',
    secretAccessKey: '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'
});
var myBucket = 'dass-team-23'
var myKey = '1617707737150-Assignment1-3.pdf'
const uploadS3 = multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: myBucket,
      metadata: (req, file, cb) => {
        cb(null, {fieldName: file.fieldname})
      },
      key: (req, file, cb) => {
        fileName = Date.now().toString() + '-' + file.originalname;
        cb(null, fileName)
        console.log(fileName, "is the name");
      }
    })
  });



//   AWS.config.update({accessKeyId: 'AKIA3BOLL3RQUMBQY2NC', secretAccessKey: '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'});
  
// this API gives link to a file with the given name
// query type is https://aws..../user/downloadpdf?filename={name_of_the_file} , i.e., filename param is expected
router.get("/downloadpdf",(req,res)=>{
    console.log(req.query.filename);
    console.log("yaya");
    myKey = req.query.filename;
    var filename = req.query.filename
    let response={
        status:'100',
        success:'',
        msg:'',
        type:'',
        url: '',
    }
    response.url = s3URL();
    console.log(response.url);
    res.json(response).send();
});

// takes care of generating url for stored objects on s3
const s3URL = () => {
    let url = s3.getSignedUrl('getObject', {
        Bucket: 'dass-team-23',
        Key: myKey,
        Expires: 3600
    });
    return url;
}

// uploads the file received from frontend and logs in the details into FileSchema
// The translation also begins while here
// request structure has a file object and body that contains the details of the book
// as entered by the Admin while uploading the book.
router.post('/upload', upload.single('file'), async (req, res) => {
    try {   
        let response = {
            status:'100',
            success:'',
            msg:'',
            type:'',
        }
        const title = req.body.title;
        const { mimetype } = req.file;

        // Saving the details of the book
        const file = new File({
            title: title,
            file_path: fileName,
            file_name: fileName,
            author_name: req.body.author_name,
            language: 'English',
            file_mimetype: mimetype
        });
        await file.save();

        response.msg = "File uploaded successfully";
        const tempPath = __dirname + '/../public/thumbs/' + fileName + '.png';
        let outputPath = '';
        myKey = fileName;
        console.log('This is mykey: ', myKey);

        // Below chunk of code generates a thumbnail for the book uploaded.
        // This thumnail remains in the backend system for now and is used by all
        // versions of this file, i.e. translated books also use the same thumbnails.
        const main = async () => {
            outputPath = tempPath;
            const doc = await PDFNet.PDFDoc.createFromFilePath(__dirname + '/../public/pdf/' + fileName);
            const pdfdraw = await PDFNet.PDFDraw.create(92);
            const currPage = await doc.getPage(1);
            await pdfdraw.export(currPage, outputPath, 'PNG');
        };
        PDFNetEndpoint(main, outputPath, res);
    var path = './public/pdf/' + fileName;
    var trans_langs = req.body.language;
    trans_langs = trans_langs.split(",")

    // converting the argument for translation languages to a desirable format
    for(var i = 0; i<trans_langs.length; i++){
      trans_langs[i] = trans_langs[i].slice(0,3).toLowerCase()
    }
    var newNameOfFile = fileName.split('.');

    // this where the translation function is called.
    translate(path, newNameOfFile[0], trans_langs);

    // English version of the file is read and kept ready for uploading
    fs.readFile(path, async (err, data1) => {
      if(err){
          console.log(err);
          return res.status(400).send(err);
      }

      // s3 uploading parameters
      myBucket = 'dass-team-23';
      const details = {
          Bucket: myBucket,
          Key: fileName,
          Body: data1,
          ContentType: 'application/pdf',
          ContentDisposition: 'inline'  
      };

      // s3 uploading logic
      s3.upload(details, async function (err, dataReturn) {
          if (err) {
              console.log(err);
              return res.status(400).json(err);
          }
      });

    })
 
  } catch (error) {
    console.log(error);
    console.log("\n\n bhai error aaya hai\n\n");
    res.status(400).send('Error while uploading file. Try again later.');
}});

// API used for retrieving all the data in the db for diplaying purposes in the frontend
router.get("/allbooks", async (req, res) => {
  await File.find({})
    .then((users) => {
      return res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
      return res.status(403).send(err);
    });
});

// send a get request ending with the filename as stored in files.file_name. the response is png format
// the request expects 'filename' param
router.get('/thumbnail', (req, res) => {
    console.log("received thumbnail request", req.query);
    const id = req.query.filename;

    const outputPath = path.resolve(__dirname, '../public/thumbs', `${id}.png`);
    const main = async () => {
    };
    PDFNetEndpoint(main, outputPath, res);
});

// this logic converts a single pdf page into png format so that it can be used as a thumbnail
const PDFNetEndpoint = (main, pathname, res) => {
    PDFNet.runWithCleanup(main) // you can add the key to PDFNet.runWithCleanup(main, process.env.PDFTRONKEY)
      .then(() => {
        PDFNet.shutdown();
        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            // const ext = path.parse(pathname).ext;
            res.setHeader('Content-type', 'image/png');
            res.end(data);
          }
        });
      })
      .catch(error => {
        res.statusCode = 500;
        console.log(error);
        res.send(error);
      });
  };

// the main function that intimates python of the work it needs to do.
// note the a python script runs in the backend and this is where the
// translation then takes place
async function translate(file_path, book_id, trans_langs) {
  var arguments = [];
  arguments.push(file_path);
  arguments.push(book_id);
  for (var i = 0; i < trans_langs.length; i++) {
    arguments.push(trans_langs[i]);
  }
  console.log(arguments);
  let options = {
    mode: "text",
    executable: "python3.9",
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath:
      "./public/translation",
    args: arguments, //An argument which can be accessed in the script using sys.argv[1]
  };
  console.log("entered the async")
  try{
    await PythonShell.run(
        "ParseAndTranslate.py",
        options,
        function (err, result) {
        if (err) throw err;
        //result is an array consisting of messages collected
        //during execution of script.
        console.log("result: ", result.toString());
        for(var i = 0 ; i < trans_langs.length ; i++){
          console.log("doing something in this loop for downloads");
          uploadTranslatedBook(book_id, trans_langs[i]);
        }
        }
    );console.log("ok this is it")} catch (error){
        console.log("ded")
        console.log(error)
    }
    console.log("exiting the async")
    
}

module.exports = router;