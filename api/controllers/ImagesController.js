/**
 * ImagesController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var AWS = require('aws-sdk');
var bucketName = 'node-commerce-bucket3';
var path = require('path');

module.exports = {

  createFolder: function (req, res) {
    var s3 = new AWS.S3();
    var folderName = req.query['folder'];
    var name = req.query['name'];
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
    var s3 = new AWS.S3();
    var folderName = req.query['folder'];
    var filename = req.query['filename'];
    var params = {Bucket:bucketName,Key:path.join(folderName, filename)};

    //TODO
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
    Key:path.join(folderName, '.folder')
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
