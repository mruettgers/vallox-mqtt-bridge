# Vallox MQTT bridge
Publishes metrics of your Vallox ventilation unit to an MQTT broker and configures the unit via MQTT commands. 

## Configuration

```yaml
fetch_interval: 300

vallox:
  unit:
    host: 10.4.35.232
    port: 80
  
mqtt:
  broker:
    host: 10.4.32.103
  base_topic: ventilation/unit/1

metrics:
  - A_CYC_FAN_SPEED
  - A_CYC_TEMP_EXTRACT_AIR
  - A_CYC_TEMP_EXHAUST_AIR
  - A_CYC_TEMP_OUTDOOR_AIR
  - A_CYC_TEMP_SUPPLY_CELL_AIR
  - A_CYC_TEMP_SUPPLY_AIR
  - A_CYC_RH_LEVEL
  - A_CYC_CO2_LEVEL
  - A_CYC_EXTR_FAN_SPEED
  - A_CYC_SUPP_FAN_SPEED
  - A_CYC_RH_VALUE
```

## Topics

### profiles/get
```
> ventilation/unit/1/profiles/get (null)  

ventilation/unit/1/profiles/value {"NONE":0,"HOME":1,"AWAY":2,"BOOST":3,"FIREPLACE":4,"EXTRA":5}
```

### profile/get
```
> ventilation/unit/1/profile/get (null)  

ventilation/unit/1/profile/value 2
```

### profile/set
```
> ventilation/unit/1/profile/set 2
```

### values/set
```
> ventilation/unit/1/values/set { "A_CYC_HOME_SPEED_SETTING": 35 }
```

### metrics/get
```
> ventilation/unit/1/metrics/get ["A_CYC_HOME_SPEED_SETTING", "A_CYC_AWAY_SPEED_SETTING"]  

ventilation/unit/1/metric/A_CYC_HOME_SPEED_SETTING/value 35
ventilation/unit/1/metric/A_CYC_AWAY_SPEED_SETTING/value 10
```

## Docker

### Build

`docker buildx build --platform=linux/arm/v7,linux/arm64,linux/amd64 -t mruettgers/vallox-mqtt-bridge .`

To push to the registry add `--push`.

### Run
`docker run -v config.yml:/config/vallox-mqtt-bridge.yml mruettgers/vallox-mqtt-bridge`


## Credits
* [vallox api](https://github.com/danielbayerlein/vallox-api) (Javascript API for Vallox ventilation units by Daniel Bayerlein)


## License

Distributed under the MIT license.  
See [LICENSE](LICENSE) for more information.
