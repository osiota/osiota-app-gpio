<!--
Auto generated documentation:
  * Adapt schema.json and
  * Run npm run doc

Please edit schema.json or
	https://github.com/simonwalz/osiota-dev/blob/master/partials/main.md
-->
<a name="root"></a>
# osiota application gpio

*Osiota* is a software platform capable of running *distributed IoT applications* written in JavaScript to enable any kind of IoT tasks. See [osiota](https://github.com/osiota/osiota).

## Configuration: gpio


This application reads input states of GPIO pins.

**Properties**

|Name|Description|Type|
|----|-----------|----|
|`pin` (Pin number)|Not GPIO number ([See pin naming](https://www.npmjs.com/package/rpi-gpio#pin-naming))<br/>|number|
|`invert` (Invert Input Value)|e.g. for a pull down circuit<br/>|boolean|
|[`map`](#map) (Actions)||object\[\]|

**Additional Properties:** `false`<br/>
**Example**

```json
{
    "pin": 7,
    "invert": true,
    "map": [
        {
            "type": "press",
            "node": "/my-switch"
        },
        {
            "type": "longpress",
            "node": "/my-switch-long"
        }
    ]
}
```

<a name="map"></a>
### map\[\]: Actions

**Items: Action**

**Item Properties**

|Name|Description|Type|
|----|-----------|----|
|`type` (Switch Type)|Enum: `["switch","press","longpress"]`<br/>|string|
|`node` (Node Name)||string|

**Item Required Properties:** type,node<br/>
**Example**

```json
[
    {
        "type": "press",
        "node": "/my-switch"
    },
    {
        "type": "longpress",
        "node": "/my-switch-long"
    }
]
```


## How to setup

Add a configuration object for this application, see [osiota configuration](https://github.com/osiota/osiota/blob/master/doc/configuration.md):

```json
{
    "name": "gpio",
    "config": CONFIG
}
```

## License

Osiota and this application are released under the MIT license.

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/osiota/osiota/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
