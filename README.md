# Vallox MQTT bridge
Publishes metrics of your Vallox ventilation unit to an MQTT broker

## Docker

### Build

`docker buildx build --platform=linux/arm/v7,linux/amd64 -t mruettgers/vallox-mqtt-bridge .`

To push to the registry add `--push`.
 Build

`docker buildx build --platform=linux/arm/v7,linux/amd64 -t mruettgers/vallox-mqtt-bridge .`

To push to the registry add `--push`.

### Run
`docker run -v config.yml:/opt/valox-mqtt-bridge/config.yml mruettgers/vallox-mqtt-bridge`