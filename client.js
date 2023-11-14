const mqtt = require('mqtt');
const fs = require('fs')

const { createClient } = require('@supabase/supabase-js');

var KEY = fs.readFileSync('certificates/ca/privkey.pem');
var CERT = fs.readFileSync('certificates/ca/fullchain.pem');
//var CA = fs.readFileSync('certificates/ca.crt');
//var KEY = fs.readFileSync('certificates/server.key');
//var CERT = fs.readFileSync('certificates/server.crt');

const SUPABASE_URL = 'https://xkpwrffbgsztcfolwrfm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcHdyZmZiZ3N6dGNmb2x3cmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg3OTIyMzAsImV4cCI6MjAxNDM2ODIzMH0.ifsxlRVbKZf3JX5sUGzHfdSh8bZoIIoOSEmxMS6djZc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

var options = {
    rejectUnauthorized:true,
    key: KEY,
    cert: CERT,
    username: "ohmio",
    password: "9aRUBZ9SETTLzYK"
}
const client = mqtt.connect('mqtts://mqtt.ohmio.org', options);
//const client = mqtt.connect('mqtts://65.21.155.237:8883', options);

client.stream.on('error', (err) => {
    console.log('error in mqtt', err);
    client.end()
});

client.on('connect', function () {
    console.log('Connected to the broker');

    // Subscribing to a topic
    client.subscribe('UUID/Database', function (err) {
        if (!err) {
            console.log('Successfully subscribed to UUUID/Database');
        } else {
            console.error('Error subscribing to UUUID/Database:', err);
        }
    });

    client.subscribe('UUID/SensorList', function (err) {
        if (!err) {
            console.log('Successfully subscribed to UUUID/SensorList');
        } else {
            console.error('Error subscribing to UUUID/SensorList:', err);
        }
    });

    client.subscribe('UUID/OhmioList', function (err) {
        if (!err) {
            console.log('Successfully subscribed to UUUID/OhmioList');
        } else {
            console.error('Error subscribing to UUUID/OhmioList:', err);
        }
    });

    client.subscribe('UUID/OhmioDevices', function (err) {
        if (!err) {
            console.log('Successfully subscribed to UUUID/OhmioDevices');
        } else {
            console.error('Error subscribing to UUUID/OhmioDevices:', err);
        }
    });

    client.subscribe('UUID/App', function (err) {
        if (!err) {
            console.log('Successfully subscribed to UUUID/App');
        } else {
            console.error('Error subscribing to UUUID/App:', err);
        }
    });

    client.subscribe('UUID/Dependency', function (err) {
        if (!err) {
            console.log('Successfully subscribed to UUUID/Dependency');
        } else {
            console.error('Error subscribing to UUUID/Dependency:', err);
        }
    });

});

client.on('message', async function (topic, message) {

    if (topic === 'UUID/Database') {
        console.log(`Received message on ${topic}: ${message.toString()}`);
        const databaseData = JSON.parse(message.toString());
        const sensor_mac = databaseData['sensor_mac'];
        console.log(`sensor_mac ${sensor_mac}`);
        const mac_address = await supabase.from('sensor').select('mac_address').eq('sensor_mac', sensor_mac);
        const user_id = await supabase.from('ohmio').select('user_id').eq('mac_address', mac_address['data'][0]['mac_address']);
        const { data, error } = await supabase
            .from(`${user_id['data'][0]['user_id']}_sensor_mac${sensor_mac}`)
            .insert([{ data: databaseData['data']}]);

        if (error) {
            console.error('Error saving to Supabase (UUID/Database):', error);
        } else {
            console.log('Data saved to Supabase (UUID/Database):', data);
        }
    }



    if (topic === 'UUID/SensorList') {

        const jsonSensorList = JSON.parse(message.toString());
        console.log(jsonSensorList);
        const sensor_mac = jsonSensorList['list'][0]['sensor_mac'];
        const mac_address = await supabase.from('sensor').select('mac_address').eq('sensor_mac', sensor_mac);
        const user_id = await supabase.from('ohmio').select('user_id').eq('mac_address', mac_address['data'][0]['mac_address']);
        
        jsonSensorList['list'].forEach(async sensor => {
            const { data, error } = await supabase
                .from(`${user_id['data'][0]['user_id']}_connected_sensors`)
                .insert([{
                    sensor_mac: sensor.sensor_mac,
                    cfg_code: sensor.cfg_code,
                    version: sensor.version
                }]);
            if (error) {
                console.error('Error saving to Supabase (UUID/SensorList):', error);
            } else {
                console.log('Data saved to Supabase (UUID/SensorList):', data);
            }
        })
    }

   /* if (topic === 'UUID/OhmioList') {

        const jsonOhmioList = JSON.parse(message.toString());
        console.log(jsonOhmioList);
        const user_id = await supabase.from('ohmio').select('user_id').eq('mac_address', jsonOhmioList['list'][0]['ohmio_mac'])
        jsonOhmioList['list'].forEach(async ohmio => {
            const { data, error } = await supabase.from(`${user_id['data'][0]['user_id']}_conntected_ohmios`).insert(
                [{
                    ohmio_mac: ohmio.ohmio_mac
                    //version: ohmio.version
                }]
            );

            if (error) {
                console.error('Error saving to Supabase (UUID/OhmioList):', error);
            } else {
                console.log('Data saved to Supabase (UUID/OhmioList):', data);
            }
        });
    }*/

    if (topic === 'UUID/OhmioDevices') {
        const pubToApp = JSON.parse(message.toString());
        if (pubToApp.state) {
            if (pubToApp.state === "HIGH") {

            }
        } else {
            if (pubToApp) {
                console.log('Application running')
            } else {
                console.log('Application not running');
            }
        }
    }

    if (topic === 'UUID/App') {
        const liveData = JSON.parse(message.toString());

        const sensor_mac = console.log(liveData.sensor_mac);
        const data = console.log(liveData.data);

    }


    if (topic == 'UUID/Dependency') {
        const jsonDependency = JSON.parse(message.toString());

        const dependency = jsonDependency.dependency;
        const ifSensor = jsonDependency.if;
        const operator = jsonDependency.operator;
        const value = jsonDependency.value;
        const target = jsonDependency.target;

        if (operator == '=' || operator == '==') {

        }
        if (operator == '<') {

        }
        if (operator == '<=') {

        }
        if (operator == '>') {

        }
        if (operator == '>=') {

        }
        /*
                const jsonResponse = JSON.parse(message.toString());
                var result = data.filter(x => x.name === "Blofeld");
                if(message.toString().toUpperCase().contains('STATE')){
                    const actuatorMac = jsonResponse.actuatorMac;
                    const state = jsonResponse.state;
                    if(state.toUpperCase()=="HIGH"){
        
                    }
                    if(state.toUpperCase()=="LOW"){
        
                    }
                }else{
                    const jsonDependency = JSON.parse(message.toString());
        
                    const dependency = dependency.dependency;
                    const ifSensor = dependency.if;
                    const operator = dependency.operator;
                    const value = dependency.value;
                    const target = dependency.target;
            
                    if(operator == '=' || operator == '=='){
            
                    }
                    if(operator == '<'){
            
                    }
                    if(operator == '<='){
            
                    }
                    if(operator == '>'){
            
                    }
                    if(operator == '>='){
            
                    }
                }
                */

    }


});