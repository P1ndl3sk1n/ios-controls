(function (global) {
	var app = global.app = global.app || {};

	function ViewModel() {
		this.imageData = '';
		this.feedbackText = '';
		this.UID = '';
		this.systemInfo = {};
		this.screenshotSize = {};
		this.points = [];
		this.originalImageData = '';
		this.lastSubmittedUID = '';

		this.clearFeedbackText = function () {
			var self = app.viewModel;
			self.set('feedbackText', '');
		};

		this.imageSize = function () {
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

		this.goToSendFeedbackView = function (ev) {
			var self = app.viewModel;
			self.set('feedbackText', '');
			
			// set this in case user has submitted replies on details view
			self.set('UID', self.lastSubmittedUID);

			feedback.getScreenshot(function (base64Image) {
				feedback.getSystemInfo(function (systemInfo) {
					self.set('systemInfo', systemInfo);
					self.set('originalImageData', 'data:image/png;base64,' + base64Image);
					self.set('imageData', 'data:image/png;base64,' + base64Image);
					app.application.navigate('#send-feedback-view');
				}, app.utils.errorCallback);
			}, app.utils.errorCallback);
		};

		this.drawImageOnCanvas = function ($canvas, image, done) {
			var canvas = $canvas[0];
			var context = canvas.getContext('2d');
			var $origCanvas = $('#screenshotCanvas');

			var img = new Image();
			img.onload = function () {
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;

				if(window.devicePixelRatio) {
					$canvas.css('width', canvas.width / window.devicePixelRatio);
					$canvas.css('height', canvas.height / window.devicePixelRatio);
				}
				
				context.drawImage(img, 0, 0);

				if (done && $.isFunction(done)) {
					done();
				}
			};

			img.src = image;
		};

		this.onScreenshotTap = function (ev) {
			var $screenshotCanvas = $('#screenshotCanvas');
			var screenX = ev.touch.x.location;
			var screenY = ev.touch.y.location;

			var canvasXOffset = $screenshotCanvas.offset().left;
			var canvasYOffset = $screenshotCanvas.offset().top;

			var canvasX = screenX - canvasXOffset;
			var canvasY = screenY - canvasYOffset;

			app.viewModel.lastPoint = {
				x: canvasX,
				y: canvasY
			};

			app.viewModel.drawPointOnCanvas($screenshotCanvas, app.viewModel.lastPoint);
			$('#modal-view').data('kendoMobileModalView').open();
            setTimeout(function () {
                $('#feedback-textarea').focus();
            }, 20);
		};

		this.drawPointOnCanvas = function (canvas, point) {
			var context = canvas[0].getContext('2d');
			context.scale(window.devicePixelRatio, window.devicePixelRatio);

			context.strokeStyle = 'red';
			context.fillStyle = 'red';
			context.beginPath();
			context.arc(point.x, point.y, 13, 0, Math.PI * 2);
			context.fill();

			context.beginPath();
			context.arc(point.x, point.y, 6, 0, Math.PI * 2);
			context.fillStyle = 'white';
			context.fill();
		};

		this.cancelFeedback = function () {
			var self = app.viewModel;
			var $canvas = $('#screenshotCanvas');
			self.drawImageOnCanvas($canvas, self.originalImageData, function () {
				for (var idx = 0; idx < self.points.length; idx++) {
					self.drawPointOnCanvas($canvas, self.points[idx]);
				}
				self.clearFeedbackText();
				$('#modal-view').data('kendoMobileModalView').close();
			});
		};

		this.onSendFeedbackViewShown = function () {
			var self = app.viewModel;
			var $canvas = $('#screenshotCanvas');
			self.drawImageOnCanvas($canvas, self.imageData);
			self.points = [];
		};

		this.saveFeedback = function (ev) {
			var self = app.viewModel;

			if (self.feedbackText.trim().length === 0) {
				app.utils.errorCallback('Text cannot be empty');
			} else {
				self.points.push({
					x: self.lastPoint.x,
					y: self.lastPoint.y,
					text: self.feedbackText
				});

				self.clearFeedbackText();
				$('#modal-view').data('kendoMobileModalView').close();
				//hide error message if shown
			}
		};

		this.sendFeedbackItems = function () {
			var self = app.viewModel;
			if (self.points && self.points.length > 0) {
				$('#send-all-view').data('kendoMobileModalView').open();
                setTimeout(function () {
                	$('#FeedbackFrom').focus();
            	}, 20);
			} else {
				app.utils.errorCallback('Tap on screenshot to leave feedback!');
			}
		};

		this.doneSendFeedbackItems = function () {
			var self = app.viewModel,
				canvas = $('<canvas></canvas>'),
				item = {},
				callbacksFinished = 0;

			if (self.points && self.points.length > 0) {
				app.utils.showBusyIndicator(true);
				self.points.forEach(function (point) {
					self.drawImageOnCanvas(canvas, self.originalImageData, function () {
						self.drawPointOnCanvas(canvas, point);
						img = canvas[0].toDataURL('data:image/png');

						item = {
							systemInfo: self.systemInfo,
							text: point.text,
							imageData: img.replace('data:image/png;base64,', ''),
							uid: self.UID
						};

						feedback.postFeedback(item,
							function (data) {
								callbacksFinished++;
								if (callbacksFinished === self.points.length) {
									// set lastSubmittedUID so other screens (details view, etc.) can know the last used uid
									self.set('lastSubmittedUID', self.UID);
									app.utils.showSuccess('Feedback sent. Thank you!');
									app.utils.showBusyIndicator(false);
                                    self.navigateToRoot();
								}
							}, function(error) {
                                callbacksFinished++;
                                app.utils.errorCallback(error);
                            });

						$('#send-all-view').data('kendoMobileModalView').close();
					});
				});
			}
		};

		this.cancelSendFeedbackItems = function () {
			$('#send-all-view').data('kendoMobileModalView').close();
		};
        
        this.navigateToRoot = function (e) {
            var self = app.viewModel,
            	$canvas = $('#screenshotCanvas');
            
			self.set('lastPoint', null);
            self.set('points', []);
            $canvas [0].getContext("2d").clearRect(0, 0, $canvas .width(), $canvas .height());

            if (!e) {
            	app.application.navigate('#/');
            }
        };

		this.details = app.detailsViewModel;
	}

	app.viewModel = new kendo.observable(new ViewModel());
})(window);