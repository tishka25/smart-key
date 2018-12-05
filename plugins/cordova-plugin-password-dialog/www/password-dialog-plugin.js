"use strict";

var exec = require("cordova/exec");

/**
 * The Cordova plugin ID for this plugin.
 */
var PLUGIN_ID = "PasswordDialogPlugin";

/**
 * The plugin which will be exported and exposed in the global scope.
 */
var PasswordDialogPlugin = {};

/**
 * Used to show a dialog that prompts the user to enter a user name and password.
 * 
 * The options available are:
 *  • [string] title - The title for the dialog (optional, defaults to "Enter Credentials").
 *  • [string] message - The message for the dialog (optional, defaults to empty string).
 *  • [number] minLength - The minimum length for the password (optional, defaults to not enforcing a minimum length).
 *  • [string] userNamePlaceholder - The placeholder text for the user name field (optional, defaults to "User Name").
 *  • [string] defaultUserName - The user name value to default into the user name field (optional, defaults to "").
 * 
 * Upon completion, the success callback will be invoked with the following object:
 * 
 *  { cancel: false, userName = "user name", passsword = "password" }
 * 
 * @param [object] options - The options for the dialog.
 * @param [function] successCallback - The success callback for this asynchronous function; receives a result object.
 * @param [function] failureCallback - The failure callback for this asynchronous function; receives an error string.
 */
PasswordDialogPlugin.showEnterUserNameAndPassword = function showEnterUserNameAndPassword(options, successCallback, failureCallback) {

    if (!options) {
        options = {};
    }

    if (typeof(options.title) !== "string") {
        options.title = "Enter Credentials";
    }

    if (typeof(options.message) !== "string") {
        options.message = "";
    }

    if (typeof(options.minLength) !== "number") {
        options.minLength = -1;
    }

    if (typeof(options.userNamePlaceholder) !== "string") {
        options.userNamePlaceholder = "User Name"
    }

    if (typeof(options.defaultUserName) !== "string") {
        options.defaultUserName = ""
    }

    exec(successCallback, failureCallback, PLUGIN_ID, "showEnterUserNameAndPassword", [options.title, options.message, options.minLength, options.userNamePlaceholder, options.defaultUserName]);
};

/**
 * Used to show a dialog that prompts the user to enter a password.
 * 
 * The options available are:
 *  • [string] title - The title for the dialog (optional, defaults to "Enter Password").
 *  • [string] message - The message for the dialog (optional, defaults to empty string).
 *  • [number] minLength - The minimum length for the password (optional, defaults to not enforcing a minimum length).
 * 
 * Upon completion, the success callback will be invoked with the following object:
 * 
 *  { cancel: false, passsword = "password" }
 * 
 * @param [object] options - The options for the dialog.
 * @param [function] successCallback - The success callback for this asynchronous function; receives a result object.
 * @param [function] failureCallback - The failure callback for this asynchronous function; receives an error string.
 */
PasswordDialogPlugin.showEnterPassword = function showEnterPassword(options, successCallback, failureCallback) {

    if (!options) {
        options = {};
    }

    if (typeof(options.title) !== "string") {
        options.title = "Enter Password";
    }

    if (typeof(options.message) !== "string") {
        options.message = "";
    }

    if (typeof(options.minLength) !== "number") {
        options.minLength = -1;
    }

    exec(successCallback, failureCallback, PLUGIN_ID, "showEnterPassword", [options.title, options.message, options.minLength]);
};

/**
 * Used to show a dialog that prompts the user to change their password.
 * The user must enter their current password as well as their new password twice.
 * 
 * The options available are:
 *  • [string] title - The title for the dialog (optional, defaults to "Confirm Password").
 *  • [string] message - The message for the dialog (optional, defaults to empty string).
 *  • [number] minLength - The minimum length for the password (optional, defaults to not enforcing a minimum length).
 * 
 * Upon completion, the success callback will be invoked with the following object:
 * 
 *  { cancel: false, passsword = "password" }
 * 
 * @param [object] options - The options for the dialog.
 * @param [function] successCallback - The success callback for this asynchronous function; receives a result object.
 * @param [function] failureCallback - The failure callback for this asynchronous function; receives an error string.
 */
PasswordDialogPlugin.showConfirmPassword = function showConfirmPassword(options, successCallback, failureCallback) {

    if (!options) {
        options = {};
    }

    if (typeof(options.title) !== "string") {
        options.title = "Confirm Password";
    }

    if (typeof(options.message) !== "string") {
        options.message = "";
    }

    if (typeof(options.minLength) !== "number") {
        options.minLength = -1;
    }

    exec(successCallback, failureCallback, PLUGIN_ID, "showConfirmPassword", [options.title, options.message, options.minLength]);
};

/**
 * Used to show a dialog that prompts the user to change their password.
 * The user must enter their current password as well as their new password twice.
 * 
 * The options available are:
 *  • [string] title - The title for the dialog (optional, defaults to "Change Password").
 *  • [string] message - The message for the dialog (optional, defaults to empty string).
 *  • [number] minLength - The minimum length for the new password (optional, defaults to not enforcing a minimum length).
 * 
 * Upon completion, the success callback will be invoked with the following object:
 * 
 *  { cancel: false, currentPassword = "oldpass", newPassword = "newpass" }
 * 
 * @param [object] options - The options for the dialog.
 * @param [function] successCallback - The success callback for this asynchronous function; receives a result object.
 * @param [function] failureCallback - The failure callback for this asynchronous function; receives an error string.
 */
PasswordDialogPlugin.showChangePassword = function showChangePassword(options, successCallback, failureCallback) {

    if (!options) {
        options = {};
    }

    if (typeof(options.title) !== "string") {
        options.title = "Change Password";
    }

    if (typeof(options.message) !== "string") {
        options.message = "";
    }

    if (typeof(options.minLength) !== "number") {
        options.minLength = -1;
    }

    exec(successCallback, failureCallback, PLUGIN_ID, "showChangePassword", [options.title, options.message, options.minLength]);
};

module.exports = PasswordDialogPlugin;
