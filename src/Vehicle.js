/**
 * @file: Vehicle.js
 * @author: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 * Date: 04.10.2017
 * Last Modified Date: 04.10.2017
 * Last Modified By: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 */

import React, { Component } from 'react'
import { Token, DMR, Vehicle } from './CarStore'
import Utils from './utils/contracts'

/* UI Components */
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper'; 

import './App.css'
import './css/open-sans.css'

let id = 0;



class VehicleComponent extends Component {

    constructor(props){
        super(props)

        this.state = { vehicle: null, id: id++ }
    }

    componentWillReceiveProps(nextProps) {
        console.log("componentWillReceiveProps")
        if(this.state.vehicle == null && Utils.isAddress(nextProps.value)){
            let vehicle = new Vehicle(nextProps.value); 
            vehicle.subscribe(this.state.id, vehicle => this.setState({ vehicle: vehicle }))
        }
    }


    componentDidMount() {
        console.log("componentWillMount");
        if(this.state.vehicle != null){
            this.state.vehicle.subscribe(this.state.id, vehicle => this.setState({ vehicle: vehicle }))
        }
    }

    componentWillUnmount() { 
        console.log("componentWillUmount");
        if(this.state.vehicle != null){
            this.state.vehicle.unsubscribe(this.state.id)
        }
    }

    render() {

        /* Should show loading until vehicle is ready */
        if(this.state.vehicle == null) return ( <span>Loading...</span> )
        return (
            <Paper className={this.props.classes.control}>
            <Card className={this.props.classes.card}>
            <CardContent>
            <Typography type="headline" component="h2">
            Lizard
            </Typography>
            <Typography component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
            </Typography>
            </CardContent>
            <CardActions>
            <Button dense color="primary">
            Share
            </Button>
            <Button dense color="primary">
            Learn More
            </Button>
            </CardActions>
            </Card>
            </Paper>
        );
    }
}

const styles = { 
    card: { maxWidth: 345 },
    control: { padding: 16 }
}

export default withStyles(styles)(VehicleComponent)
