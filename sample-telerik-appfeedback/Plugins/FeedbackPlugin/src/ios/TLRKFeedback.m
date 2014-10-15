//
//  TLRKFeedback.m
//  Telerik AppFeedback Plugin
//
//  Copyright (c) 2014 Telerik. All rights reserved.
//

#import "TLRKFeedback.h"
#import <Cordova/UIDevice+Extensions.h>
#import <TelerikUI/TKFeedbackController.h>
#import <TelerikUI/TKPlatformFeedbackSource.h>
@implementation TLRKFeedback

@synthesize webView;

TKFeedbackController *feedbackController;

-(void)initialize: (CDVInvokedUrlCommand *)command
{
    NSString *apiKey = command.arguments[0];
    NSString *uid = [[[UIDevice currentDevice] uniqueAppInstanceIdentifier] lowercaseString];

    UIWindow *currentWindow = [UIApplication sharedApplication].keyWindow;
    UIViewController *currentRootViewController = currentWindow.rootViewController;
    if(![currentRootViewController isKindOfClass:[TKFeedbackController class]])
    {
        feedbackController = [[TKFeedbackController alloc] init];
        feedbackController.dataSource = [[TKPlatformFeedbackSource alloc] initWithKey:apiKey uid:uid];

        [currentWindow setRootViewController:feedbackController];
        feedbackController.contentController = currentRootViewController;
    }
    else
    {
        ((TKFeedbackController *)currentRootViewController).dataSource = [[TKPlatformFeedbackSource alloc] initWithKey:apiKey uid:uid];
    }

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

-(void)showFeedback: (CDVInvokedUrlCommand *)command
{
    if (feedbackController != NULL) {
        [feedbackController showFeedback];
    }
}
@end
