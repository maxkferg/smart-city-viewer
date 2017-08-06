import React from 'react';
import Konva from 'konva';
import { Rect, Group } from 'react-konva';




export default class KonvaBox extends React.Component {
    constructor(...args) {
      super(...args);
      this.state = {
        color: 'blue',
        opacity: 0.3
      };
    }

    /* update
     * Update the rect on drag
     */
    update = (activeAnchor) => {
        var group = activeAnchor.getParent();
        var topLeft = group.get('.topLeft')[0];
        var topRight = group.get('.topRight')[0];
        var bottomRight = group.get('.bottomRight')[0];
        var bottomLeft = group.get('.bottomLeft')[0];
        var image = group.get('Rect')[0];
        var anchorX = activeAnchor.getX();
        var anchorY = activeAnchor.getY();

        // update anchor positions
        switch (activeAnchor.getName()) {
            case 'topLeft':
                topRight.setY(anchorY);
                bottomLeft.setX(anchorX);
                break;
            case 'topRight':
                topLeft.setY(anchorY);
                bottomRight.setX(anchorX);
                break;
            case 'bottomRight':
                bottomLeft.setY(anchorY);
                topRight.setX(anchorX);
                break;
            case 'bottomLeft':
                bottomRight.setY(anchorY);
                topLeft.setX(anchorX);
                break;
        }
        image.position(topLeft.position());
        let width = topRight.getX() - topLeft.getX();
        let height = bottomLeft.getY() - topLeft.getY();
        if (width && height) {
            image.width(width);
            image.height(height);
        }

        // Fire the onChange event for handlers that are wathcing this box
        this.fireOnChange();
    }

    /* moveAnchor
     * Move one of the anchors by name
     */
    moveAnchor = (group, x, y, name) => {
        let anchor = group.get('.'+name)[0];
        anchor.position({x:x, y:y});
        return anchor;
    }


    /* fireOnChange
     * Fire the onChange prop with the new rect positions
     * Fires event with center coordinates
     */
    fireOnChange = () => {
        let group = this.refs.group
        let topLeft = group.get('.topLeft')[0];
        let topRight = group.get('.topRight')[0];
        let bottomRight = group.get('.bottomRight')[0];
        let bottomLeft = group.get('.bottomLeft')[0];
        let width = topRight.getX() - topLeft.getX();
        let height = bottomLeft.getY() - topLeft.getY();

        this.props.onChange({
            x: group.x() + (topLeft.getX() + topRight.getX()) / 2,
            y: group.y() + (topLeft.getY() + bottomRight.getY()) / 2,
            boxNumber: this.props.boxNumber,
            width: Math.abs(width),
            height: Math.abs(height)
        });
    }


    /* addAnchor
     * Add an anchor to the group
     */
    addAnchor = (group, x, y, name) => {
        var self = this;
        var layer = group.getLayer();
        var anchor = new Konva.Circle({
            x: x,
            y: y,
            stroke: '#666',
            fill: '#ddd',
            strokeWidth: 2,
            radius: 8,
            name: name,
            draggable: true,
            dragOnTop: false
        });
        anchor.on('dragmove', function() {
            self.update(this);
            layer.draw();
        });
        anchor.on('mousedown touchstart', function() {
            group.setDraggable(false);
            this.moveToTop();
        });
        anchor.on('dragend', function() {
            group.setDraggable(true);
            layer.draw();
        });
        // add hover styling
        anchor.on('mouseover', function() {
            var layer = this.getLayer();
            document.body.style.cursor = 'pointer';
            this.setStrokeWidth(4);
            layer.draw();
        });
        anchor.on('mouseout', function() {
            var layer = this.getLayer();
            document.body.style.cursor = 'default';
            this.setStrokeWidth(2);
            layer.draw();
        });
        group.add(anchor);
    }

    // Get the box as corner coordinates
    // @props. The props to extract coordinates from
    getCornerCoordinates = (props) => {
        return {
            x: props.x - props.width/2,
            y: props.y - props.height/2,
            width: props.width,
            height: props.height
        }
    }

    // Add the anchor points
    componentDidMount(){
      let coords = this.getCornerCoordinates(this.props);
      this.addAnchor(this.refs.group, coords.x,              coords.y,               'topLeft');
      this.addAnchor(this.refs.group, coords.x+coords.width, coords.y,               'topRight');
      this.addAnchor(this.refs.group, coords.x+coords.width, coords.y+coords.height, 'bottomRight');
      this.addAnchor(this.refs.group, coords.x,              coords.y+coords.height, 'bottomLeft');
    }

    // Update the anchor points
    componentWillUpdate(nextProps){
      let coords = this.getCornerCoordinates(nextProps);
      this.refs.group.x(0); // Reset the group position in case it was moved in a previous frame
      this.refs.group.y(0); // Reset the group position in case it was moved in a previous frame
      this.moveAnchor(this.refs.group, coords.x,              coords.y,               'topLeft');
      this.moveAnchor(this.refs.group, coords.x+coords.width, coords.y,               'topRight');
      this.moveAnchor(this.refs.group, coords.x+coords.width, coords.y+coords.height, 'bottomRight');
      this.moveAnchor(this.refs.group, coords.x,              coords.y+coords.height, 'bottomLeft');
    }


    render() {
      let coords = this.getCornerCoordinates(this.props);
      return (
        <Group ref='group' draggable='true' onDragEnd={this.fireOnChange}>
          <Rect
            x={coords.x} y={coords.y} width={coords.width} height={coords.height}
            opacity={this.state.opacity}
            fill={this.state.color}
            shadowBlur={10}
            onClick={this.handleClick}
          />
        </Group>
      );
    }
}

