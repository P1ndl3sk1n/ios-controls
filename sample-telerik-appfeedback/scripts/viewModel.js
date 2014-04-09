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

		this.submitFeedback = function (ev) {
			var self = app.viewModel;
			app.utils.showBusyIndicator(true);
			feedback.postFeedback({
				systemInfo: self.systemInfo,
				text: self.feedbackText,
				imageData: self.imageData.replace('data:image/png;base64,', ''),
				uid: self.UID
			}, function (data) {
				app.utils.showBusyIndicator(false);
				$('#Notification').find('span').html('Feedback sent. Thank you!');
				$('#Notification').addClass('ok').fadeIn('2000').delay('4000').fadeOut('2000');
			}, app.utils.errorCallback);
		};

		this.goToSendFeedbackView = function (ev) {
			var self = app.viewModel;
			self.set('feedbackText', '');

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
				var desiredWidth = Math.round($('html').width() - 2 * $origCanvas.offset().left);

				canvas.width = desiredWidth;
				canvas.height = Math.round(img.naturalHeight * (desiredWidth / img.naturalWidth));

				context.webkitImageSmoothingEnabled = false;
				context.mozImageSmoothingEnabled = false;
				context.imageSmoothingEnabled = false; /// future

				context.drawImage(img, 0, 0, canvas.width, canvas.height);

				if (done && $.isFunction(done)) {
					done();
				}
			};

			img.src = image;
		};

		this.onScreenshotTap = function (ev) {
			var $screenshotCanvas = $('#screenshotCanvas');
			var screenX = ev.touch.x.screen;
			var screenY = ev.touch.y.screen;

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
		};

		this.drawPointOnCanvas = function (canvas, point) {
			var context = canvas[0].getContext('2d');

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
			self.drawImageOnCanvas($('#screenshotCanvas'), self.imageData);
			self.clearFeedbackText();
			$('#modal-view').data('kendoMobileModalView').close();
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
				app.utils.errorCallback('Text cannot be empty.');
			} else {
				self.points.push({
					x: self.lastPoint.x,
					y: self.lastPoint.y,
					text: self.feedbackText
				});

				self.lastPoint.text = self.feedbackText;
				self.clearFeedbackText();
				$('#modal-view').data('kendoMobileModalView').close();
				//hide error message if shown
			}
		};

		this.sendFeedbackItems = function () {
			$('#send-all-view').data('kendoMobileModalView').open();
		};

		this.doneSendFeedbackItems = function () {
			var self = app.viewModel,
				canvas = $('<canvas></canvas>'),
				item = {};

			if (self.points && self.points.length > 0) {
				app.utils.showBusyIndicator(true);
				self.drawImageOnCanvas(canvas, self.originalImageData, function () {
					self.drawPointOnCanvas(canvas, self.lastPoint);
					img = canvas[0].toDataURL('data:image/png');

					item = {
						systemInfo: self.systemInfo,
						text: self.lastPoint.text,
						imageData: img.replace('data:image/png;base64,', ''),
						uid: self.UID
					};

					feedback.postFeedback(item,
						function (data) {
							app.utils.showBusyIndicator(false);
							$('#Notification').find('span').html('Feedback sent. Thank you!');
							$('#Notification').addClass('ok').fadeIn('2000').delay('4000').fadeOut('2000');
							app.application.navigate('#/');
						}, app.utils.errorCallback);

					$('#send-all-view').data('kendoMobileModalView').close();
				});
			} else {
				app.application.navigate('#/');
			}
		};

		this.cancelSendFeedbackItems = function () {
			$('#send-all-view').data('kendoMobileModalView').close();
		};

		this.details = app.detailsViewModel;
	}

	app.viewModel = new kendo.observable(new ViewModel());
})(window);