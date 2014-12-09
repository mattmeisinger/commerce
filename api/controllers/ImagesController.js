/**
 * ImagesController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var ImagesDS = require('../DataService/ImagesDS');
var AWS = require('aws-sdk');
var bucketName = 'node-commerce-bucket';
var path = require('path');
var fs = require('fs');
var Q = require('q');

module.exports = {

  uploadImage: function (req, res) {

    // Get parameters
    var sku = req.param('sku');
    var imageType = req.param('imageType');
    var filename = req.param('filename');
    console.log('Sku: ' + sku);
    console.log('ImageType: ' + imageType);
    console.log('Filename: ' + filename);

    var fullPath = path.join(sku, imageType, filename);
    console.log('Uploading image to: ' + fullPath);

    // First check if bucket exists
    ImagesDS.checkBucket(bucketName, function (err) {
      if (err) {
        res.json({
          message: "Error checking if parent folder exists",
          error: err
        });
      }
      else {
        console.log('Bucket check passed');
        upload();
      }
    });

    function upload() {
      var uploadFile = req.file('file');
      uploadFile.upload(function onUploadComplete (err, files) { 

        // IF ERROR Return and send 500 error with error
        if (err) {
          return res.serverError(err);
        }

        console.log('Successfully uploaded file.');
        console.log(files);

        var bytes = fs.readFileSync(files[0].fd);

        ImagesDS.saveFile({
          bucketName: bucketName,
          fullPath: fullPath,
          bytes: bytes
        }, function(err, url) {
          if (err) {
            res.json({
              message: "Error uploading file to " + fullPath,
              error: err
            });
          } else {
            res.json({
              message: "Uploaded file to " + fullPath,
              url: url
            });
          }
        });

      });
    }

  },

  getImages: function (req, res) {

    // Required parameter, the SKU of the product whose images should be returned.
    var sku = req.param('sku');
    if (!sku) {
      res.json({
        message: "Error getting images",
        error: "SKU parameter is required"
      });
    }
    var s3PathPrefix = sku + '/';

    // Optional parameter, the image type can be used to further refine the image search.
    var imageType = req.param('imageType');
    if (imageType) {
      s3PathPrefix += imageType + '/';
    }

    // API examples reference: http://jsg.azurewebsites.net/upload-and-get-images-from-s3-with-node-js/
    var s3 = new AWS.S3();
    var params = {
      Bucket: bucketName,
      Prefix: s3PathPrefix
    };
    s3.listObjects(params, function(err, data){
      var bucketContents = data.Contents;
      var items = []; // List of items to return

      var urlRequests = []; // List of requests sent to AWS for signed urls, since we need to make sure these all complete
      for (var i = 0; i < bucketContents.length; i++){
        var urlParams = {
          Bucket: bucketName,
          Key: bucketContents[i].Key
        };

        var req = s3.getSignedUrl('getObject', urlParams, function(err, url){
          items.push({
            sku: bucketContents[i].Key.split('/')[0],
            imageType: bucketContents[i].Key.split('/')[1],
            filename: bucketContents[i].Key,
            url: url
          });
        });
        urlRequests.push(req);
      }

      // Wait for all signed url requests to come back before returning the results
      Q.all(urlRequests)
        .then(function () {
          res.json(items);
        });
    });

  }

};

