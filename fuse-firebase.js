var firebase = {};
process = {};
var Observable = require('FuseJS/Observable');

window.navigator = this.navigator = {
    userAgent : "Fuse"
};

window.location = this.location = new Location("base");

function Location (name) {
	this.protocol = "https:";
	Object.defineProperty(this, 'href', {
	  get: function() { 
	  	console.log(name+ " href getter");
	  	return 'https://app.fuse/';
	  },
	  set: function(newValue) { console.log(name+" href setter " + newValue); },
	});
};

function Buffer(buf, type) {
	this.buf = buf;
	if (type === "base64") {
		this.buf = atob(buf);
	}
}
Buffer.prototype.toString = function toString(type) {
	return this.buf;
}

this.Buffer = Buffer;

function Element(args) {
	this._name = 'Element';
	this._tag = '_unk';
	this.nodeType = 1;
	this.attributes = {};

	var keys = Object.keys(args);
	for(var i in keys){
		this[keys[i]] = args[keys[i]];
	}

 	this.childNodes = [];

 	Object.defineProperty(this, 'firstChild', {
 		get: function () {
 			return this.childNodes[0];
 		}
 	});
 	Object.defineProperty(this, 'lastChild', {
 		get: function () {
 			return this.childNodes[this.childNodes.length - 1];
 		}
 	});
}

Element.prototype.appendChild = function appendChild( elem ) {
	console.log("appendChild to " + this._tag + "(" + elem._tag + ")" );
	this.childNodes.push(elem);
	this._setChildren();

	if (elem._tag.toLowerCase() === "script") {
		if (elem.src) {
			console.log("Loading " + elem.src);
			fetch(elem.src).then(function (response) {
				return response.text();
			}).then(function (resp_text) {
				console.log("Evalling " + resp_text);
				eval(resp_text);
			}).catch(function (err) {
				debug_log('CATCH: ' + err);
			});
		}
	}
	if (typeof elem.onreadystatechange === "function") {
		// loadScript(elem.src, elem.src);
		console.log("Running onreadystatechange");
		console.log(JSON.stringify(elem));
		console.log(elem.onreadystatechange.toString());
		elem.onreadystatechange();
	}

	elem.parentNode = this;
	return { appendChild : elem };
}

Element.prototype.removeChild = function removeChild( elem ) {
	console.log("removeChild from " + this._tag + "(" + elem._tag + ")" );
	var i = this.childNodes.indexOf(elem);
	if (i >= 0) {
		this.childNodes.splice(i, 1);
	}
}

Element.prototype.setAttribute = function setAttribute (name,val) {
	console.log(JSON.stringify(arguments));
	console.log("Element " + this._tag + " setAttribute " + name + ", " + val);
	this.attributes[name] = val;
};

var getElementsByTagName = function getElementsByTagName (tag, ret) {
	if (!ret) {
		console.log("getElementsByTagName " + tag);
		console.log("Called by " + this._tag + "/" + this._creator);
		ret = [];
	}
	if ((this._tag === tag) || (tag === "*")) {
		ret.push(this);
	}
	var arrayLength = this.childNodes.length;
	for (var i = 0; i < arrayLength; i++) {
		this.childNodes[i].getElementsByTagName(tag, ret);
	}
	return ret;
};

Element.prototype.getElementsByTagName = getElementsByTagName;

document = new Element({_name: "Window", _tag:"Base"});;

Element.prototype.createElement = function createElement (elem) {
	console.log("createElement: " + JSON.stringify(arguments));
	return new Element({ _tag: elem });
}

document.getElementsByTagName = function (tag) {
	return document.documentElement.getElementsByTagName(tag)
}

document.documentElement = new Element({ _creator: "documentElement", _tag: "documentElement", nodeType: 9 });

var _events = {};
this.addEventListener = function(type, listener, p) {
	console.log("addEventListener not implemented ("+type+")");
	if (!_events[type]) {
		_events[type] = [];
	}
	_events[type].push(listener);
};

firebase = require('/node_modules/firebase/app');
require('/node_modules/firebase/database-node');
require('/node_modules/firebase/auth');
require('/node_modules/firebase/storage');
firebase.database.INTERNAL.forceLongPolling();

module.exports = firebase;
