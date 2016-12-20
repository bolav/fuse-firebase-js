global = this;
var firebase = {};
var Observable = require('FuseJS/Observable');

XMLHttpRequest.prototype.old_send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (data) {
	if (data && data.constructor && data.constructor.name === "Uint8Array") {
		console.log("XMLHttpRequest Uint8Array, this does not work atm");
		data = String.fromCharCode.apply(null, data);
	}
	this.old_send(data);
}

window.navigator = this.navigator = {
    userAgent : "Fuse"
};

window.location = this.location = new Location("base");

function Location (name) {
	this.protocol = "https:";
	Object.defineProperty(this, 'href', {
	  get: function() { 
	  	return 'https://app.fuse/';
	  },
	  set: function(newValue) { console.log(name+" href setter " + newValue); },
	});
};

var _events = {};
this.addEventListener = function(type, listener, p) {
	console.log("addEventListener not implemented ("+type+")");
	if (!_events[type]) {
		_events[type] = [];
	}
	_events[type].push(listener);
};

firebase = require('/node_modules/firebase/app');
require('/node_modules/firebase/database');
require('/node_modules/firebase/auth');
require('/node_modules/firebase/storage');
require('/node_modules/firebase/messaging');
// firebase.database.INTERNAL.forceLongPolling();

module.exports = firebase;
