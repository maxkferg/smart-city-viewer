import _ from 'lodash';
import React from 'react';
import { Layer, Stage } from 'react-konva';
import KonvaBox from './KonvaBox'


export default class VideoCanvas extends React.Component {

  /* Render the boxes from @props
   * Boxes is an array box tuples
   */
  renderBoxes = () => {
    let self = this;
    return _.map(self.props.boxes, function(box,i){
      return (<KonvaBox key={i} boxNumber={i} onChange={self.props.onChange} {...box} />)
    });
  }

  render() {
    return (
      <Stage width={1280} height={690}>
        <Layer>{this.renderBoxes()}</Layer>
      </Stage>
    )
  }
}

