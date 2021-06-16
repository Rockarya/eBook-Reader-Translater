// Contains an important function for uploading translated book to s3

var express = require("express");
var router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { PDFNet } = require('@pdftron/pdfnet-node');


// Loading User and File models
const File = require('../models/files');
const User = require("../models/Users");

// s3 credetails for the bucket where all files are stored
const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'ap-south-1',
    accessKeyId: 'AKIA3BOLL3RQUMBQY2NC',
    secretAccessKey: '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'
});

// custom made sleep function to immitate the sleep() function in C/C++
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This function tests whether the file given by filePath exists or not.
// This function returns only when the said file becomes available for upload
async function fileExist(filePath) {
    console.log(filePath)
    while(1){
        // sleeping for 6000ms or 6s
        if(fs.existsSync(filePath)){
            await sleep(6000);
            return true;
        }
    }
}

// This function uploads the translated book and also logs in the details about
// the newly upload book into the FileSchema so that it is now treated like any other book
module.exports.uploadTranslatedBook = async function uploadTranslatedBook (bookId, language) {
    
    // constructing the filename as expected to be named by the translation script
    const filename = language + '_' + bookId;
    
    // path where the newly formed translated book is expected to be formed
    var path = './public/translation/' + bookId + '/' + filename + '.pdf';
    console.log("Waiting to upload from path ", path);
    
    // waiting for the existence to book to become true
    let existFlag = await fileExist((path));
    var title, author;
   
    // replacing language details for better understanding
    if(language == 'hin'){
        language = 'Hindi';
    }
    else if(language == 'tel'){
        language = 'Telugu';
    }

    // saving the details of the translated book
    await File.findOne({file_name: (bookId + '.pdf')}).then(async (book) => {
        const newBook = new File({
            title: book.title,
            // file path for the translated book is the same
            // since both books shall use the same thumbnail
            file_path: (filename),
            file_name: (filename + '.pdf'),
            author_name: book.author_name,
            file_mimetype: 'application/pdf',
            language: language
        });
        await newBook.save();
    }); 

    // Reading the file data for uploading
    await fs.readFile(path, async (err, data1) => {
        if(err){
            console.log(err);
        }
        var outputPath;
        const main = async () => {
            console.log("starting to make the thumbnail");
            outputPath = __dirname + '/../public/thumbs/' + filename + '.png';
            const doc = await PDFNet.PDFDoc.createFromFilePath(__dirname + '/.' + path);
            const pdfdraw = await PDFNet.PDFDraw.create(92);
            const currPage = await doc.getPage(1);
            await pdfdraw.export(currPage, outputPath, 'PNG');
        };
        await PDFNetEndpoint(main, outputPath);
        // bucket and other parameters to input into s3 upload function
        myBucket = 'dass-team-23';
        const details = {
            Bucket: 'dass-team-23',
            Key: filename + '.pdf',
            Body: data1,
            ContentType: 'application/pdf',
            ContentDisposition: 'inline'
            
        };

        // uploading to s3
        s3.upload(details, async function (err, dataReturn) {
            if (err) {
                console.log(err);
            }
            console.log("Uploaded the translated pdf");
            console.log('trying to delete translated pdf');
            fs.unlinkSync(path, (err) => {
                console.log(err, " while deleting the pdfs");
            });
        });
        
    });
};


// the delete book API. This API is only expected to be used by the admin
router.delete('/deleteBook', (req, res) => {
    const params = {
        Bucket: 'dass-team-23',
        Key: req.query.filename
    }
    s3.deleteObject(params, (err) => {
        if(err){
            console.log(err);
        }
        console.log("Delete file ", req.query.filename);
    });

    // deleting the corresponding file details from the database
    File.deleteOne({file_name: req.query.filename}).then(() => {
        res.status(200).send();
    }).catch(err => {
        console.log(err);
    });
});

const PDFNetEndpoint = (main, pathname) => {
    PDFNet.runWithCleanup(main) // you can add the key to PDFNet.runWithCleanup(main, process.env.PDFTRONKEY)
      .then(() => {
        PDFNet.shutdown();
      })
      .catch(error => {
        console.log(error);
      });
  };

// module.exports.uploadTranslatedBook = uploadTranslatedBook;
module.exports.BookRouter = router;
