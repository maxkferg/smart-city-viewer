/*eslint no-console:0 */
'use strict';
let AWS = require('aws-sdk');
let Dyno = require('dyno');
var check = require('check-types');




let config = {
  accessKeyId: 'AKIAI2HCCWWOUYMXRQIA',
  secretAccessKey: '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',
  region: 'us-east-1'
};

AWS.config.update(config)

let dynoConfig = Object.assign({}, config, {
  table: 'intersection-frames'
});

console.log(dynoConfig)


/* connectDatabase
 * Connect to DynamoDB
 * @Return DynamoDB client
 */
function connectDatabase(){
  return Dyno(dynoConfig)
}


/* connectS3
 * @Return new S3 client
 */
function connectS3(){
  return new AWS.S3(config)
}


let db = connectDatabase('intersection-frames');
let s3 = connectS3();



/* getFrame
 * Return the frame metadata for a certain video
 * @Return DynamoDB client
 */
async function getFrame(videoId,frameNumber){
  let params = {
    TableName : 'intersection-frames',
    KeyConditionExpression: 'video_id = :video_id AND frame_number = :frame_number',
    ExpressionAttributeValues: {
        ':video_id': videoId,
        ':frame_number': frameNumber
    }
  };

  return new Promise(function(resolve){
    db.query(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        resolve(data);
      }
    });
  });
}



/* getVideo
 * Return the metadata for a certain video
 * @Return DynamoDB client
 */
async function getVideo(videoId){
  let params = {
    TableName : 'intersection-videos',
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
        '#id': 'id'
    },
    ExpressionAttributeValues: {
        ':id': videoId
    }
  };

  return new Promise(function(resolve){
    db.query(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        resolve(data);
      }
    });
  });
}



/* updateFrame
 * Update an existing frame or create a new one
 * @Return DynamoDB client
 */
async function updateFrame(camera,videoId,frameNumber,boxes){
  check.assert.string(camera,'@camera must be a string');
  check.assert.string(videoId, '@camera must be a string');
  check.assert.number(frameNumber, '@frameNumber must be an integer');
  check.assert.array(boxes, '@boxes must be an array');

  getFrame(videoId, frameNumber).then(function(result){
    let frame = result.Items[0]
    if (!frame){
      frame = {
        id: videoId + '-' + frameNumber,
        camera: camera,
        video_id: videoId,
        frame_number: frameNumber,
        n_objects_test: 0,
        n_objects_train: 0,
        objects_train: [],
        objects_test: []
      }
    }

    frame.n_objects_train = boxes.length;
    frame.objects_train = boxes;

    let params = {
      TableName : 'intersection-frames',
      Item: frame
    }

    return new Promise(function(resolve){
      db.putItem(params, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          resolve(data);
          console.log('Saved training data: ',params.Item.objects_train);
        }
      });
    });
  });
}




/* listFrames
 * Connect to DynamoDB
 * @Return DynamoDB client
 */
async function listFrames(video_id){
  let params = {
    TableName : 'intersection-frames',
    KeyConditionExpression: 'video_id = :video_id',
    ExpressionAttributeValues: {
      ':video_id': video_id

    }
  };

  return new Promise(function(resolve){
    db.query(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        resolve(data);
      }
    });
  });
}


/* listVideos
 * Connect to DynamoDB
 * @Return DynamoDB client
 */
async function listVideos(camera, limit){

  let params = {
    Limit : limit,
    TableName : 'intersection-videos',
    FilterExpression: 'camera = :camera',
    ExpressionAttributeValues: {
      ':camera': camera
    }
  };

  return new Promise(function(resolve){
    db.scan(params, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        resolve(data);
      }
    });
  });
}


/* getVideoUrl
 * Return the url to a certain S3 video
 * @Return DynamoDB client
 */
function getVideoUrl(filename){
  return s3.getSignedUrl('getObject', {
    Bucket: 'smart-traffic-monitoring',
    Key: filename,
    Expires: 4*60*60 // Four hours
  });
}



module.exports.getFrame = getFrame;
module.exports.getVideo = getVideo;
module.exports.listFrames = listFrames;
module.exports.listVideos = listVideos;
module.exports.getVideoUrl = getVideoUrl;
module.exports.updateFrame = updateFrame;
