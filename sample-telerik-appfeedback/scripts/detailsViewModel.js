(function (global) {
	var app = global.app = global.app || {};

	function DetailsViewModel() {
		this.currentThread = undefined;
		this.feedbackComments = [];
		this.feedbackText = '';
		this.UID = '';

		this.loadData = function(ev) {
			var parent = app.viewModel;
			var self = parent.get('details');
			feedback.getFeedback(self.get('currentThread.Id'), function(data) {
                app.utils.showBusyIndicator(false);
				self.set('feedbackComments', data.slice(1));
				self.set('UID', self.get('currentThread.Uid'));

                var $screenshot = $('.feedback-screenshot');
                $screenshot.off('click')
                $screenshot.removeClass('zoomed');
				$screenshot.on('click', function() {
					$screenshot.toggleClass('zoomed');
				});
			}, parent.errorCallback);  
		};
        
		this.detailsViewShown = function(ev) {
			app.utils.showBusyIndicator(true);
			var self = app.viewModel.get('details');
            self.set('feedbackText', '');

			self.loadData();
		};

		this.imageUrl = function() {
			var self = app.viewModel.get('details');
			var currentThread = self.get('currentThread');
			if (currentThread && currentThread.Image && currentThread.Image.Uri) {
				return currentThread.Image.Uri;
			}

			return '';
		};
        
		this.author = function() {
			var self = app.viewModel.get('details');
			var currentThread = self.get('currentThread');
			if (currentThread) {				
				return currentThread.Author || currentThread.Uid;
			}

			return 'Anonymous';
		};
		
		this.createdAt = function() {
			var self = app.viewModel.get('details');
			var currentThread = self.get('currentThread');
			if (currentThread && currentThread.CreatedAt) {
				return kendo.toString(new Date(currentThread.CreatedAt), 'MMMM dd, yyyy h:mm tt');
			}
			
			return "Unknown creation time";
		};
		
		this.postReply = function(ev) {
			var self = app.viewModel.get('details');
			var replyObj = {
				text: self.feedbackText, 
				uid: self.UID
			};

			self.set('feedbackText', '');
			app.utils.showBusyIndicator(true);
			feedback.postReply(self.get('currentThread.Id'), replyObj, function(data) {
				self.loadData();
			}, app.viewModel.errorCallback);
		};
	}
	
	app.detailsViewModel = kendo.observable(new DetailsViewModel());
})(window);