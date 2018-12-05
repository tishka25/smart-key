// (c) 2018 Teodor Stanishev

/* global mainPage, deviceList, refreshButton */
/* global detailPage, DeviceInfoState, DeviceInfoStateButton, disconnectButton */
/* global ble  */

/* jshint browser: true , devel: true*/
"use strict";

//SERVICES AND CHARACTERISTIC
var CAR_SERVICE = "ca227c6b-d187-4aaf-b330-37144d84b02c";
var CHARACTERISTICS = {
  WINDOWS: {
    LEFT: {
      UUID: "3ff8860e-72ca-4a25-9c4e-99c7d3b08e9b",
      UP: 0x51,
      DOWN: 0x52
    },
    RIGHT: {
      UUID: "96cc6576-b9b0-443b-b8e6-546bbd20d374",
      UP: 0x54,
      DOWN: 0x55
    }
  },
  IGNITION: {
    UUID: "4ad1bbf1-b3e6-4239-a3bb-520624ee1329",
    ON: 0x60,
    START: 0x62
  },
  PIN_CODE: {
    UUID: "def231dc-07d4-4a71-b735-811e07d44c07"
  },
  DEFAULT: 0x50
};

//Device to autoConnect
//TODO make this read/write from a file
// var deviceId = "DD7449D0-6F2C-9456-4346-38F5812FA3F4";
var deviceId = null;
//

//Interval to read all states
var readStatesInterval = null;
//

var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    refreshButton.addEventListener("click", this.scanForDevices, false);
    disconnectButton.addEventListener("click", this.disconnect, false);

    //Auto connect
    autoConnectButton.addEventListener(
      "change",
      function(data) {
        if (autoConnectButton.checked) {
          app.autoConnect();
        } else {
          return;
        }
      },
      false
    );
    //
  },
  onDeviceReady: function() {
    StatusBar.overlaysWebView(true);
    StatusBar.styleDefault();

    ble.isEnabled(
      () => console.log("Enabled"),
      () => navigator.notification.alert("Bluetooth isn't enabled")
    );
    app.scanForDevices();

  },
  initialSetup: function() {
    app.subscribeCharacteristic(CAR_SERVICE,CHARACTERISTICS.WINDOWS.LEFT.UUID,windowLeftValue,"");
    app.subscribeCharacteristic(CAR_SERVICE,CHARACTERISTICS.WINDOWS.RIGHT.UUID,windowRightValue,"");
    app.subscribeCharacteristic(CAR_SERVICE,CHARACTERISTICS.IGNITION.UUID,ignitionValue,"");
  },
  autoConnect: function() {
    console.log("Auto connect searching");
    var onDiscover = function(device) {
      ble.autoConnect(deviceId, app.connect, app.disconnect);
    };
    var onTimeout = function() {
      //TODO
      autoConnectButton.change();
    };

    ble.startScan([], onDiscover, app.onError);
    setTimeout(() => ble.disconnect(deviceId, onTimeout, app.onError), 5000);
  },
  scanForDevices: function() {
    app.emptyLists();
    app.showPage(devicesPage, "Select a device");
    // scan for all devices
    ble.startScanWithOptions([],{ reportDuplicates: false },app.onDiscoverDevice,app.onError);
    // //Stop after 5 sec
    setTimeout(ble.stopScan, 5000);
  },
  onDiscoverDevice: function(device) {
    var listItem = document.createElement("li");
    listItem.className = "list-item list-item--tappable";
    var outerDiv = document.createElement("div");
    outerDiv.className = "list-item__center";
    var title = document.createElement("div");
    title.className = "list-item__title";
    title.innerHTML = device.name;
    var subTitle = document.createElement("div");
    subTitle.className = "list-item__subtitle";
    subTitle.innerHTML = device.rssi;

    title.appendChild(subTitle);
    outerDiv.appendChild(title);
    listItem.appendChild(outerDiv);

    // listItem.innerHTML = html;
    // listItem.dataset.deviceId = device.id; // TODO
    console.log("\n Device ID Before Click:" + listItem.id + "\n");

    listItem.addEventListener("click",function() {
        deviceId = device.id;
        app.connect();
      },
      false
    );
    deviceList.appendChild(listItem);
    // for (var i = 0; i < deviceList.children.length; i++) {
    //   var _device = deviceList.children[i];
    //   _device.addEventListener("click", app.connect, false);
    // }
  },
  connect: function(e) {
    connectingDialog.hidden = false;
    console.log("\n Device ID :" + deviceId + "\n");
    var onConnect = function(data) {
      connectingDialog.hidden = true;
      app.enterPin(function(pin){
        app.initialSetup();
        app.showPage(engineControl, "Engine Control");
      },function(){
        app.disconnect();
        app.scanForDevices();
      });
    };
    ble.connect(deviceId,onConnect,app.disconnect);
  },
  disconnect: function(event) {
    ble.disconnect(deviceId, app.scanForDevices, app.onError);
    clearInterval(readStatesInterval);
    app.scanForDevices();
  },

  //Helper functions
  subscribeCharacteristic: function(service, characteristic, target, text) {
    var onNotification = function(buffer) {
      var data = new Uint8Array(buffer);
      target.innerHTML = text + ("0x" + (data[0] >>> 0).toString(16));
    };
    ble.startNotification(
      deviceId,
      service,
      characteristic,
      onNotification,
      app.onError
    );
  },
  readCharacteristic: function(service, characteristic, target, text) {
    var onRead = function(buffer) {
      var data = new Uint8Array(buffer);
      target.innerHTML = text + (data[0] >>> 0).toString(16);
    };
    ble.read(deviceId, service, characteristic, onRead, app.onError);
  },
  writeState: function(event) {
    var succes = () => console.log("\nWriten succesfully!!!\n");
    var characteristic = null;

    var data = new Uint8Array(1);
    if (event.type === "touchstart") {
      if (event.target.id == "windowLeftUp") {
        characteristic = CHARACTERISTICS.WINDOWS.LEFT.UUID;
        data[0] = CHARACTERISTICS.WINDOWS.LEFT.UP;
      }
      if (event.target.id == "windowLeftDown") {
        characteristic = CHARACTERISTICS.WINDOWS.LEFT.UUID;
        data[0] = CHARACTERISTICS.WINDOWS.LEFT.DOWN;
      }
      if (event.target.id == "windowRightUp") {
        characteristic = CHARACTERISTICS.WINDOWS.RIGHT.UUID;
        data[0] = CHARACTERISTICS.WINDOWS.RIGHT.UP;
      }
      if (event.target.id == "windowRightDown") {
        characteristic = CHARACTERISTICS.WINDOWS.RIGHT.UUID;
        data[0] = CHARACTERISTICS.WINDOWS.RIGHT.UP;
      }
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:red;";
        characteristic = CHARACTERISTICS.IGNITION.UUID;
        data[0] = CHARACTERISTICS.IGNITION.ON;
      }
    } else if (event.type == "touchend") {
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:none";
        characteristic = CHARACTERISTICS.IGNITION.UUID;
        data[0] = CHARACTERISTICS.DEFAULT;
      } else if (
        event.target.id == "windowLeftDown" ||
        event.target.id == "windowLeftUp"
      ) {
        characteristic = CHARACTERISTICS.WINDOWS.LEFT.UUID;
        data[0] = CHARACTERISTICS.DEFAULT;
      } else if (
        event.target.id == "windowRightDown" ||
        event.target.id == "windowRightUp"
      ) {
        characteristic = CHARACTERISTICS.WINDOWS.RIGHT.UUID;
        data[0] = CHARACTERISTICS.DEFAULT;
      }
    }
    console.log("\n" + characteristic + "\n");
    ble.write(deviceId,CAR_SERVICE,characteristic,data.buffer,succes,app.onError);
  },
  enterPin: function(onEnter, onCancel){
    var options = {
      title: "Enter Password",
      message: "Please enter your login password.",
      minLength: 4
    };
    PasswordDialogPlugin.showEnterPassword(options, function(result) {
        if (result.cancel) {
          console.log("User cancelled the enter password dialog.");
          onCancel();
        } else {
          console.log("User completed the enter password dialog.",result.password);
          ble.write(deviceId , CAR_SERVICE , CHARACTERISTICS.PIN_CODE.UUID , app.stringToBytes(result.password.toString()) , 
          ()=>console.log("Writen succesfulyy") , app.onError);
          onEnter(result.password);
        }
      },app.onError);

  },
  emptyLists: function() {
    deviceList.innerHTML = ""; // empties the list
  },
  showPage: function(page, title) {
    var pages = document.getElementsByClassName("pages");
    for (var i = 0; i < pages.length; i++) {
      pages[i].hidden = true;
    }
    setTimeout(() => {
      page.hidden = false;
      pageTitle.innerHTML = title;
    }, 50);
    nativetransitions.fade(0.2);
  },
  createFile: function(fileName = "file.txt") {
    var type = window.PERSISTENT;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, app.onError);

    function successCallback(fs) {
      fs.root.getFile(
        fileName,
        {
          create: true,
          exclusive: true
        },
        function(fileEntry) {
          alert("File creation successfull!");
        },
        function(error) {
          if (error.code == FileError.PATH_EXISTS_ERR) {
            console.log(FileError.PATH_EXISTS_ERR);
          } else if (error.code < 13) {
            app.onError(error.code);
          }
        }
      );
    }
  },
  writeToFile: function(fileName, information) {
    var type = window.PERSISTENT;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, app.onError);

    function successCallback(fs) {
      fs.root.getFile(
        fileName,
        {
          create: true
        },
        function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
              console.log("Write completed.");
            };

            fileWriter.onerror = function(e) {
              console.log("Write failed: " + e.toString());
            };

            var blob = new Blob([information], {
              type: "text/plain"
            });
            fileWriter.truncate(information.length);
            // fileWriter.seek(0);
            fileWriter.write(blob);
          }, app.onError);
        },
        app.onError
      );
    }
  },
  readFile: function(fileName, handler) {
    var type = window.PERSISTENT;
    var information = null;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, app.onError);

    function successCallback(fs) {
      fs.root.getFile(
        fileName,
        {},
        function(fileEntry) {
          fileEntry.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
              handler(this.result);
            };
            reader.readAsText(file);
          }, app.onError);
        },
        app.onError
      );
    }
    return information;
  },
  stringToBytes: function(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
     }
     return array.buffer;
  },
  onError: function(reason) {
    navigator.notification.alert("ERROR: " + reason); // real apps should use notification.alert
    console.log(reason);
  }
};
