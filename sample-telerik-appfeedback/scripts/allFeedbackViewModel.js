(function (global) {
	var app = global.app = global.app || {};

	function AllFeedbackViewModel() {

		this.allFeedback = undefined;
		this.allFeedbackViewShown = function(ev) {
			var self = app.allFeedbackViewModel;
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
                    app.utils.showBusyIndicator(false);
                    app.utils.errorCallback('There is no feedback for this project.', function() {
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
				var $listView = $('#allFeedbackListView');
				var kendoListView = $listView.data("kendoMobileListView");
				if (!kendoListView) {
					$listView.kendoMobileListView({
																  dataSource: dataSource,
																  template: template,
																  click: function(e) {
																	  app.viewModel.set('details.currentThread', e.dataItem);
																	  app.application.navigate('#feedback-details-view');
																  }
															  });
				} else {
					kendoListView.setDataSource(dataSource);
				}
				app.utils.showBusyIndicator(false);
			}, app.utils.errorCallback);
		};
	}
    
	app.allFeedbackViewModel = kendo.observable(new AllFeedbackViewModel());
})(window);