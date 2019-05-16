// (c) 2018 Teodor Stanishev

/* jshint browser: true , devel: true*/
"use strict";

//SERVICES AND CHARACTERISTIC

var CAR_SERVICE = "ca227c6b-d187-4aaf-b330-37144d84b02c";
var Characteristic = {
  UUID: "3ff8860e-72ca-4a25-9c4e-99c7d3b08e9b",
  DEFAULT: 0x50,
  windows: {
    UP: 0x51,
    DOWN: 0x52,
    currentValue: 0x50
  },
  ignition: {
    ON: 0x60,
    OFF: 0x50,
    STARTER_ON: 0x62,
    STARTER_OFF: 0x63,
    currentValue: 0x50
  },
  centralLocking: {
    UNLOCK: 0x75,
    currentValue: 0x50
  },
  trunk: {
    OPEN: 0x77,
    currentValue: 0x50
  },
  password: {
    UUID: "def231dc-07d4-4a71-b735-811e07d44c07",
    currentValue: ""
  },
  DATE: {
    currentValue: "0",
    SET_DATE_TIME: "1",
    CENTRAL_LOCK: "3",
    //TODO
  }
};

//Device to autoConnect
var deviceId = null;
var password = null;
var deviceName = null;
//
var characteristicValue = null;

//The buffer to be sent
var dataBuffer = new Uint8Array(15);


var app = {
  /**
   * The function from which the flow of the app begins
   */
  initialize: function () {
    this.bindEvents();
  },
  /**
   * Function to bind all function to specific events
   */
  bindEvents: function () {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    refreshButton.addEventListener("click", this.scanForDevices, false);
    setAlarmButton.addEventListener("click", function () {
      setAlarmDialog.hidden = false;
    }
      , false);
    setCurrentTimeButton.addEventListener("click", function () {
      setTimeDialog.hidden = false;
    }, false);

    if (document.getElementById("autoConnectButton").checked) {
      app.autoConnect();
    }

    document.getElementById("autoConnectButton").addEventListener('change', function () {
      if (this.checked)
        app.autoConnect();
      else
        return;
    });

  },
  /**
   * Callback function for when "deviceready" events has been called
   */
  onDeviceReady: function () {
    app.showPage('devicesPage', "Select a device");
    StatusBar.overlaysWebView(true);
    StatusBar.styleDefault();
    StatusBar.backgroundColorByName("white");
    ble.isEnabled(() => console.log("Enabled"), () => navigator.notification.alert("Bluetooth isn't enabled"));
    app.scanForDevices();
  },
  /**
   * Initial setup function after a succesful connection has been acquired
   */
  initialSetup: function () {
    //Subscribe to all characteristic
    app.subscribeCharacteristic(CAR_SERVICE, Characteristic.UUID, null, null, true, function (data) {
      //Set the date command to DEFAULT
      data[14] = 48;
      dataBuffer.set(data, 0);
      //Update the clock showint the device current time
      var currDate = new Date(0);
      //Parse the date from seconds to Date format
      currDate.setUTCSeconds(parseInt(String.fromCharCode.apply(null, data.subarray(4,14))));
      //Fix the timezone issue
      currDate = currDate.toUTCString();
      console.log(parseInt(String.fromCharCode.apply(null, data.subarray(4,14))) , "Current date and time is: " + currDate);
      //Show the time
      dateTimeOnDevice.innerHTML = currDate;
      //
    });
  },
  /**
   * Auto connect to the specific device that has been saved to internal memory
   */
  autoConnect: function () {
    var device = {
      id: null,
      password: null
    };
    app.readFile("device.txt", function (data) {
      var buff = JSON.parse(data);
      device.id = buff.id;
      device.password = buff.password;
      deviceName = buff.name;
      ble.startScanWithOptions([], { reportDuplicates: false }, onConnect, app.onError);
      var onConnect = function () {
        deviceId = device.id;
        app.showPage('engineControl', "Engine Control");

        connectingDialog.hidden = true;
        ble.write(device.id, CAR_SERVICE, Characteristic.password.UUID, app.stringToBytes(device.password).buffer, null, function () {
          navigator.notification.alert("There was an error auto connecting to device");
          app.disconnect();
          app.scanForDevices();
        });
        app.initialSetup();
        password = device.password;
      };
      ble.autoConnect(device.id, onConnect, app.onError);
    });
  },
  /**
   * This function opens the scan page , and initializes the scan for BLE devices.
   * Usually it is attached to an event
   */
  scanForDevices: function () {
    app.emptyLists();
    app.showPage('devicesPage');
    ble.startScanWithOptions([], { reportDuplicates: false }, app.onDiscoverDevice, app.onError);

    // //Stop after 5 sec
    setTimeout(ble.stopScan, 5000);
  },
  /**
   * Callback function for BLE devices that have been discovered after a scan.
   * This function appends the current device to the <ul> element and adds "click" events to the <li>
   * @param {JSON} device - discovered device object
   * const device = {
   *    name: {String},
   *    rssi: {Int},
   *    uuid: {String}
   * }
   */
  onDiscoverDevice: function (device) {
    var listItem = document.createElement("ons-list-item");
    listItem.style = "height: 70px";
    var leftItem = document.createElement("div");
    leftItem.className = "left";
    leftItem.style = "font-size: 18px"
    leftItem.innerHTML = device.name;
    var rightItem = document.createElement("div");
    rightItem.className = "right";
    rightItem.innerHTML = "RSSI: " + device.rssi;

    var rssi = Math.abs(device.rssi);
    if (rssi >= 80) {
      rightItem.style = "color: #e84343";
    } else if (rssi >= 50 && rssi < 80) {
      rightItem.style = "color: #c18817";
    } else if (rssi < 50) {
      rightItem.style = "color: #6fe837";
    }

    listItem.appendChild(leftItem);
    listItem.appendChild(rightItem);
    listItem.addEventListener("click", function () {
      deviceId = device.id;
      deviceName = device.name;
      app.connect();
    },
      false
    );
    deviceList.appendChild(listItem);
  },
  /**
   * Connect to the specific device.
   * After a connection has been made , a prompt appears for password
   * @param {Event} e 
   */
  connect: function (e) {
    connectingDialog.hidden = false;
    console.log("\n Device ID :" + deviceId + "\n");
    var onConnect = function (data) {
      app.showPage('engineControl', "Engine Control");
      app.initialSetup();
      connectingDialog.hidden = true;
      app.enterPin(function () {
        app.showPage('engineControl', "Engine Control");
        app.initialSetup();
      }, function () {
        app.disconnect();
        app.scanForDevices();
      });
    };
    ble.connect(deviceId, onConnect, app.disconnect);
  },
  /**
   * Disconnect from the currently connected device
   * @param {Event} event 
   */
  disconnect: function (event) {
    ble.disconnect(deviceId, app.scanForDevices, app.onError);
    deviceId = null;
    password = null;
    deviceName = null;
    connectingDialog.hidden = true;
  },
  /**
   * Subscribe to a specicic characteristic for notification messages
   * 
   * @param {String} service - UUID of the service 
   * @param {String} characteristic - UUID of the characteristic you wish to subscribe to 
   * @param {DOM} target - DOM element that is going to print the notification values
   * @param {String} text - Text before the printed value
   * @param {Boolean} isString - Is the notification values string or not
   * @param {callback} onReadCallback - Callback after a notification message has been received
   */
  subscribeCharacteristic: function (service, characteristic, target, text, isString, onReadCallback) {
    var txt = "null";
    var onNotification = function (buffer) {
      var data = new Uint8Array(buffer);
      // target.innerHTML = text + ("0x" + (data[0] >>> 0).toString(16));
      if (!isString && isString != null)
        txt = "0x" + (data >>> 0).toString(16);
      else if(isString != null)
        txt = String.fromCharCode.apply(null, data);

      if(target)  
        target.innerHTML = text + txt;
      if (onReadCallback)
        onReadCallback(data);
    };
    ble.startNotification(
      deviceId,
      service,
      characteristic,
      onNotification,
      app.onError
    );
  },
  /**
   * Read the value of the specific BLE characteristic
   * @param {String} service - UUID of the service 
   * @param {String} characteristic - UUID of the characteristic you wish to read from 
   * @param {DOM} target - DOM element that is going to print the values
   * @param {String} text - Text before the printed value
   * @param {Boolean} isString - If the values string or not
   */
  readCharacteristic: function (service, characteristic, target, text, isString) {
    var onRead = function (buffer) {
      var data = new Uint8Array(buffer);
      var txt = "";
      if (!isString)
        txt = (data[0] >>> 0).toString(16);
      else
        txt = String.fromCharCode.apply(null, data);
      target.innerHTML = text + txt;
    };
    ble.read(deviceId, service, characteristic, onRead, app.onError);
  },
  /**
   * Event handler function which handles all the writing to the BLE characteristic.
   * The function checks the event target and passes the correct values.
   * @param {Event} event - The main parameter from which the function decides what values to put where
   */
  writeState: function (event) {
    var succes = () => console.log("\nWriten succesfully!!!\n");
    var characteristic = Characteristic.UUID;
    if (event.type === "touchstart") {
      if (event.target.id == "windowUp") {
        Characteristic.windows.currentValue = Characteristic.windows.UP;
      }
      if (event.target.id == "windowDown") {
        Characteristic.windows.currentValue = Characteristic.windows.DOWN;
      }
      if (event.target.id == "lockButton") {
        Characteristic.centralLocking.currentValue = Characteristic.centralLocking.UNLOCK;
        lockButton.className = "fas fa-lock-open";
        lockButton.style = "color: green;";
      }
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:red;";
        Characteristic.ignition.currentValue = Characteristic.ignition.STARTER_ON;
      }
      if (event.target.id == "openTrunkButton") {
        Characteristic.trunk.currentValue = Characteristic.trunk.OPEN;
      }
    } else if (event.type == "touchend") {
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:none";
        Characteristic.ignition.currentValue = (ignitionSwitchButton.checked) ? Characteristic.ignition.STARTER_OFF : Characteristic.ignition.OFF;
      } else if (event.target.id == "windowDown" || event.target.id == "windowUp") {
        Characteristic.windows.currentValue = Characteristic.DEFAULT;
      }
      if (event.target.id == "openTrunkButton") {
        Characteristic.trunk.currentValue = Characteristic.DEFAULT;
      }
      if (event.target.id == "lockButton") {
        Characteristic.centralLocking.currentValue = Characteristic.DEFAULT;
        lockButton.className = "fas fa-lock"
        lockButton.style = "color: red;"
      }
    } else if (event.type == "change") {
      if (event.target.id == "ignitionSwitchButton") {
        Characteristic.ignition.currentValue = (ignitionSwitchButton.checked) ? Characteristic.ignition.ON : Characteristic.ignition.OFF;
      }
    }
    var data = [Characteristic.ignition.currentValue,
    Characteristic.windows.currentValue,
    Characteristic.centralLocking.currentValue,
    Characteristic.trunk.currentValue];

    dataBuffer.set(data, 0);
    console.log("\n\n\n" + dataBuffer + "\n\n\n");
    ble.write(deviceId, CAR_SERVICE, characteristic, dataBuffer.buffer, succes, app.onError);
  },
  /**
   * Sets the alarm event for the Smart car.
   * Converts the set time to Epoch seconds, passes the set event type(command) and writes it to the Characteristic
   * @param {Event} event - unused
   */
  setAlarm: function (event) {
   //The command for setting
   var command = Characteristic.DATE.CENTRAL_LOCK;
   //Convert current date and time to seconds since Epoch
   var time = Date.parse(new Date(dateTime.value)) * 0.001;

   //TOOD fix
   time = app.stringToBytes(time.toString() + command);

   dataBuffer.set(time, 4);

   ble.write(deviceId, CAR_SERVICE, Characteristic.UUID, dataBuffer.buffer, function () {
     dataBuffer.set([48], 14);
     setAlarmDialog.hidden = true;
    }, app.onError);
  },
  /**
   * Set the current time on the RTC(Real time clock) on the Smart car
   * Converts the set time to Epoch seconds, passes the set command(SET_TIME_ON_RTC) and writes it to the Characteristic
   * @param {Event} event - unused
   */
  setTime: function (event) {
    //The command for setting
    var command = Characteristic.DATE.SET_DATE_TIME;
    //Convert current date and time to seconds since Epoch
    var time = Date.parse(new Date(dateTime.value)) * 0.001;

    //TOOD fix
    time = app.stringToBytes(time.toString() + command);

    dataBuffer.set(time, 4);

    ble.write(deviceId, CAR_SERVICE, Characteristic.UUID, dataBuffer.buffer, function () {
      dataBuffer.set([48], 14);
      setTimeDialog.hidden = true;
    }, app.onError);
  },
  /**
   * Saves the currently connected device to internal memory , so it can be used for auto connecting later
   * @param {Event} event - unused
   */
  setAutoConnectDevice: function (event) {
    var _device = {
      id: deviceId,
      password: password,
      name: deviceName
    }
    var onConfirm = (index) => {
      if (index == 1) {
        app.writeToFile(cordova.file.dataDirectory, "device.txt", JSON.stringify(_device), true, function () {
          navigator.notification.alert("Auto connect device has been set succesfully with params: " + JSON.stringify(_device), null, "Auto connect");
        }, function (e) {
          app.onError(e);
        });
      } else {
        return;
      }
    }
    navigator.notification.confirm(
      "Are you sure you want to remove the old auto conect device and replace it with the current device?",
      onConfirm,
      'Warning',
      ['Yes', 'No']
    );
  },
  /**
   * Handler function for showing a password promt and writing the entered value 
   * to the password characteristic on the remote device.
   * @param {callback} onEnter - callback function after user clicking "OK"
   * @param {callback} onCancel - callback function after user canceling the promt
   */
  enterPin: function (onEnter, onCancel) {
    var options = {
      title: "Enter Password",
      message: "Please enter your login password.",
      minLength: 3
    };
    PasswordDialogPlugin.showEnterPassword(options, function (result) {
      if (result.cancel) {
        console.log("User cancelled the enter password dialog.");
        onCancel();
      } else {
        password = result.password;
        console.log("User completed the enter password dialog.", password);
        var pass = app.stringToBytes(password);
        console.log(pass, "Lenght is: " + pass.length);
        ble.write(deviceId, CAR_SERVICE, Characteristic.password.UUID, pass.buffer, onEnter, app.onError);
      }
    });
  },
  /**
   * Empties the device list.
   */
  emptyLists: function () {
    deviceList.innerHTML = "";
  },
  /**
   * Shows the page with the passed pageId and hides all the other pages.
   * This function works only with <div> elements that have classname of "pages"
   * @param {String} pageId - id of the page you wish to show
   */
  showPage: function (pageId) {
    if (deviceId != null || pageId == 'devicesPage') {
    var page = document.getElementById(pageId);
    var pages = document.getElementsByClassName("pages");
    for (var i = 0; i < pages.length; i++) {
      pages[i].hidden = true;
    }
    page.hidden = false;
    // pageTitle.innerHTML = title;
    }
  },
  /**
   * Helper function that uses the HTML File API.
   * 
   * Writes to file , with given File name.
   * 
   * Returns ERROR_CODE 12 , when the file already exist.
   * It's up to the developer to implement that error.
   * 
   * @param {string} fileName
   * @param {string} information information to put in the file 
   * @param {boolean} override - true to override the file , false not to
   * @param {callback} onWrite callback when the file has been writen 
   * @param {callback} onError callback when an error occurs
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/FileError}
   * @example 
   * writeToFile("Test.txt" , "This is a test text file" , true , function(){
    *    console.log("Success");
    * } , function(e){
    *    //Error
    *    console.log(e);
    * })
    */
  writeToFile: function (fileName, information, override, onWrite, onError) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
      dir.getFile(
        fileName, { create: true, exclusive: !override },
        function (fileEntry) {
          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function (e) {
              console.log("Write completed.");
              onWrite(fileName);
            };
            fileWriter.onerror = function (e) {
              console.log("Write failed: " + e.toString());
            };
            var blob = new Blob([information], {
              type: "text/plain"
            });
            fileWriter.truncate(information.length);
            // fileWriter.seek(0);
            fileWriter.write(blob);
          }, onError);
        },
        onError
      );
    });
  },
  /**
   * Helper function part oF the HTML File API
   * @param {string} fileName File from which to read
   * @param {callback} handler callback when the file has bean read. It's up to developer to use the returned information of the file 
   * @example
   * readFile("File.txt", function(data){
   *    console.log(data);
   * }); 
  */
  readFile: function (fileName, handler) {
    var path = cordova.file.dataDirectory;
    window.resolveLocalFileSystemURL(path, function (dir) {
      dir.getFile(
        fileName,
        {},
        function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
              handler(this.result);
            };
            reader.readAsText(file);
          }, app.onError);
        },
        app.onError
      );
    });
  },
  /**
   * Helper function part oF the HTML File API.
   * Deletes a file from the Data Directory
   * @param {string} fileName 
   * @param {callback} onDelete called when a file has been successfully removed
   */
  deleteFile: function (fileName, onDelete) {
    var path = cordova.file.dataDirectory;
    window.resolveLocalFileSystemURL(path, function (dir) {
      dir.getFile(
        fileName,
        {
          create: false
        },
        function (fileEntry) {
          fileEntry.remove(
            function () {
              // The file has been removed succesfully
              onDelete();
              console.log("Deleted file: ", fileName);
            },
            function (error) {
              // Error deleting the file
              console.log(error);
            },
            function () {
              console.log("The file doesn't exist");
            }
          );
        }
      );
    });
  },
  /**
   * Helper function for convering string values to Uint8Array 
   * @param {String} string - the String which you wish to convert
   */
  stringToBytes: function (string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array;
  },
  /**
   * Handler function after an error has occured anywhere.
   * It show a notification message with the error
   * @param {Object} reason 
   */
  onError: function (reason) {
    navigator.notification.alert("ERROR: " + reason); // real apps should use notification.alert
    console.log(reason);
  }
};
