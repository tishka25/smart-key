/// <reference path="cordova-plugin-password-dialog.d.ts" />

var emptyConfirmOptions: PasswordDialogPlugin.ConfirmPasswordOptions = {};

var options: PasswordDialogPlugin.ConfirmPasswordOptions = {
    title: "title",
    message: "message",
    minLength: 8
};

PasswordDialogPlugin.showConfirmPassword(null);
PasswordDialogPlugin.showConfirmPassword(options);
PasswordDialogPlugin.showConfirmPassword(options, () => {});
PasswordDialogPlugin.showConfirmPassword(options, () => {}, (error: string) => {});
PasswordDialogPlugin.showConfirmPassword(options, (result: PasswordDialogPlugin.ConfirmPasswordResult) => {}, (error: string) => {});


var emptyChangeOptions: PasswordDialogPlugin.ChangePasswordOptions = {};

var options: PasswordDialogPlugin.ChangePasswordOptions = {
    title: "title",
    message: "message",
    minLength: 8
};

PasswordDialogPlugin.showChangePassword(null);
PasswordDialogPlugin.showChangePassword(options);
PasswordDialogPlugin.showChangePassword(options, () => {});
PasswordDialogPlugin.showChangePassword(options, () => {}, (error: string) => {});
PasswordDialogPlugin.showChangePassword(options, (result: PasswordDialogPlugin.ChangePasswordResult) => {}, (error: string) => {});
