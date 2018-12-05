//
//  PasswordDialogPlugin.m
//
//  Copyright (c) 2015 Justin Unterreiner. All rights reserved.
//

#import "PasswordDialogPlugin.h"

@implementation PasswordDialogPlugin

#pragma mark - Cordova Commands

- (void)showEnterUserNameAndPassword:(CDVInvokedUrlCommand *)command {
    
    // Ensure we have the correct number of arguments.
    if ([command.arguments count] != 5) {
        CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"A title, message, minLength, userNamePlaceholder, defaultUserName are required."];
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
        return;
    }
    
    // Obtain the arguments.
    NSString* title = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];
    int minLength = [command.arguments objectAtIndex:2] ? [[command.arguments objectAtIndex:2] intValue] : -1;
    NSString* userNamePlaceholder = [command.arguments objectAtIndex:3];
    NSString* defaultUserName = [command.arguments objectAtIndex:4];
    
    // Validate and/or default the arguments.
    
    if (title == nil) {
        title = @"Enter Credentials";
    }
    
    if (message == nil) {
        message = @"";
    }
    
    if (userNamePlaceholder == nil) {
        userNamePlaceholder = @"User Name";
    }
    
    if (defaultUserName == nil) {
        defaultUserName = @"";
    }
    
    [self showEnterUserNameAndPasswordPromptWithTitle:title
                                           andMessage:message
                                         andMinLength:minLength
                               andUserNamePlaceholder:userNamePlaceholder
                                   andDefaultUserName:defaultUserName
                                        forCallbackId:command.callbackId];
}

- (void)showEnterPassword:(CDVInvokedUrlCommand *)command {
    
    // Ensure we have the correct number of arguments.
    if ([command.arguments count] != 3) {
        CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"A title, message, and minLength are required."];
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
        return;
    }
    
    // Obtain the arguments.
    NSString* title = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];
    int minLength = [command.arguments objectAtIndex:2] ? [[command.arguments objectAtIndex:2] intValue] : -1;
    
    // Validate and/or default the arguments.
    
    if (title == nil) {
        title = @"Enter Password";
    }
    
    if (message == nil) {
        message = @"";
    }
    
    [self showEnterPasswordPromptWithTitle:title
                                andMessage:message
                              andMinLength:minLength
                             forCallbackId:command.callbackId];
}

- (void)showConfirmPassword:(CDVInvokedUrlCommand *)command {
    
    // Ensure we have the correct number of arguments.
    if ([command.arguments count] != 3) {
        CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"A title, message, and minLength are required."];
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
        return;
    }
    
    // Obtain the arguments.
    NSString* title = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];
    int minLength = [command.arguments objectAtIndex:2] ? [[command.arguments objectAtIndex:2] intValue] : -1;
    
    // Validate and/or default the arguments.
    
    if (title == nil) {
        title = @"Confirm Password";
    }
    
    if (message == nil) {
        message = @"";
    }
    
    [self showConfirmPasswordPromptWithTitle:title
                                  andMessage:message
                                andMinLength:minLength
                               forCallbackId:command.callbackId];
}

- (void)showChangePassword:(CDVInvokedUrlCommand *)command {

    // Ensure we have the correct number of arguments.
    if ([command.arguments count] != 3) {
        CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"A title, message, and minLength are required."];
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
        return;
    }

    // Obtain the arguments.
    NSString* title = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];
    int minLength = [command.arguments objectAtIndex:2] ? [[command.arguments objectAtIndex:2] intValue] : -1;

    // Validate and/or default the arguments.

    if (title == nil) {
        title = @"Change Password";
    }

    if (message == nil) {
        message = @"";
    }

    [self showChangePasswordPromptWithTitle:title
                                 andMessage:message
                                 andMinLength:minLength
                              forCallbackId:command.callbackId];
}

#pragma mark - Shared Helper Methods

/**
 * Helper used to ensure the given alert controller is presented on the active view controller.
 */
- (void)presentAlertOnCurrentViewController:(UIAlertController*)alert {

    // Grab the view controller that is currently presented.
    UIViewController *currentViewController = [[[UIApplication sharedApplication] delegate] window].rootViewController;

    // Now present the alert on the view controller that is currently presenting.
    if (currentViewController) {

        // Note that since Cordova's view controller may not be the one that is currently
        // presented (eg if another plugin that uses native controllers such as the InAppBrowser
        // is currently presenting) we have to do some extra checking. So here we dig down
        // and find the current view controller.
        while (currentViewController.presentedViewController){
            currentViewController = currentViewController.presentedViewController;
        }

        [currentViewController presentViewController:alert animated:YES completion:nil];
    }
    else {
        // Fallback and present on Cordova's view controller.
        [self.viewController presentViewController:alert animated:YES completion:nil];
    }
}

#pragma mark - Enter User Name And Password Helper Methods

/**
 * Helper used to show a simple validation message.
 */
- (void)showEnterUserNameAndPasswordValidationMessage:(NSString*) message
                                            withTitle:(NSString*) title
                                        forCallbackId:(NSString*) callbackId
                                     andOriginalTitle:(NSString*) originalTitle
                                   andOriginalMessage:(NSString*) originalMessage
                                         andMinLength:(int) minLength
                               andUserNamePlaceholder:(NSString*) userNamePlaceholder
                                   andDefaultUserName:(NSString*) defaultUserName
    {

    // Build the alert view.

    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    // Build the action handler.
    UIAlertAction* alertOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * action)
    {
        // After the validation message is closed, show the user name and password prompt again.
        [self showEnterUserNameAndPasswordPromptWithTitle:originalTitle
                                               andMessage:originalMessage
                                             andMinLength:minLength
                                   andUserNamePlaceholder:userNamePlaceholder
                                       andDefaultUserName:defaultUserName
                                            forCallbackId:callbackId];
    }];

    [alert addAction:alertOkAction];

    // Show the validation message dialog.
    [self presentAlertOnCurrentViewController:alert];
}

/**
 * Helper used to show the confirm password prompt dialog.
 */
- (void)showEnterUserNameAndPasswordPromptWithTitle:(NSString*) title
                                         andMessage:(NSString*) message
                                       andMinLength:(int) minLength
                             andUserNamePlaceholder:(NSString*) userNamePlaceholder
                                 andDefaultUserName:(NSString*) defaultUserName
                                      forCallbackId:(NSString*) callbackId {

    // Build the alert view.

    UIAlertController *prompt = [UIAlertController alertControllerWithTitle:title
                                                                    message:message
                                                             preferredStyle:UIAlertControllerStyleAlert];

    // Build the action handlers.

    // The action for the user OK-ing the confirm credentials dialog.
    UIAlertAction* promptOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                             style:UIAlertActionStyleDefault
                                                           handler:^(UIAlertAction * action)
    {
        // Grab the passwords that were entered.
        NSString *userName = prompt.textFields[0].text;
        NSString *password = prompt.textFields[1].text;

        // Ensure the user entered a user name.
        if (!userName || [userName isEqualToString:@""]) {

            NSString* validationMessage = [NSString stringWithFormat:@"You must enter a %@.", userNamePlaceholder];
            
            [self showEnterUserNameAndPasswordValidationMessage:validationMessage
                                                      withTitle:userNamePlaceholder
                                                  forCallbackId:callbackId
                                               andOriginalTitle:title
                                             andOriginalMessage:message
                                                   andMinLength:minLength
                                         andUserNamePlaceholder:userNamePlaceholder
                                             andDefaultUserName:userName];
            return;
        }

        // Ensure the user entered a password.
        if (!password || [password isEqualToString:@""]) {

            [self showEnterUserNameAndPasswordValidationMessage:@"You must enter a password."
                                                      withTitle:@"Password"
                                                  forCallbackId:callbackId
                                               andOriginalTitle:title
                                             andOriginalMessage:message
                                                   andMinLength:minLength
                                         andUserNamePlaceholder:userNamePlaceholder
                                             andDefaultUserName:userName];
            return;
        }

        if (minLength != -1 && password.length < minLength) {

            NSString* validationMessage = [[NSString alloc] initWithFormat:@"The password needs to be at least %d characters long.", minLength];

            [self showEnterUserNameAndPasswordValidationMessage:validationMessage
                                                      withTitle:@"Password"
                                                  forCallbackId:callbackId
                                               andOriginalTitle:title
                                             andOriginalMessage:message
                                                   andMinLength:minLength
                                         andUserNamePlaceholder:userNamePlaceholder
                                             andDefaultUserName:userName];
            return;
        }

        // If we passed validation, return the user name and password.

        NSDictionary *dictionary = @{ @"cancel": @NO,
                                      @"userName": userName,
                                      @"password": password };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    // The action for the user cancelling the credentials dialog.
    UIAlertAction* promptCancelAction = [UIAlertAction actionWithTitle:@"Cancel"
                                                                 style:UIAlertActionStyleDefault
                                                               handler:^(UIAlertAction * action)
    {
        // If the user decides to cancel, send back a result with cancel flag set to true.

        NSDictionary *dictionary = @{ @"cancel": @YES };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    [prompt addAction:promptOkAction];
    [prompt addAction:promptCancelAction];

    // Build the input fields.

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = userNamePlaceholder;

        if (defaultUserName != nil) {
            textField.text = defaultUserName;
        }
    }];

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"Password";
        textField.secureTextEntry = YES;
    }];

    // Show the prompt dialog.
    [self presentAlertOnCurrentViewController:prompt];
}

#pragma mark - Enter Password Helper Methods

/**
 * Helper used to show a simple validation message.
 */
- (void)showEnterPasswordValidationMessage:(NSString*) message
                                 withTitle:(NSString*) title
                             forCallbackId:(NSString*) callbackId
                          andOriginalTitle:(NSString*) originalTitle
                        andOriginalMessage:(NSString*) originalMessage
                              andMinLength:(int) minLength
    {

    // Build the alert view.

    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    // Build the action handler.
    UIAlertAction* alertOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * action)
    {
        // After the validation message is closed, show the enter password prompt again.
        [self showEnterPasswordPromptWithTitle:originalTitle
                                    andMessage:originalMessage
                                  andMinLength:minLength
                                 forCallbackId:callbackId];
    }];

    [alert addAction:alertOkAction];

    // Show the validation message dialog.
    [self presentAlertOnCurrentViewController:alert];
}

/**
 * Helper used to show the enter password prompt dialog.
 */
- (void)showEnterPasswordPromptWithTitle:(NSString*) title
                              andMessage:(NSString*) message
                            andMinLength:(int) minLength
                           forCallbackId:(NSString*) callbackId {

    // Build the alert view.

    UIAlertController *prompt = [UIAlertController alertControllerWithTitle:title
                                                                    message:message
                                                             preferredStyle:UIAlertControllerStyleAlert];

    // Build the action handlers.

    // The action for the user OK-ing the confirm password dialog.
    UIAlertAction* promptOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                             style:UIAlertActionStyleDefault
                                                           handler:^(UIAlertAction * action)
    {
        // Grab the password that was entered.
        NSString *password = prompt.textFields[0].text;

        // Ensure the user entered a password.
        if (!password || [password isEqualToString:@""]) {

            [self showEnterPasswordValidationMessage:@"You must enter a password."
                                           withTitle:@"Enter Password"
                                       forCallbackId:callbackId
                                    andOriginalTitle:title
                                  andOriginalMessage:message
                                        andMinLength:minLength];
            return;
        }

        if (minLength != -1 && password.length < minLength) {

            NSString* validationMessage = [[NSString alloc] initWithFormat:@"The password needs to be at least %d characters long.", minLength];

            [self showEnterPasswordValidationMessage:validationMessage
                                           withTitle:@"Enter Password"
                                       forCallbackId:callbackId
                                    andOriginalTitle:title
                                  andOriginalMessage:message
                                        andMinLength:minLength];
            return;
        }

        // If we passed validation, return the password.

        NSDictionary *dictionary = @{ @"cancel": @NO,
                                      @"password": password };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    // The action for the user cancelling the enter password dialog.
    UIAlertAction* promptCancelAction = [UIAlertAction actionWithTitle:@"Cancel"
                                                                 style:UIAlertActionStyleDefault
                                                               handler:^(UIAlertAction * action)
    {
        // If the user decides to cancel, send back a result with cancel flag set to true.

        NSDictionary *dictionary = @{ @"cancel": @YES };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    [prompt addAction:promptOkAction];
    [prompt addAction:promptCancelAction];

    // Build the input fields.

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"Password";
        textField.secureTextEntry = YES;
    }];

    // Show the prompt dialog.
    [self presentAlertOnCurrentViewController:prompt];
}

#pragma mark - Confirm Password Helper Methods

/**
 * Helper used to show a simple validation message.
 */
- (void)showConfirmPasswordValidationMessage:(NSString*) message
                                   withTitle:(NSString*) title
                               forCallbackId:(NSString*) callbackId
                            andOriginalTitle:(NSString*) originalTitle
                          andOriginalMessage:(NSString*) originalMessage
                                andMinLength:(int) minLength
    {

    // Build the alert view.

    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    // Build the action handler.
    UIAlertAction* alertOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * action)
    {
        // After the validation message is closed, show the confirm password prompt again.
        [self showConfirmPasswordPromptWithTitle:originalTitle
                                      andMessage:originalMessage
                                    andMinLength:minLength
                                   forCallbackId:callbackId];
    }];

    [alert addAction:alertOkAction];

    // Show the validation message dialog.
    [self presentAlertOnCurrentViewController:alert];
}

/**
 * Helper used to show the confirm password prompt dialog.
 */
- (void)showConfirmPasswordPromptWithTitle:(NSString*) title
                                andMessage:(NSString*) message
                              andMinLength:(int) minLength
                             forCallbackId:(NSString*) callbackId {

    // Build the alert view.

    UIAlertController *prompt = [UIAlertController alertControllerWithTitle:title
                                                                    message:message
                                                             preferredStyle:UIAlertControllerStyleAlert];

    // Build the action handlers.

    // The action for the user OK-ing the confirm password dialog.
    UIAlertAction* promptOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                             style:UIAlertActionStyleDefault
                                                           handler:^(UIAlertAction * action)
    {
        // Grab the passwords that were entered.
        NSString *password = prompt.textFields[0].text;
        NSString *confirmPassword = prompt.textFields[1].text;

        // Ensure the user entered a password.
        if (!password || [password isEqualToString:@""]) {

            [self showConfirmPasswordValidationMessage:@"You must enter a password."
                                             withTitle:@"Password"
                                         forCallbackId:callbackId
                                      andOriginalTitle:title
                                    andOriginalMessage:message
                                          andMinLength:minLength];
            return;
        }

        // Ensure the user entered a confirm password.
        if (!confirmPassword || [confirmPassword isEqualToString:@""]) {

            [self showConfirmPasswordValidationMessage:@"You must enter a value for the confirm password."
                                             withTitle:@"Confirm Password"
                                         forCallbackId:callbackId
                                      andOriginalTitle:title
                                    andOriginalMessage:message
                                          andMinLength:minLength];
            return;
        }

        if (minLength != -1 && password.length < minLength) {

            NSString* validationMessage = [[NSString alloc] initWithFormat:@"The password needs to be at least %d characters long.", minLength];

            [self showConfirmPasswordValidationMessage:validationMessage
                                             withTitle:@"Confirm Password"
                                         forCallbackId:callbackId
                                      andOriginalTitle:title
                                    andOriginalMessage:message
                                          andMinLength:minLength];
            return;
        }

        // Ensure the passwords match.
        if (![password isEqualToString:confirmPassword]) {

            [self showConfirmPasswordValidationMessage:@"The passwords do not match, please try again."
                                            withTitle:@"Confirm Password"
                                        forCallbackId:callbackId
                                     andOriginalTitle:title
                                   andOriginalMessage:message
                                         andMinLength:minLength];
            return;
        }

        // If we passed validation, return the passwords.

        NSDictionary *dictionary = @{ @"cancel": @NO,
                                      @"password": password };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    // The action for the user cancelling the confirm password dialog.
    UIAlertAction* promptCancelAction = [UIAlertAction actionWithTitle:@"Cancel"
                                                                 style:UIAlertActionStyleDefault
                                                               handler:^(UIAlertAction * action)
    {
        // If the user decides to cancel, send back a result with cancel flag set to true.

        NSDictionary *dictionary = @{ @"cancel": @YES };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    [prompt addAction:promptOkAction];
    [prompt addAction:promptCancelAction];

    // Build the input fields.

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"Password";
        textField.secureTextEntry = YES;
    }];

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"Confirm Password";
        textField.secureTextEntry = YES;
    }];

    // Show the prompt dialog.
    [self presentAlertOnCurrentViewController:prompt];
}

#pragma mark - Change Password Helper Methods

/**
 * Helper used to show a simple validation message.
 */
- (void)showChangePasswordValidationMessage:(NSString*) message
                                  withTitle:(NSString*) title
                              forCallbackId:(NSString*) callbackId
                           andOriginalTitle:(NSString*) originalTitle
                         andOriginalMessage:(NSString*) originalMessage
                               andMinLength:(int) minLength
    {

    // Build the alert view.

    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    // Build the action handler.
    UIAlertAction* alertOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * action)
    {
        // After the validation message is closed, show the change password prompt again.
        [self showChangePasswordPromptWithTitle:originalTitle
                                     andMessage:originalMessage
                                   andMinLength:minLength
                                  forCallbackId:callbackId];
    }];

    [alert addAction:alertOkAction];

    // Show the validation message dialog.
    [self presentAlertOnCurrentViewController:alert];
}

/**
 * Helper used to show the change password prompt dialog.
 */
- (void)showChangePasswordPromptWithTitle:(NSString*) title
                               andMessage:(NSString*) message
                             andMinLength:(int) minLength
                            forCallbackId:(NSString*) callbackId {

    // Build the alert view.

    UIAlertController *prompt = [UIAlertController alertControllerWithTitle:title
                                                                    message:message
                                                             preferredStyle:UIAlertControllerStyleAlert];

    // Build the action handlers.

    // The action for the user OK-ing the change password dialog.
    UIAlertAction* promptOkAction = [UIAlertAction actionWithTitle:@"OK"
                                                             style:UIAlertActionStyleDefault
                                                           handler:^(UIAlertAction * action)
    {
        // Grab the passwords that were entered.
        NSString *currentPassword = prompt.textFields[0].text;
        NSString *newPassword = prompt.textFields[1].text;
        NSString *confirmNewPassword = prompt.textFields[2].text;

        // Ensure the user entered a current password.
        if (!currentPassword || [currentPassword isEqualToString:@""]) {

            [self showChangePasswordValidationMessage:@"You must enter your current password."
                                            withTitle:@"Current Password"
                                        forCallbackId:callbackId
                                     andOriginalTitle:title
                                   andOriginalMessage:message
                                         andMinLength:minLength];
            return;
        }

        // Ensure the new password values are entered.
        if ([currentPassword isEqualToString:@""] || [confirmNewPassword isEqualToString:@""]) {

            [self showChangePasswordValidationMessage:@"You must enter a value for the new password."
                                            withTitle:@"New Password"
                                        forCallbackId:callbackId
                                     andOriginalTitle:title
                                   andOriginalMessage:message
                                         andMinLength:minLength];
            return;
        }

        if (minLength != -1 && newPassword.length < minLength) {

            NSString* validationMessage = [[NSString alloc] initWithFormat:@"The new password needs to be at least %d characters long.", minLength];

            [self showChangePasswordValidationMessage:validationMessage
                                            withTitle:@"New Password"
                                        forCallbackId:callbackId
                                     andOriginalTitle:title
                                   andOriginalMessage:message
                                         andMinLength:minLength];
            return;
        }

        // Ensure the new passwords match.
        if (![newPassword isEqualToString:confirmNewPassword]) {

            [self showChangePasswordValidationMessage:@"The new passwords do not match, please try again."
                                            withTitle:@"New Password"
                                        forCallbackId:callbackId
                                     andOriginalTitle:title
                                   andOriginalMessage:message
                                         andMinLength:minLength];
            return;
        }

        // If we passed validation, return the passwords.

        NSDictionary *dictionary = @{ @"cancel": @NO,
                                      @"currentPassword": currentPassword,
                                      @"newPassword": newPassword };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    // The action for the user cancelling the change password dialog.
    UIAlertAction* promptCancelAction = [UIAlertAction actionWithTitle:@"Cancel"
                                                                 style:UIAlertActionStyleDefault
                                                               handler:^(UIAlertAction * action)
    {
        // If the user decides to cancel, send back a result with cancel flag set to true.

        NSDictionary *dictionary = @{ @"cancel": @YES };

        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:dictionary];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
    }];

    [prompt addAction:promptOkAction];
    [prompt addAction:promptCancelAction];

    // Build the input fields.

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"Current Password";
        textField.secureTextEntry = YES;
    }];

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"New Password";
        textField.secureTextEntry = YES;
    }];

    [prompt addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        textField.placeholder = @"Confirm New Password";
        textField.secureTextEntry = YES;
    }];

    // Show the prompt dialog.
    [self presentAlertOnCurrentViewController:prompt];
}

@end
