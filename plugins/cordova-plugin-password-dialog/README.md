# Password Dialog for Cordova

This is a [Cordova](http://cordova.apache.org/) plugin for showing password prompt dialogs.

There are currently four dialogs available:
* User Name And Password
* Enter Password
* Confirm Password
* Change Password

# Install

To add the plugin to your Cordova project, simply add the plugin from the npm registry:

    cordova plugin add cordova-plugin-password-dialog

Alternatively, you can install the latest version of the plugin directly from git:

    cordova plugin add https://github.com/Justin-Credible/cordova-plugin-password-dialog

# Usage

The plugin is available via a global variable named `PasswordDialogPlugin`. It exposes the following properties and functions.

All functions accept optional success and failure callbacks as their final two arguments, where the failure callback will receive an error string as an argument unless otherwise noted.

A TypeScript definition file for the JavaScript interface is available in the `typings` directory as well as on [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) via the `tsd` tool.

## User Name And Password Dialog

Used to show a dialog that prompts the user to enter a user name and password.

Method Signature:

`showEnterUserNameAndPassword(options, successCallback, failureCallback)`

Options Parameter:

* title (string): The title for the dialog (optional, defaults to "Enter Credentials").
* message (string): The message for the dialog (optional, defaults to empty string).
* minLength (number): The minimum length for the new password (optional, defaults to not enforcing a minimum length).
* userNamePlaceholder (string): The placeholder text for the user name text entry (optional, defaults to "user Name" if not provided).
* defaultUserName (string): The user name value to default into the user name field (optional, defaults to empty string if not provided).

Example Usage:

```javascript
var options = {
    title: "Enter Credentials",
    message: "Please enter your login credentials.",
    minLength: 8,
    userNamePlaceholder: "User Name",
    defaultUserName: "user123"
};

PasswordDialogPlugin.showEnterUserNameAndPassword(options,
    function(result) {
        if (result.cancel) {
            console.log("User cancelled the enter credentials dialog.");
        }
        else {
            console.log("User completed the enter credentials dialog.", result.password);
        }
    },
    function(err) {
        console.log("Enter password dialog error.", err);
    });
```

## Password Dialog

Used to show a dialog that prompts the user to enter a password.

Method Signature:

`showEnterPassword(options, successCallback, failureCallback)`

Options Parameter:

* title (string): The title for the dialog (optional, defaults to "Enter Password").
* message (string): The message for the dialog (optional, defaults to empty string).
* minLength (number): The minimum length for the new password (optional, defaults to not enforcing a minimum length).

Example Usage:

```javascript
var options = {
    title: "Enter Password",
    message: "Please enter your login password.",
    minLength: 8
};

PasswordDialogPlugin.showEnterPassword(options,
    function(result) {
        if (result.cancel) {
            console.log("User cancelled the enter password dialog.");
        }
        else {
            console.log("User completed the enter password dialog.", result.password);
        }
    },
    function(err) {
        console.log("Enter password dialog error.", err);
    });
```

## Confirm Password Dialog

Used to show a dialog that prompts the user to confirm their password. The user must enter their their password twice.

Method Signature:

`showConfirmPassword(options, successCallback, failureCallback)`

Options Parameter:

* title (string): The title for the dialog (optional, defaults to "Confirm Password").
* message (string): The message for the dialog (optional, defaults to empty string).
* minLength (number): The minimum length for the new password (optional, defaults to not enforcing a minimum length).

Example Usage:

```javascript
var options = {
    title: "Confirm Password",
    message: "Please confirm your password.",
    minLength: 8
};

PasswordDialogPlugin.showConfirmPassword(options,
    function(result) {
        if (result.cancel) {
            console.log("User cancelled the confirm password dialog.");
        }
        else {
            console.log("User completed the confirm password dialog.", result.password);
        }
    },
    function(err) {
        console.log("Confirm password dialog error.", err);
    });
```

## Change Password Dialog

Used to show a dialog that prompts the user to change their password. The user must enter their current password as well as their new password twice.

Method Signature:

`showChangePassword(options, successCallback, failureCallback)`

Options Parameter:

* title (string): The title for the dialog (optional, defaults to "Change Password").
* message (string): The message for the dialog (optional, defaults to empty string).
* minLength (number): The minimum length for the new password (optional, defaults to not enforcing a minimum length).

Example Usage:

```javascript
var options = {
    title: "Change Password",
    message: "Please change your password.",
    minLength: 8
};

PasswordDialogPlugin.showChangePassword(options,
    function(result) {
        if (result.cancel) {
            console.log("User cancelled the change password dialog.");
        }
        else {
            console.log("User completed the change password dialog.", result.currentPassword, result.newPassword);
        }
    },
    function(err) {
        console.log("Change password dialog error.", err);
    });
```
