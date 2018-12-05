package net.justin_credible.cordova;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.graphics.Typeface;
import android.text.InputType;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.TextView.OnEditorActionListener;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public final class PasswordDialogPlugin extends CordovaPlugin {

    /**
     * A fake version of the R resource object.
     *
     * Used to obtain resources that were not compiled into the default R object.
     */
    private FakeR R;

    //region Base Overrides

    @Override
    public void pluginInitialize() {
        super.pluginInitialize();

        R = new FakeR(this.cordova.getActivity());
    }

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {

        if (action == null) {
            return false;
        }

        if (action.equals("showEnterUserNameAndPassword")) {

            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        PasswordDialogPlugin.this.showEnterUserNameAndPassword(args, callbackContext);
                    }
                    catch (Exception exception) {
                        callbackContext.error("PasswordDialogPlugin.showEnterUserNameAndPassword() uncaught exception: " + exception.getMessage());
                    }
                }
            });

            return true;
        }
        else if (action.equals("showEnterPassword")) {

            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        PasswordDialogPlugin.this.showEnterPassword(args, callbackContext);
                    }
                    catch (Exception exception) {
                        callbackContext.error("PasswordDialogPlugin.showEnterPassword() uncaught exception: " + exception.getMessage());
                    }
                }
            });

            return true;
        }
        else if (action.equals("showConfirmPassword")) {

            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        PasswordDialogPlugin.this.showConfirmPassword(args, callbackContext);
                    }
                    catch (Exception exception) {
                        callbackContext.error("PasswordDialogPlugin.showConfirmPassword() uncaught exception: " + exception.getMessage());
                    }
                }
            });

            return true;
        }
        else if (action.equals("showChangePassword")) {

            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        PasswordDialogPlugin.this.showChangePassword(args, callbackContext);
                    }
                    catch (Exception exception) {
                        callbackContext.error("PasswordDialogPlugin.showChangePassword() uncaught exception: " + exception.getMessage());
                    }
                }
            });

            return true;
        }
        else {
            // The given action was not handled above.
            return false;
        }
    }

    //endregion

    //region Cordova Commands

    private void showEnterUserNameAndPassword(JSONArray args, final CallbackContext callbackContext) throws JSONException {

        // Ensure we have the correct number of arguments.
        if (args.length() != 5) {
            callbackContext.error("A title, message, minLength, userNamePlaceholder, and defaultUserName are required.");
            return;
        }

        // Obtain the arguments.

        final String title = args.getString(0) == null ? "Enter Credentials" : args.getString(0);
        final String message = args.getString(1) == null ? "" : args.getString(1);
        final int minLength = args.getInt(2);
        final String userNamePlaceholder = args.getString(3) == null ? "User Name" : args.getString(3);
        final String defaultUserName = args.getString(4) == null ? "" : args.getString(4);

         cordova.getActivity().runOnUiThread(new Runnable() {
             public void run() {
                 PasswordDialogPlugin.this.showEnterUserNameAndPasswordPrompt(title, message, minLength, userNamePlaceholder, defaultUserName, callbackContext);
             }
         });
    }

    private void showEnterPassword(JSONArray args, final CallbackContext callbackContext) throws JSONException {

        // Ensure we have the correct number of arguments.
        if (args.length() != 3) {
            callbackContext.error("A title, message, and minLength are required.");
            return;
        }

        // Obtain the arguments.

        final String title = args.getString(0) == null ? "Enter Password" : args.getString(0);
        final String message = args.getString(1) == null ? "" : args.getString(1);
        final int minLength = args.getInt(2);

         cordova.getActivity().runOnUiThread(new Runnable() {
             public void run() {
                 PasswordDialogPlugin.this.showEnterPasswordPrompt(title, message, minLength, callbackContext);
             }
         });
    }

    private void showConfirmPassword(JSONArray args, final CallbackContext callbackContext) throws JSONException {

        // Ensure we have the correct number of arguments.
        if (args.length() != 3) {
            callbackContext.error("A title, message, and minLength are required.");
            return;
        }

        // Obtain the arguments.

        final String title = args.getString(0) == null ? "Confirm Password" : args.getString(0);
        final String message = args.getString(1) == null ? "" : args.getString(1);
        final int minLength = args.getInt(2);

        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                PasswordDialogPlugin.this.showConfirmPasswordPrompt(title, message, minLength, callbackContext);
            }
        });
    }

    private void showChangePassword(JSONArray args, final CallbackContext callbackContext) throws JSONException {

        // Ensure we have the correct number of arguments.
        if (args.length() != 3) {
            callbackContext.error("A title, message, and minLength are required.");
            return;
        }

        // Obtain the arguments.

        final String title = args.getString(0) == null ? "Change Password" : args.getString(0);
        final String message = args.getString(1) == null ? "" : args.getString(1);
        final int minLength = args.getInt(2);

        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                PasswordDialogPlugin.this.showChangePasswordPrompt(title, message, minLength, callbackContext);
            }
        });
    }

    //endregion

    //region Shared Helper Methods

    /**
     * Used to show the on-screen keyboard for the given text field as if the user
     * had tapped the field themselves.
     *
     * @param context Used to obtain a reference to the INPUT_METHOD_SERVICE.
     * @param textField The field we are showing the keyboard for.
     */
    private void showKeyboardForField(final Context context, final EditText textField) {

        textField.postDelayed(new Runnable() {
            @Override
            public void run() {
                InputMethodManager inputManager = (InputMethodManager)
                        context.getSystemService(Context.INPUT_METHOD_SERVICE);

                inputManager.showSoftInput(textField, 0);
            }
        }, 200);
    }

    //endregion

    //region Enter User Name and Password Helper Methods

    /**
     * Helper used to show the user name and password prompt dialog.
     *
     * @param title The title for the dialog.
     * @param message The message body for the dialog.
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param userNamePlaceholder The placeholder text for the user name field; defaults to "User Name".
     * @param defaultUserName The default value for the user name text box; defaults to "".
     * @param callbackContext The Cordova plugin callback context.
     */
    private void showEnterUserNameAndPasswordPrompt(String title, String message, final int minLength, String userNamePlaceholder, String defaultUserName, final CallbackContext callbackContext) {

        // Create the builder for the dialog.
        Activity activity = PasswordDialogPlugin.this.cordova.getActivity();
        AlertDialog.Builder builder = new AlertDialog.Builder(activity,
                AlertDialog.THEME_DEVICE_DEFAULT_LIGHT);

        // Grab the dialog layout XML resource pointer.
        int dialogResource = R.getId("layout", "credentials_dialog");

        // Inflate the layout XML to get the layout object.
        LayoutInflater inflater = this.cordova.getActivity().getLayoutInflater();
        final LinearLayout dialogLayout = (LinearLayout) inflater.inflate(dialogResource, null);
        builder.setView(dialogLayout);

        // Configure the buttons and title/message.
        builder.setNegativeButton(android.R.string.cancel, null);
        builder.setPositiveButton(android.R.string.ok, null);
        builder.setTitle(title);
        builder.setMessage(message);

        // Create the dialog.
        final AlertDialog dialog = builder.create();

        // Obtain references to the input fields.

        EditText etUserName = (EditText) dialogLayout
                .findViewById(R.getId("id", "UserName"));

        EditText etPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "Password"));

        // Configure the type-face for each input.

        etUserName.setTypeface(Typeface.DEFAULT);
        etPassword.setTypeface(Typeface.DEFAULT);

        // Wire up an event that will handle the "Done" or return key press on the last field.
        etPassword.setOnEditorActionListener(new OnEditorActionListener() {

            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {

                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    validateUserNameAndPassword(minLength, dialog, dialogLayout, callbackContext);
                    return true;
                }

                return false;
            }
        });

        // Set the placeholder text for the user name field.
        etUserName.setHint(userNamePlaceholder);

        boolean shouldFocusPassword = false;

        // Default the user name field if a default was provided.
        if (defaultUserName != null && !defaultUserName.equals("")) {
            etUserName.setText(defaultUserName);

            // If the user name is already defaulted, focus the password field.
            shouldFocusPassword = true;
        }

        // Open the dialog.
        dialog.show();

        // Focus the correct field.
        if (shouldFocusPassword) {
            etPassword.requestFocus();
        }
        else {
            etUserName.requestFocus();
        }

        // Automatically show the keyboard for the first field.
        this.showKeyboardForField(activity, etUserName);

        // Wire up the handlers for the buttons.

        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                validateUserNameAndPassword(minLength, dialog, dialogLayout, callbackContext);
            }
        });

        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();

                Map<String, Object> resultMap = new HashMap<String, Object>();
                resultMap.put("cancel", true);

                callbackContext.success(new JSONObject(resultMap));
            }
        });
    }

    /**
     * Used to perform validation for the user name and password dialog.
     *
     * If validation passes, the dialog will be closed and the plugin callback will be invoked.
     *
     * If validation fails, validation messages will be shown on the appropriate text fields.
     *
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param dialog The confirm password dialog instance.
     * @param dialogLayout The layout for the confirm password dialog.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void validateUserNameAndPassword(int minLength, AlertDialog dialog, LinearLayout dialogLayout, CallbackContext callbackContext) {

        // Obtain references to the input fields.

        EditText etUserName = (EditText) dialogLayout
                .findViewById(R.getId("id", "UserName"));

        EditText etPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "Password"));

        // Grab the password values.

        String userName = etUserName.getText().toString();
        String password = etPassword.getText().toString();

        // Perform validation.

        if (password.equals("")) {
            etPassword.setError("A password is required.");
            etPassword.requestFocus();
            return;
        }

        if (minLength != -1 && password.length() < minLength) {
            etPassword.setText("");
            String message = String.format("The password needs to be at least %d characters long.", minLength);
            etPassword.setError(message);
            etPassword.requestFocus();
            return;
        }

        // If validation passed, invoke the plugin callback with the results.

        dialog.dismiss();

        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("cancel", false);
        resultMap.put("userName", userName);
        resultMap.put("password", password);

        callbackContext.success(new JSONObject(resultMap));
    }

    //endregion

    //region Enter Password Helper Methods

    /**
     * Helper used to show the enter password prompt dialog.
     *
     * @param title The title for the dialog.
     * @param message The message body for the dialog.
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void showEnterPasswordPrompt(String title, String message, final int minLength, final CallbackContext callbackContext) {

        // Create the builder for the dialog.
        Activity activity = PasswordDialogPlugin.this.cordova.getActivity();
        AlertDialog.Builder builder = new AlertDialog.Builder(activity,
                AlertDialog.THEME_DEVICE_DEFAULT_LIGHT);

        // Grab the dialog layout XML resource pointer.
        int dialogResource = R.getId("layout", "enter_password_dialog");

        // Inflate the layout XML to get the layout object.
        LayoutInflater inflater = this.cordova.getActivity().getLayoutInflater();
        final LinearLayout dialogLayout = (LinearLayout) inflater.inflate(dialogResource, null);
        builder.setView(dialogLayout);

        // Configure the buttons and title/message.
        builder.setNegativeButton(android.R.string.cancel, null);
        builder.setPositiveButton(android.R.string.ok, null);
        builder.setTitle(title);
        builder.setMessage(message);

        // Create the dialog.
        final AlertDialog dialog = builder.create();

        // Obtain references to the input field.

        EditText etPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "Password"));

        // Configure the type-face for the input.

        etPassword.setTypeface(Typeface.DEFAULT);

        // Wire up an event that will handle the "Done" or return key press on the last field.
        etPassword.setOnEditorActionListener(new OnEditorActionListener() {

            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {

                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    validateEnterPassword(minLength, dialog, dialogLayout, callbackContext);
                    return true;
                }

                return false;
            }
        });

        // Open the dialog and focus the first field.
        dialog.show();
        etPassword.requestFocus();

        // Wire up the handlers for the buttons.

        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                validateEnterPassword(minLength, dialog, dialogLayout, callbackContext);
            }
        });

        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();

                Map<String, Object> resultMap = new HashMap<String, Object>();
                resultMap.put("cancel", true);

                callbackContext.success(new JSONObject(resultMap));
            }
        });

        // Automatically show the keyboard for the first field.
        this.showKeyboardForField(activity, etPassword);
    }

    /**
     * Used to perform validation for the enter password dialog.
     *
     * If validation passes, the dialog will be closed and the plugin callback will be invoked.
     *
     * If validation fails, validation messages will be shown on the appropriate text fields.
     *
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param dialog The confirm password dialog instance.
     * @param dialogLayout The layout for the confirm password dialog.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void validateEnterPassword(int minLength, AlertDialog dialog, LinearLayout dialogLayout, CallbackContext callbackContext) {

        // Obtain references to the input field.

        EditText etPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "Password"));

        // Grab the password value.

        String password = etPassword.getText().toString();

        // Perform validation.

        if (minLength != -1 && password.length() < minLength) {
            String message = String.format("The password needs to be at least %d characters long.", minLength);
            etPassword.setError(message);
            etPassword.requestFocus();
            return;
        }

        // If validation passed, invoke the plugin callback with the results.

        dialog.dismiss();

        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("cancel", false);
        resultMap.put("password", password);

        callbackContext.success(new JSONObject(resultMap));
    }

    //endregion

    //region Confirm Password Helper Methods

    /**
     * Helper used to show the confirm password prompt dialog.
     *
     * @param title The title for the dialog.
     * @param message The message body for the dialog.
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void showConfirmPasswordPrompt(String title, String message, final int minLength, final CallbackContext callbackContext) {

        // Create the builder for the dialog.
        Activity activity = PasswordDialogPlugin.this.cordova.getActivity();
        AlertDialog.Builder builder = new AlertDialog.Builder(activity,
                AlertDialog.THEME_DEVICE_DEFAULT_LIGHT);

        // Grab the dialog layout XML resource pointer.
        int dialogResource = R.getId("layout", "confirm_password_dialog");

        // Inflate the layout XML to get the layout object.
        LayoutInflater inflater = this.cordova.getActivity().getLayoutInflater();
        final LinearLayout dialogLayout = (LinearLayout) inflater.inflate(dialogResource, null);
        builder.setView(dialogLayout);

        // Configure the buttons and title/message.
        builder.setNegativeButton(android.R.string.cancel, null);
        builder.setPositiveButton(android.R.string.ok, null);
        builder.setTitle(title);
        builder.setMessage(message);

        // Create the dialog.
        final AlertDialog dialog = builder.create();

        // Obtain references to the input fields.

        EditText etPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "Password"));

        EditText etConfirmPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "ConfirmPassword"));

        // Configure the type-face for each input.

        etPassword.setTypeface(Typeface.DEFAULT);
        etConfirmPassword.setTypeface(Typeface.DEFAULT);

        // Wire up an event that will handle the "Done" or return key press on the last field.
        etConfirmPassword.setOnEditorActionListener(new OnEditorActionListener() {

            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {

                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    validateConfirmPassword(minLength, dialog, dialogLayout, callbackContext);
                    return true;
                }

                return false;
            }
        });

        // Open the dialog and focus the first field.
        dialog.show();
        etPassword.requestFocus();

        // Automatically show the keyboard for the first field.
        this.showKeyboardForField(this.cordova.getActivity(), etPassword);

        // Wire up the handlers for the buttons.

        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                validateConfirmPassword(minLength, dialog, dialogLayout, callbackContext);
            }
        });

        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();

                Map<String, Object> resultMap = new HashMap<String, Object>();
                resultMap.put("cancel", true);

                callbackContext.success(new JSONObject(resultMap));
            }
        });
    }

    /**
     * Used to perform validation for the confirm password dialog.
     *
     * If validation passes, the dialog will be closed and the plugin callback will be invoked.
     *
     * If validation fails, validation messages will be shown on the appropriate text fields.
     *
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param dialog The confirm password dialog instance.
     * @param dialogLayout The layout for the confirm password dialog.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void validateConfirmPassword(int minLength, AlertDialog dialog, LinearLayout dialogLayout, CallbackContext callbackContext) {

        // Obtain references to the input fields.

        EditText etPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "Password"));

        EditText etConfirmPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "ConfirmPassword"));

        // Grab the password values.

        String password = etPassword.getText().toString();
        String confirmPassword = etConfirmPassword.getText().toString();

        // Perform validation.

        if (password.equals("")) {
            etPassword.setError("A password is required.");
            etPassword.requestFocus();
            return;
        }

        if (confirmPassword.equals("")) {
            etConfirmPassword.setError("Confirm password is required.");
            etConfirmPassword.requestFocus();
            return;
        }

        if (minLength != -1 && password.length() < minLength) {
            etPassword.setText("");
            etConfirmPassword.setText("");
            String message = String.format("The password needs to be at least %d characters long.", minLength);
            etPassword.setError(message);
            etPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            etPassword.setText("");
            etConfirmPassword.setText("");
            etPassword.setError("The new passwords do not match, please try again.");
            etPassword.requestFocus();
            return;
        }

        // If validation passed, invoke the plugin callback with the results.

        dialog.dismiss();

        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("cancel", false);
        resultMap.put("password", password);

        callbackContext.success(new JSONObject(resultMap));
    }

    //endregion

    //region Change Password Helper Methods

    /**
     * Helper used to show the change password prompt dialog.
     *
     * @param title The title for the dialog.
     * @param message The message body for the dialog.
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void showChangePasswordPrompt(String title, String message, final int minLength, final CallbackContext callbackContext) {

        // Create the builder for the dialog.
        Activity activity = PasswordDialogPlugin.this.cordova.getActivity();
        AlertDialog.Builder builder = new AlertDialog.Builder(activity,
                AlertDialog.THEME_DEVICE_DEFAULT_LIGHT);

        // Grab the dialog layout XML resource pointer.
        int dialogResource = R.getId("layout", "change_password_dialog");

        // Inflate the layout XML to get the layout object.
        LayoutInflater inflater = this.cordova.getActivity().getLayoutInflater();
        final LinearLayout dialogLayout = (LinearLayout) inflater.inflate(dialogResource, null);
        builder.setView(dialogLayout);

        // Configure the buttons and title/message.
        builder.setNegativeButton(android.R.string.cancel, null);
        builder.setPositiveButton(android.R.string.ok, null);
        builder.setTitle(title);
        builder.setMessage(message);

        // Create the dialog.
        final AlertDialog dialog = builder.create();

        // Obtain references to the input fields.

        EditText etCurrentPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "CurrentPassword"));

        EditText etNewPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "NewPassword"));

        EditText etConfirmPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "ConfirmPassword"));

        // Configure the type-face for each input.

        etCurrentPassword.setTypeface(Typeface.DEFAULT);
        etNewPassword.setTypeface(Typeface.DEFAULT);
        etConfirmPassword.setTypeface(Typeface.DEFAULT);

        // Wire up an event that will handle the "Done" or return key press on the last field.
        etConfirmPassword.setOnEditorActionListener(new OnEditorActionListener() {

            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {

                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    validateChangePassword(minLength, dialog, dialogLayout, callbackContext);
                    return true;
                }

                return false;
            }
        });

        // Open the dialog and focus the first field.
        dialog.show();
        etCurrentPassword.requestFocus();

        // Automatically show the keyboard for the first field.
        this.showKeyboardForField(this.cordova.getActivity(), etCurrentPassword);

        // Wire up the handlers for the buttons.

        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                validateChangePassword(minLength, dialog, dialogLayout, callbackContext);
            }
        });

        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();

                Map<String, Object> resultMap = new HashMap<String, Object>();
                resultMap.put("cancel", true);

                callbackContext.success(new JSONObject(resultMap));
            }
        });
    }

    /**
     * Used to perform validation for the change password dialog.
     *
     * If validation passes, the dialog will be closed and the plugin callback will be invoked.
     *
     * If validation fails, validation messages will be shown on the appropriate text fields.
     *
     * @param minLength The minimum length for the new password; -1 to not enforce.
     * @param dialog The change password dialog instance.
     * @param dialogLayout The layout for the change password dialog.
     * @param callbackContext The Cordova plugin callback context.
     */
    private void validateChangePassword(int minLength, AlertDialog dialog, LinearLayout dialogLayout, CallbackContext callbackContext) {

        // Obtain references to the input fields.

        EditText etCurrentPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "CurrentPassword"));

        EditText etNewPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "NewPassword"));

        EditText etConfirmPassword = (EditText) dialogLayout
                .findViewById(R.getId("id", "ConfirmPassword"));

        // Grab the password values.

        String currentPassword = etCurrentPassword.getText().toString();
        String newPassword = etNewPassword.getText().toString();
        String confirmPassword = etConfirmPassword.getText().toString();

        // Perform validation.

        if (currentPassword.equals("")) {
            etCurrentPassword.setError("Current password is required.");
            etCurrentPassword.requestFocus();
            return;
        }

        if (newPassword.equals("")) {
            etNewPassword.setError("New password is required.");
            etNewPassword.requestFocus();
            return;
        }

        if (confirmPassword.equals("")) {
            etConfirmPassword.setError("Confirm new password is required.");
            etConfirmPassword.requestFocus();
            return;
        }

        if (minLength != -1 && newPassword.length() < minLength) {
            etNewPassword.setText("");
            etConfirmPassword.setText("");
            String message = String.format("The new password needs to be at least %d characters long.", minLength);
            etNewPassword.setError(message);
            etNewPassword.requestFocus();
            return;
        }

        if (!newPassword.equals(confirmPassword)) {
            etNewPassword.setText("");
            etConfirmPassword.setText("");
            etNewPassword.setError("The new passwords do not match, please try again.");
            etNewPassword.requestFocus();
            return;
        }

        // If validation passed, invoke the plugin callback with the results.

        dialog.dismiss();

        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("cancel", false);
        resultMap.put("currentPassword", currentPassword);
        resultMap.put("newPassword", newPassword);

        callbackContext.success(new JSONObject(resultMap));
    }

    //endregion
}
