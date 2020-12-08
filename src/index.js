const Vallox = require('@danielbayerlein/vallox-api')
const YAML = require('yaml')
const fs = require('fs')
const mqtt = require('mqtt')

const configFile = process.argv[2] || 'config.yml'
console.log(`Loading config from file ${configFile}`)

const fh = fs.readFileSync(configFile, 'utf8')
const config = YAML.parse(fh)
if (config.mqtt.base_topic.substr(-1,1) === '/') {
    config.mqtt.base_topic = config.mqtt.base_topic.substr(0,config.mqtt.base_topic.length-1)
}

const mqtt_client = mqtt.connect(`mqtt://${config.mqtt.broker.host}`)
const vallox_client = new Vallox({ ip: config.valox.unit.host, port: config.valox.unit.port })


// Get all profiles
const getProfiles = () => {
    mqtt_client.publish(`${config.mqtt.base_topic}/profiles/value`, JSON.stringify(vallox_client.PROFILES))
}

// Get current profile
const getProfile = () => {
    try {
        vallox_client
            .getProfile()
            .then((profile) => {
                mqtt_client.publish(`${config.mqtt.base_topic}/profile/value`, profile.toString())
            })
            .catch(console.error)
    }
    catch (err) {
        console.error(err)
    }
}

// Set current profile
const setProfile = (payload) => {
    try {
        const params = { profile, duration = null} = isNaN(payload) ? JSON.parse(payload) : { profile: payload }
        vallox_client
            .setProfile(parseInt(params.profile, params.duration !== null ? parseInt(params.duration) : null))
            .catch(console.error)
    } catch (err) {
        console.error(err)
    }
}

// Get Metrics
const getMetrics = (keys = null, cb) => {
    try {
        if (typeof keys === 'string') {
            keys = keys.length > 0 ? JSON.parse(keys) : []
        }
        else if (typeof keys === 'object' && !Array.isArray(keys)) {
            keys = Object.keys(keys)
        }
        return vallox_client
            .fetchMetrics(keys)
            .then((metrics) => {
                for (key in metrics) {
                    if (!metrics.hasOwnProperty(key))
                        continue
                    const topic = `${config.mqtt.base_topic}/metric/${key}/value`
                    mqtt_client.publish(topic, metrics[key] === undefined ? 'undefined' : metrics[key].toString())
                }
                cb()        
            })
            .catch((err) => {
                console.error(err)
                cb(err)
            })
    }
    catch (err) {
        console.error(err)
        cb && cb(err)
    }
}


// Set values
const setValues = (payload) => {
    try {
        const values = JSON.parse(payload)
        vallox_client
            .setValues(values)
            .catch(console.error)
    } catch (err) {
        console.error(err)
    }    
}

// Get all profiles
mqtt_client.subscribe(
    ['profiles/get', 'profile/get', 'profile/set', 'values/set', 'metrics/get']
        .map(topic => config.mqtt.base_topic + '/' + topic)
)

mqtt_client.on('message', function (topic, payload) {
    if (topic.substr(0,config.mqtt.base_topic.length) !== config.mqtt.base_topic) {
        return
    }
    topic = topic.substr(config.mqtt.base_topic.length + 1)
    const payloadAsStr = payload.toString()
    switch (topic) {
        case 'profiles/get' : getProfiles()
                              break
        case 'profile/get':   getProfile()
                              break
        case 'profile/set':   setProfile(payloadAsStr)
                              break
        case 'metrics/get':   getMetrics(payloadAsStr)
                              break
        case 'values/set':    setValues(payloadAsStr)
                              break
        
    }
})


let running = false
const fetch_metrics = () => {
    if (running)
        return
    running = true
    try {
        getMetrics(config.metrics, (err) => {
            running = false
        })
    } catch (err) {
        running = false
        console.error(err)
    }
}

fetch_metrics()
setInterval(fetch_metrics, (config.fetch_interval * 1000))