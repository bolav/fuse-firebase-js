var my_fetch = this.fetch || require('node-fetch');

module.exports = function request (url, cb) {
	var uri = url;
	if (url.url) {
		uri = url.url;
	}
	var resp;
	my_fetch(uri).then(function (data) {
		resp = data;
		return data.text();
	}).then(function (text) {
		cb(null, 
			{
				statusCode: resp.status
			},
			text);
	}).catch(function (err) {
		cb(err, null, null);
	}
	);
}
