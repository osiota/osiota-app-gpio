var gpio = require('rpi-gpio');

var types = {};
types.switch = function(node, value, initial, config) {
	node.publish(undefined, value);
};
types.press = function(node, value, initial, config) {
	var delta_min = 5;
	var delta_max = 800;
	if (typeof config.delta_min === "number") delta_min = config.delta_min;
	if (typeof config.delta_max === "number") delta_max = config.delta_max;
	if (initial) {
		return;
	}
	// calculate delta to last event:
	var delta = new Date()*1 - node.state_time;
	console.log("delta", delta, node.value, value);
	// remove spices:
	//if (delta < min_spice) return;

	// debouncing:
	// state == on
	if (node.state === 1) {
		// (off->on) delta < delta_min => ignore
		if (delta < delta_min)
			return;

		// ignore raising edge, as already in state on:
		if (value) return;

		// set state on falling edge:
		node.state = 0;
		node.state_time = new Date()*1;

	// state == off
	} else {
		// (on->off) delta < delta_min => ignore
		if (delta < delta_min)
			return;

		// ignore falling edge, as already in state off:
		if (!value) return;

		// set state on raising edge.
		node.state = 1;
		node.state_time = new Date()*1;
	}

	if (node.state === 0 && delta <= delta_max) {
		// todo: toggle:
		var v = 1;
		if (node.value) v = 0;
		console.log("pressed", v);
		node.publish(undefined, v);
	}
};
types.longpress_time = function(node, value, initial, config) {
	types.press(node, value, initial, {
		delta_min: 800
	});
};
types.longpress = function(node, value, initial, config) {
	var delta_min = 1000;
	if (typeof config.delta_min === "number") delta_min = config.delta_min;

	if (initial) {
		return;
	}

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
			console.log("long pressed", v);
			node.publish(undefined, v);
		}, delta_min);
	}
	// falling edge:
	else {

	}
};

exports.init = function(node, app_config, main, host_info) {
	var _this = this;

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
	var invert = !!app_config.invert;

	node.announce([{
		"type": "gpio.input.app",
	}, app_config.metadata]);

	var map = node.map(app_config, null, false, function(c) {
		return c.type;
	}, function(n, metadata, c) {
		n.announce({
			"type": c.type + ".input"
		}, metadata);
	});

	// todo: map:
	var set = function(value, initial) {
		node.publish(undefined, value);
		types.forEach(function(a) {
			if (typeof types[a] !== "function")
				throw new Error("type not found: " + a.type);
			var cb = types[a].bind(_this);
			let n = map.node(a);
			if (n) {
				cb(n, value ^ invert, initial, n._config);
			}
		});
	};

	gpio.on('change', function(channel, value) {
		if (channel == pin) {
			set(value, false);
		}
	});
	gpio.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH, function(error) {
		if (error)
			return console.warn("Setup Error: ", error);

		gpio.read(pin, function(error, value) {
			if (error)
				return console.warn("Read Error: ", error);
			set(value, true);
		});
	});

	return [node, function() {
		gpio.destroy(function(err) {
			if (err) console.error(err);
		});
	}];
};
