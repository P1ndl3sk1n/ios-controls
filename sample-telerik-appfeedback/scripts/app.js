(function (global) {
	var app = global.app = global.app || {};
	var APPFEEDBACK_API_KEY = 'PLACE-YOUR-API-KEY-HERE';

	app.utils = {
	};
	
	document.addEventListener('deviceready', function () {
		try {
			feedback.initialize(APPFEEDBACK_API_KEY);
        }
		catch(err) {
			console.log('Something went wrong:');
			console.log(err);
        }
	}, false);

	app.application = new kendo.mobile.Application(document.body, { layout: 'main-layout',  skin: "flat", statusBarStyle: "black-translucent" });
})(window);
