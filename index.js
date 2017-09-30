//var gpio = require('rpi-gpio-mod');
var gpio = require('rpi-gpio-mod');

var types = {};
types.switch = function(node, value, initial) {
	node.publish(undefined, value);
};
types.press = function(node, value, initial, delta_min, delta_max) {
	if (typeof delta_min !== "number") delta_min = 5;
	if (typeof delta_max !== "number") delta_max = 800;
	console.log("press" + delta_max, value, initial);
	if (!initial) {
		// falling edge:
		if (!value) {
			var delta = new Date()*1 - node.state_time;
			console.log("delta", delta, node.value);
			if (delta > delta_min && delta <= delta_max) {
				var v = 1;
				if (node.value) v = 0;
				console.log("pressed", v);
				node.publish(undefined, v);
			}
		} else {
			node.state_time = new Date()*1;
		}
	}
};
types.longpress_time = function(node, value, initial) {
	types.press(node, value, initial, 800, 0); 
};
types.longpress = function(node, value, initial, delta_min, delta_max) {
	if (typeof delta_min !== "number") delta_min = 1000;
	if (!initial) {
		if (node.longpress_t) {
			clearTimeout(node.longpress_t);
			node.longpress_t = null;
		}
		// raising edge:
		if (value) {
			node.longpress_t = setTimeout(function() {
				node.longpress_t = null;

				var v = 1;
				if (node.value) v = 0;
				console.log("pressed", v);
				node.publish(undefined, v);
			}, delta_min);
		}
	}
};

exports.init = function(node, app_config, main, host_info) {
	var pin = 7;
	if (typeof app_config.pin === "number")
		pin = app_config.pin;
	var action = [{type: 'switch'}];
	if (typeof app_config.action === "string") {
		action = [ {type: app_config.action} ];
	}
	if (Array.isArray(app_config.action)) {
		action = app_config.action;
	}
	if (!Array.isArray(action)) {
		throw new Error("action is not array.");
	}
	var invert = false;
	if (typeof app_config.invert) {
		invert = true;
	}

	var set = function(value, initial) {
		action.forEach(function(a) {
			if (typeof types[a.type] !== "function")
				throw new Error("type not found: " + a.type);
			var cb = types[a.type];
			var n = node;
			if (a.node) {
				n = a.node;
			}
			
			cb(n, value ^ invert, initial);
		});
	};


	gpio.on('change', function(channel, value) {
		if (channel == pin) {
			set(value, 0);
		}
	});
	gpio.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH, function(error) {
		if (error)
			return console.warn("Setup Error: ", error);

		gpio.read(13, function(error, value) {
			if (error)
				return console.warn("Read Error: ", error);
			set(value, 1);
		});
	});

	return [function() {
		gpio.destroy();
	}];
};
