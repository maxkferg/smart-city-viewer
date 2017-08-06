import React from 'react';
import videojs from 'video.js';
import '../lib/framebyframe/index.js';

require('video.js/dist/video-js.css');



export default class VideoPlayer extends React.Component {
  componentDidMount() {
    // instantiate video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      console.log('onPlayerReady', this)
    });
    this.player.on('frame',this.props.onFrame);
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div data-vjs-player>
        <video height="720" width="1280" ref={ node => this.videoNode = node } className="video-js"></video>
      </div>
    )
  }
}
