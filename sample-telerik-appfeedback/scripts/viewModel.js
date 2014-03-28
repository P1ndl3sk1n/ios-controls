(function (global) {
	var app = global.app = global.app || {};
		
	function ViewModel() {
		this.imageData = '';
		this.feedbackText = '';
		this.UID = '';
		this.systemInfo = {};
		this.allFeedback = undefined;
		this.screenshotSize = {};
		
		this.errorCallback = function(error, closeHandler) {
            $('#Notification').addClass('error').fadeIn('2000', function() {
                $(this).find('i').on('click', function() {
                  $('#Notification').removeClass('error').hide();
                    if(closeHandler) {
                        closeHandler();
                    }
                })
            })
            .find('span')
            .html((error.message || error).toString().replace('Bad Request: ', ''));
			app.utils.showBusyIndicator(false);
		};

		this.imageSize = function() {
			var length = app.viewModel.get('imageData.length'),
				suffix = 'b';

			if (length > 1024) {
				length /= 1024;
				suffix = 'kb';
				if (length > 1024) {
					length /= 1024;
					suffix = 'mb';
				}
			}

			return kendo.toString(length, 'n1') + suffix;
		};

		this.submitFeedback = function(ev) {
			var self = app.viewModel;
			app.utils.showBusyIndicator(true);
			feedback.postFeedback({
									  systemInfo: self.systemInfo,
									  text: self.feedbackText,
									  imageData: self.imageData.replace('data:image/png;base64,', ''),
									  uid: self.UID
								  }, function(data) {
									  app.utils.showBusyIndicator(false);
									  app.application.navigate('#/');
									  $('#Notification').find('span').html('Feedback sent. Thank you!');
                                      $('#Notification').addClass('ok').fadeIn('2000').delay('4000').fadeOut('2000');
								  }, self.errorCallback);
		};

		this.goToSendFeedbackView = function(ev) {
			var self = app.viewModel;
            self.set('feedbackText', '');

			feedback.getScreenshot(function(base64Image) {
				feedback.getSystemInfo(function(systemInfo) {
					self.set('systemInfo', systemInfo);
					self.set('imageData', 'data:image/png;base64,' + base64Image);
					app.application.navigate('#send-feedback-view');
				}, self.errorCallback);
			}, self.errorCallback);
		};

		this.allFeedbackViewShown = function(ev) {
			var self = app.viewModel;
			if (self.get('allFeedback')) {
				return;
			}

			app.utils.showBusyIndicator(true);
			var options = {
				page: 1,
				pageSize: 50
			};
			feedback.getFeedbackList(options, function(data) {
				for (var idx = 0; idx < data.length; idx++) {
					if (data[idx].State) {
						data[idx].StateLowerCase = data[idx].State.toLowerCase();
					}
				}
				if (data.length === 0) {
					self.set('allFeedback', undefined);
                    app.utils.showBusyIndicator(false);
                    self.errorCallback('There is no feedback for this project.', function() {
                        app.application.navigate('#/');
                    });
					return;
				}
				
				var dataSource = kendo.data.DataSource.create({
																  data: data, 
																  group: 'StateLowerCase'
															  });
				var template = kendo.template($('#all-feedback-template').html());
				
				self.set('allFeedback', dataSource);
				$('#allFeedbackListView').kendoMobileListView({
																  dataSource: dataSource,
																  template: template,
																  click: function(e) {
																	  self.set('details.currentThread', e.dataItem);
																	  app.application.navigate('#feedback-details-view');
																  }
															  });
				app.utils.showBusyIndicator(false);
			}, self.errorCallback);
		};

		this.goToEditScreenshotView = function(ev) {
			var self = app.viewModel;
			var $screenshot = $('#screenshotImg');
			self.set('screenshotSize', {
						 height: $screenshot[0].naturalHeight, 
						 width: $screenshot[0].naturalWidth 
					 });
			app.application.navigate('#edit-screenshot-view');
		};
		
		this.editScreenshotViewShown = function(ev) {
			var self = app.viewModel;
			var $canvas = $('#canvas');
			var canvas = $canvas[0];

			var img = new Image();
			img.onload = function() {
                var calculatedHeight = self.screenshotSize.height - $(canvas).offset().top - 12;
				canvas.height = Math.max(canvas.height, calculatedHeight);
                var calculatedWidth = self.screenshotSize.width * canvas.height / self.screenshotSize.height;
				canvas.width = Math.max(canvas.width, calculatedWidth);
				var context = canvas.getContext("2d");
				context.clearRect(0, 0, canvas.width, canvas.height);
				
				$canvas.css({ background: 'url(' + self.imageData + ') no-repeat center center', 'background-size': '100% 100%',  border: '1px solid #999' });
                if($canvas.data('sketch')) {
                    $canvas.removeData('sketch');
                }

				$canvas.sketch({defaultColor: "red"});
			};
			img.src = self.imageData;
		};

		this.editScreenshot = function(ev) {
			var self = app.viewModel;
			var $canvas = $('#canvas');
			
			// overlay the screenshot with the drawing from the user
			var screenshot = new Image();
			screenshot.onload = function() {
				var newCanvas = $('<canvas></canvas>')[0];
				var newContext = newCanvas.getContext("2d");
				newCanvas.width = $canvas[0].width;
				newCanvas.height = $canvas[0].height;
				
				newContext.drawImage(screenshot, 0, 0, newCanvas.width, newCanvas.height);
				newContext.drawImage($canvas[0], 0, 0);
				self.set('imageData', newCanvas.toDataURL('data:image/png'));
				app.application.navigate('#:back');
            };
			screenshot.src = self.imageData;
		};

		this.details = app.detailsViewModel;
	};

	app.viewModel = new kendo.observable(new ViewModel());
})(window);
