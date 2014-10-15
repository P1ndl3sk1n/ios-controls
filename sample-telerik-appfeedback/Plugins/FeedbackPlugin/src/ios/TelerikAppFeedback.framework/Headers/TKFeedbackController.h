//
//  TKFeedbackController.h
//  TelerikUI
//
//  Copyright (c) 2014 Telerik. All rights reserved.
//

@protocol TKFeedbackDataSource;

/**
 The Feedback ViewController used to provide feedback service and storage for the application.
 */
@interface TKFeedbackController : UIViewController

/**
 Initializes the feedback controller.
 @param contentController The view controller that can be used as a root view controller in the application.
 */
- (id)initWithContentController:(UIViewController *)contentController;

/**
 The view controller that contain root view controller (read-only).
 */
@property (nonatomic, strong) UIViewController *contentController;

/**
 The data source used to provide the feedback service and storage.
 */
@property (nonatomic, strong) id<TKFeedbackDataSource> dataSource;

/**
 Defines whether the controller’s built-in action sheet will shown on shake the device.
 */
@property (nonatomic) BOOL showOnShake;

/**
 Shows the built-in feedback action sheet ('Send Feedback', 'Your Feedback', 'Settings')
 */
- (void)showFeedback;

/**
 Takes a snapshot of the current application screen and creates a new feedback item ready to be added and sent/saved to the data source provider.
 */
- (void)sendFeedback;

@end
