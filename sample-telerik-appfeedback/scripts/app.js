(function (global) {
	var app = global.app = global.app || {};
	var APPFEEDBACK_API_KEY = '58180300-f534-11e3-b31e-a520f3d91889';

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
