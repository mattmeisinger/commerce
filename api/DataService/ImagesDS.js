
var AWS = require('aws-sdk');

module.exports = {
  
  checkBucket: function (bucketName, next) {
    bucketExists(bucketName, function (result, err) {
      if (err) {
        console.log('Error checking if bucket exists');
        next(err);
      }
      else if (result === true) {
        // Bucket does exist
        next();
      }
      else {
        // Bucket does not exist
        createBucket(bucketName, function (err) {
          if (err) {
            console.log('Error creating bucket.');
            next(err);
          }
          else {
            createFolder('', function (err) {
              if (err) {
                console.log('Error creating root folder.');
                next(err);
              }
              else {
                next();
              }
            });
          }
        });
      }
    });
  },

  saveFile: function (fileParams, next) {
    var s3 = new AWS.S3();
    var params = {
      Bucket: fileParams.bucketName,
      Key: fileParams.fullPath,
      Body: fileParams.bytes
    };
    s3.putObject(params, function(err, data) {
      if (err) {
        console.log('Error uploading to S3', err);
        next(err);
      }
      else {
        console.log('Data uploaded to S3');
        console.log(data);
        var params = {
          Bucket: fileParams.bucketName,
          Key: fileParams.fullPath
        };
        s3.getSignedUrl('getObject', params, function (err, url) {
          if (err) {
            console.log('Error getting signed url', err);
            next(err);
          }
          else {
            console.log('Temporary URL for image: ', url);
            next(err, url);
          }
        });
      }
    });
  }

};

function createBucket(bucketName, next) {
  var s3 = new AWS.S3();
  var params = {
    Bucket:bucketName
  };
  console.log("Creating S3 bucket: " + params.Bucket);
  s3.createBucket(params, function(err, data) {
    next(err);
  });
}

function bucketExists(bucketName, next) {
  var s3 = new AWS.S3();
  var params = {
    Bucket:bucketName
  };
  s3.headBucket(params, function (err, data) {
    if (err && err.code === 'NotFound') {
      // It does not exist
      next(false);
    }
    else if (!err) {
      // It does exist
      next(true);
    }
    else {
      // Error occurred
      next(false, err);
    }
  });
}