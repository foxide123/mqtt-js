const mqtt = require('mqtt');
const fs = require('fs');

var KEY = fs.readFileSync('certificates/ca/privkey.pem');
var CERT = fs.readFileSync('certificates/ca/fullchain.pem');

var options = {
    rejectUnauthorized:true,
    key: KEY,
    cert: CERT,
    username: "ohmio",
    password: "9aRUBZ9SETTLzYK"
}

const client = mqtt.connect('mqtts://mqtt.ohmio.org', options);
//const client = mqtt.connect('mqtt://65.21.155.237:1883', options);

client.stream.on('error', (err) => {
    console.log('error', err);
    client.end()
});

client.on('connect', function () {
    console.log('Publisher connected to the broker');

    // Publish a message to the 'Database/PubToApp' topic
    const messageToSend = {
        sensor_mac: 2,
        data: 19.0,
    }
    const updateSensors =
    {
        'list': [
            {
                sensor_mac: 1000,
                cfg_code: 1,
                version: 1
            },
            {
                sensor_mac: 123,
                cfg_code: 1,
                version: 1
            },
        ]
    }

    const ohmioList =
    {
        'list': [
            {
                ohmio_mac: '1234',
                version: 1,
            },
            {
                ohmio_mac: '145',
                version: 1,
            }

        ]
    }

    const liveData = {
        sensor_mac: '123',
        data: 10,
    }

    const pubToApp = true;

    const dependency = {
        dependency: true,
        if: 123,
        operator: '<=',
        value: 50,
        target: 488
    }

    const triggerActuator = {
        actuatorMac: 987,
        state: 'HIGH'
    }

    client.publish('UUID/Database', JSON.stringify(messageToSend), function (err) {
        if (!err) {
            console.log(`Message sent: ${messageToSend}`);
        } else {
            console.error('Error sending message:', err);
        }

        //client.end();
    });

    client.publish('UUID/SensorList', JSON.stringify(updateSensors), function (err) {
        if (!err) {
            console.log(`Message sent: ${updateSensors}`);
        } else {
            console.error('Error sending message:', err);
        }
    });

    client.publish('UUID/OhmioList', JSON.stringify(ohmioList), function(err){
        if(!err){
            console.log(`Message sent: ${ohmioList}`)
        }else{
            console.error('Error sending message:', err);
        }

       
    });

    //publishes whether the app is closed or opend
    client.publish('UUID/OhmioDevices', JSON.stringify(pubToApp),function(err){
        if(!err){
            console.log(`Message sent: ${pubToApp}`)
        }else{
            console.error('Error sending message:', err);
        }

    });

    //send live data
    client.publish('UUID/App', JSON.stringify(liveData),function(err){
        if(!err){
            console.log(`Message sent: ${liveData}`)
        }else{
            console.error('Error sending message:', err);
        }

    });

    //sets dependency between sensor - actuator
    client.publish('UUID/Dependency', JSON.stringify(dependency),function(err){
        if(!err){
            console.log(`Message sent: ${dependency}`)
        }else{
            console.error('Error sending message:', err);
        }

    });

    //sends information whether to start / stop actuator
    client.publish('UUID/OhmioDevices', JSON.stringify(triggerActuator), function(err){
        if(!err){
            console.log(`Message sent: ${triggerActuator}`)
        }else{
            console.error('Error sending message:', err);
        }
    });
    
});