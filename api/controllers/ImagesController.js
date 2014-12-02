/**
 * ImagesController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var AWS = require('aws-sdk');
var bucketName = 'node-commerce-bucket';
var path = require('path');
var fs = require('fs');

module.exports = {

  createFolder: function (req, res) {

    // Get parameters
    var folderName = req.param('folder');
    var name = req.param('name');
    var newFolderPath = path.join(folderName, name);

    // First check if bucket exists
    checkBucket();
    function checkBucket() {
      bucketExists(function (result, err) {
        if (err) {
          // Some other error
          res.json({
            message: "Error checking if bucket exists",
            error: err
          });
        }
        else if (result === true) {
          // Bucket does exist
          checkFolder();
        }
        else {
          // Bucket does not exist
          createBucket(function (err) {
            if (err) {
              res.json({
                message: "Error creating bucket",
                error: err
              });
            }
            else {
              createFolder('', function (err) {
                if (err) {
                  res.json({
                    message: "Error creating root folder",
                    error: err
                  });
                }
                else {
                  checkFolder();
                }
              });
            }
          });
        }
      });
    }

    function checkFolder() {
      folderExists(folderName, function (result, err) {
        if (err) {
          res.json({
            message: "Error checking if parent folder exists",
            error: err
          });
        }
        else if (result === true) {
          create();
        }
        else {
          res.json({
            message: "Folder does not exist: " + folderName,
            error: err
          });
        }
      });
    }

    function create() {
      folderExists(newFolderPath, function (result, err) {
        if (err) {
          res.json({
            message: "Error checking if folder exists",
            error: err
          });
        }
        else if (result === true) {
          res.json({
            message: "Folder already exists: " + newFolderPath
          });
        }
        else {
          createFolder(newFolderPath, function (err) {
            if (err) {
              res.json({
                message: "Error creating folder",
                error: err
              });
            }
            else {
              res.json({
                message: "Folder created: " + newFolderPath
              });
            }
          });
        }
      });

    }
  },

  uploadImage: function (req, res) {

    // Uploading a file can only be a POST    
    if(req.method !== 'POST')
      return res.json({status:'GET not allowed'});

    var s3 = new AWS.S3();
    
    // Get parameters
    var folderPath = req.param('folder') || '';
    var filename = req.param('filename');
    console.log(folderPath);
    console.log(filename);
    var uploadFile = req.file('file');
    var fullFilePath = folderPath ? path.join(folderPath, filename) : filename;
    console.log("Uploading file: " + fullFilePath);
    console.log(uploadFile);

    uploadFile.upload(function onUploadComplete (err, files) {        

      // Files will be uploaded to .tmp/uploads

      // IF ERROR Return and send 500 error with error
      if (err)
        return res.serverError(err);

      console.log("uploaded file:");
      console.log(files);

      folderExists(folderPath, function (result, err) {
        if (err) {
          res.json({
            message: "Error checking if folder exists",
            error: err
          });
        }
        else if (result === false) {
          res.json({
            message: "Folder does not exist: " + folderPath
          });
        }
        else {
          // Upload file
          var params = {
            Bucket: bucketName,
            Key: fullFilePath,
            Body: fs.readFileSync(files[0].fd)
          };
          s3.putObject(params, function(err, data) {
            if (err) {
              res.json({
                message: "Error uploading file to " + fullFilePath,
                error: err
              });
            } else {
              res.json({
                message: "Uploaded file to " + fullFilePath,
                data: data
              });
            }
          });
        }
      });
    });
  }

};

function createBucket(response) {
  var s3 = new AWS.S3();
  var params = {Bucket:bucketName};
  console.log("Creating S3 bucket: " + params.Bucket);
  s3.createBucket(params, function(err, data) {
    response(err);
  });
}
function bucketExists(response) {
  var s3 = new AWS.S3();
  var params = {Bucket:bucketName};
  s3.headBucket(params, function (err, data) {
    if (err && err.code === 'NotFound') {
      // It does not exist
      response(false);
    }
    else if (!err) {
      // It does exist
      response(true);
    }
    else {
      // Error occurred
      response(false, err);
    }
  });
}

function createFolder(newFolderPath, response) {
  var s3 = new AWS.S3();
  var params = {
    Bucket: bucketName, 
    Key: path.join(newFolderPath, '.folder'),
    Body: '[folder]'
  };
  console.log("Creating S3 file: " + params.Key);
  s3.putObject(params, function(err, data) {
    response(err);
  });
}
function folderExists(folderName, response) {
  var s3 = new AWS.S3();
  var params = {
    Bucket:bucketName,
    Key:folderName ? path.join(folderName, '.folder') : '.folder'
  };
  s3.headObject(params, function (err, data) {
    if (err && err.code === 'NotFound') {
      // It does not exist
      response(false);
    }
    else if (!err) {
      // It does exist
      response(true);
    }
    else {
      // Error occurred
      response(false, err);
    }
  });
}
