import React from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import { withStyles, createStyleSheet } from 'material-ui/styles';



class AppbarComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {training: true};
  }

  onTraining = () => {
    this.setState({'training': true});
    this.setState({'testing': false});
    this.props.onSourceChange('objects_train');
  }

  onTesting = () => {
    this.setState({'testing': true});
    this.setState({'training': false});
    this.props.onSourceChange('objects_test');
  }

  render() {
    const frame = this.props.frame;
    const classes = this.props.classes;

    return (
      <AppBar position="static">
        <Toolbar>
          <Typography color="inherit" type="title"  >Video: {frame.metadata.id}</Typography>
          <Button color="inherit">Frame: {frame.number}</Button>
          <Typography className={classes.flex}></Typography>
          <Button onClick={this.onTraining} color="contrast" disabled={this.state.training}>Training</Button>
          <Button onClick={this.onTesting} color="contrast" disabled={this.state.testing}>Testing</Button>
        </Toolbar>
      </AppBar>
    );
  }
}


AppbarComponent.defaultProps = {
};


const styleSheet = createStyleSheet('ButtonAppBar', {
  root: {
    marginTop: 30,
    width: '100%'
  },
  flex: {
    flex: 1
  }
});

export default withStyles(styleSheet)(AppbarComponent);