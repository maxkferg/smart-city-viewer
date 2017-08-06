import _ from 'lodash';
import React from 'react';
import Button from 'material-ui/Button';
import { MuiThemeProvider } from 'material-ui/styles';
import VideoCanvas from './VideoCanvas';
import VideoPlayer from './VideoPlayer';
import AppbarComponent from './Appbar';
import { getVideo, listFrames, updateFrame, getVideoUrl } from '../logic/storage';

let VIDEO = '1500328203';
require('normalize.css/normalize.css');
require('styles/App.css');

/* getBoxes
 * Convenience function that returns the boxes assosiated with a certain frame
 * Defaults to returning []
 * @frames
 */


class AppComponent extends React.Component {

  constructor(props) {
    super(props);

    // Non state data attributes
    this.data = {
      frames: [],
      videos: []
    }

    // Data that controls the current state
    this.frame = {
      number: 0,
      metadata: {},
      boxes: []
    };

    // The boxes in the current frame
    this.boxes = []
    this.onSourceChange("objects_train");
  }

  // onSource
  // Called whenever the source changes
  // Fetches new data and forces a rerender
  onSourceChange = (source) => {
    // List all the videos and then select one
    let self = this;
    getVideo(VIDEO).then(function(data) {
      let frameNumber = 0;
      let video = data.Items[0];
      self.data.videos = data.Items;
      listFrames(video.id).then(function(boxes){
        self.data.frames = boxes.Items;
        self.data.currentFrame = _.find(boxes.Items, {frame_number: frameNumber})
        // Set all the state attributes
        self.frame.source = source;
        self.frame.metadata = video;
        self.frame.number = frameNumber;
        self.frame.boxes = self.getBoxes(frameNumber);
        self.forceUpdate();
        console.log('Found', self.data.frames.length, 'labelled frames for this video');
      });
    });
  }

  // Pass the frame event from the video to the canvas
  // Called when the frame has been shifted
  onFrame = (event, data) => {
    console.log('Frame:',data.data.currFrame)
    this.frame.number = data.data.currFrame;
    this.frame.boxes = this.getBoxes(data.data.currFrame);
    this.forceUpdate();
  }


  // Iterate over the frames
  iterFrames = () => {
    setInterval(function(){
      document.getElementsByClassName('vjs-fbf')[2].click();
    },500);
  }


  // nextFrame
  // Step to the next frame in the video
  nextFrame = () => {
    document.getElementsByClassName('vjs-fbf')[2].click();
  }


  // Create a new bounding box
  newBox = (x, y, width, height) => {
    let label = 'car';
    let confidence = 1;
    let box = {label, x, y, width, height, confidence};
    this.frame.boxes.push(box)
    this.forceUpdate();
  }


  // Return the boxes associated with the current frame
  getBoxes = (frameNumber) => {
    if (this.data.frames || !this.data.frames.length){
      let currentFrame = _.find(this.data.frames, { frame_number: frameNumber});
      if (currentFrame){
        return currentFrame[this.frame.source] || [];
      }
    }
    return []
  }


  // Handle changes in the boxes
  // Does not rerender, because we assume that the change is handled somewhere else
  onChange = (event) => {
    let boxes = this.frame.boxes;
    boxes[event.boxNumber].x = event.x;
    boxes[event.boxNumber].y = event.y;
    boxes[event.boxNumber].width = event.width;
    boxes[event.boxNumber].height = event.height;
  }


  // Save the current state to the database
  save = () => {
    let self = this;
    let camera = self.frame.metadata.camera;
    let videoId = self.frame.metadata.id;
    let frameNumber = self.frame.number;
    let boxes = self.frame.boxes;
    updateFrame(camera, videoId, frameNumber, boxes).then(function(){
      self.nextFrame(); // Only change frame once save is successful
    }).catch(function(error){
      console.error(error)
    });
  }


  // Delete one of the boxes
  delete = () => {
    this.frame.boxes.pop();
    this.forceUpdate();
  }


  render() {
    // Get the file url according to the state
    let src;
    if (this.frame.metadata && this.frame.metadata.filename){
      src = getVideoUrl(this.frame.metadata.filename);
    } else {
      return (<p>loading</p>)
    }

    // Set the video player options
    const videoJsOptions = {
      autoplay: true,
      controls: true,
      sources: [{
        src: src,
        type: 'video/mp4'
      }],
      plugins: {
        framebyframe: {
          fps: 29.98,
          steps: [
            { text: '-5', step: -5 },
            { text: '-1', step: -1 },
            { text: '+1', step: 1 },
            { text: '+5', step: 5 }
          ]
        }
      }
    }

    // Define a handler for the new button
    let onNew = () => this.newBox(200,200,300,300);

    return (
      <MuiThemeProvider>
        <div className="index root">
          <AppbarComponent frame={this.frame} onSourceChange={this.onSourceChange} />
          <div className="container">
            <div className="wrapper">
              <VideoCanvas onChange={ this.onChange } boxes={ this.frame.boxes }></VideoCanvas>
              <VideoPlayer { ...videoJsOptions } onFrame={ this.onFrame } />
            </div>
            <Button raised style={style.button} onClick={ onNew } >New</Button>
            <Button raised style={style.button} onClick={ this.save } color="primary">Save</Button>
            <Button raised style={style.button} onClick={ this.delete } color="accent">Delete</Button>
            <Button raised style={style.button} onClick={ this.iterFrames } color="contrast" >Play</Button>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}


AppComponent.defaultProps = {
};

const style = {
  button: {
    marginRight: '12px'
  }
}


export default AppComponent;