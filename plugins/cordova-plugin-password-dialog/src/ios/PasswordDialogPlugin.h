//
//  PasswordDialogPlugin.h
//
//  Copyright (c) 2015 Justin Unterreiner. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>

@interface PasswordDialogPlugin : CDVPlugin
- (void)showEnterUserNameAndPassword:(CDVInvokedUrlCommand *)command;
- (void)showEnterPassword:(CDVInvokedUrlCommand *)command;
- (void)showConfirmPassword:(CDVInvokedUrlCommand *)command;
- (void)showChangePassword:(CDVInvokedUrlCommand *)command;
@end
