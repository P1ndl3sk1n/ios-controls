(function (global) {
	var app = global.app = global.app || {};
	var APPFEEDBACK_API_KEY = 'PLACE-YOUR-API-KEY-HERE';

	app.utils = {
		showBusyIndicator: function(show) {
			var overlay = $('#Overlay, #Loading');
			if (show) {
				overlay.show();
			}
			else {
				overlay.hide(100);
			}
		},
        
        errorCallback: function(error, closeHandler) {
            var message = '';
            
            if (error.errors && error.errors.length > 0) {
                error.errors.forEach(function (err) {
                    message += err + '\r\n';
                });
            } else {
                message = error.message;
            }            
            
            $('#Notification').removeClass('ok').addClass('error').fadeIn('2000', function() {
				var $button = $(this).find('i');
				$button.off('click');
                $button.on('click', function() {
                  $('#Notification').removeClass('error').hide();
                    if(closeHandler) {
                        closeHandler();
                    }
                });
            })
            .find('span')
            .html((message || error).toString().replace('Bad Request:', ' '));
			app.utils.showBusyIndicator(false);
        },
        
        showSuccess: function(message) {
            $('#Notification').find('span').html(message);
			$('#Notification').removeClass('error').addClass('ok').fadeIn('2000').delay('4000').fadeOut('2000');
        }
	};
	
	document.addEventListener('deviceready', function () {
        if(feedback && location.host.indexOf('icenium.com') > -1) {
            feedback.getScreenshot = function(successCallback, errorCallback) {
                successCallback('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');
            };
                                
            feedback.getSystemInfo = function(successCallback, errorCallback) {
                successCallback({
                    model : 'In-Browser Simulator',
                    appVersion : '-',
                    cordova : '-',
                    appId : '-',
                    OSVersion : '-',
                    appName : '-',
                    widthInPixels : 0,
                    heightInPixels : 0,
                    uuid : '-',
                    userAgent : '-'
                });
			};
        }

		try {
			feedback.initialize(APPFEEDBACK_API_KEY);
        }
		catch(err) {
			app.utils.errorCallback(err);
        }

        $.shake({
    				shakethreshold: 3,
                    callback: function() {
                        app.utils.showBusyIndicator(true);
                        setTimeout(function() {
                            app.utils.showBusyIndicator(false);
                            setTimeout(function() {
								app.viewModel.goToSendFeedbackView();
                            }, 150);
                        }, 1000);
                    }
                });
	}, false);

	app.application = new kendo.mobile.Application(document.body, { layout: 'main-layout'});
})(window);
