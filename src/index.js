const Vallox = require('@danielbayerlein/vallox-api')
const YAML = require('yaml')
const fs = require('fs')
const mqtt = require('mqtt')

const configFile = process.argv[2] || 'config.yml'
console.log(`Loading config from file ${configFile}`)

const fh = fs.readFileSync(configFile, 'utf8')
const config = YAML.parse(fh)

const mqtt_client = mqtt.connect(`mqtt://${config.mqtt.broker.host}`)
const vallox_client = new Vallox({ ip: config.valox.unit.host, port: config.valox.unit.port })


let running = false

const run = () => {
    if (running)
        return
    running = true
    try {

        vallox_client
            .fetchMetrics(config.metrics)
            .then((result) => {
                running = false
                for (key in result) {
                    if (!result.hasOwnProperty(key))
                        continue
                    const topic = `${config.mqtt.topic}/${key}/value`
                    mqtt_client.publish(topic, result[key].toString())
                }
            })
    } catch (e) {
        running = false
        throw e
    }
}

run()
setInterval(run, (config.interval * 1000))