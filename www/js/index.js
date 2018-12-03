// (c) 2018 Teodor Stanishev

/* global mainPage, deviceList, refreshButton */
/* global detailPage, DeviceInfoState, DeviceInfoStateButton, disconnectButton */
/* global ble  */

/* jshint browser: true , devel: true*/
"use strict";

/* States  
    WINDOWS
        WINDOW_DEFAULT
        WINDOW_LEFT_UP
        WINDOW_LEFT_DOWN
        WINDOW_RIGHT_UP
        WINDOW_RIGHT_DOWN
    IGNITION
        IGNITION_ON
        IGNITION_OFF
        IGNITION_START
    CLIMATE_CONTROL
        //TODO
    //

*/

//SERVICES AND CHARACTERISTIC
var CAR_SERVICE = "ca227c6b-d187-4aaf-b330-37144d84b02c";
var WINDOWS = {
  DEFAULT: 0x50,
  LEFT: {
    CHARACTERISTIC: "3ff8860e-72ca-4a25-9c4e-99c7d3b08e9b",
    UP: 0x51,
    DOWN: 0x52
  },
  RIGHT: {
    CHARACTERISTIC: "96cc6576-b9b0-443b-b8e6-546bbd20d374",
    UP: 0x54,
    DOWN: 0x55
  }
};
var IGNITION = {
  CHARACTERISTIC: "e8d26993-a6b5-4402-bcff-0e44be7081cb",
  OFF: 0x61,
  ON: 0x60,
  START: 0x62
};

//Device to autoConnect
//TODO make this read/write from a file
var deviceId = "DD7449D0-6F2C-9456-4346-38F5812FA3F4";
//

//Interval to read all states
var readStatesInterval = null;
//

var app = {
  initialize: function () {
    this.bindEvents();
  },
  bindEvents: function () {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    refreshButton.addEventListener("click", this.scanForDevices, false);
    disconnectButton.addEventListener("click", this.disconnect, false);



    //Auto connect
    autoConnectButton.addEventListener(
      "change",
      function (data) {
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
  onDeviceReady: function () {
    // ble.isEnabled(()=>console.log("Enabled") , ()=> navigator.notification.alert("Bluetooth isn't enabled"));
    app.scanForDevices();
  },
  initialSetup: function () {

  },
  autoConnect: function () {
    console.log("Auto connect searching");
    var onDiscover = function (device) {
      ble.autoConnect(deviceId, app.connect, app.disconnect);
    };
    var onTimeout = function () {
      //TODO
      autoConnectButton.change();
    };

    ble.startScan([], onDiscover, app.onError);
    setTimeout(() => ble.disconnect(deviceId, onTimeout, app.onError), 5000);
  },
  scanForDevices: function () {
    app.emptyLists();
    app.showPage(devicesPage, "Select a device");
    // scan for all devices
    // ble.startScanWithOptions([],{ reportDuplicates: false },app.onDiscoverDevice , app.onError);
    // //Stop after 5 sec
    // setTimeout(ble.stopScan, 5000);
  },
  onDiscoverDevice: function (device) {

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

    listItem.addEventListener("click", function () {
      deviceId = device.id;
      app.connect();
    }, false);
    deviceList.appendChild(listItem);
    // for (var i = 0; i < deviceList.children.length; i++) {
    //   var _device = deviceList.children[i];
    //   _device.addEventListener("click", app.connect, false);
    // }
  },
  connect: function (e) {
    connectingDialog.hidden = false;
    console.log("\n Device ID :" + deviceId + "\n");
    var onConnect = function (data) {
      app.showPage(engineControl, "Engine Control");
      connectingDialog.hidden = true;
    };
    ble.connect(deviceId, onConnect, app.disconnect);
  },
  disconnect: function (event) {
    ble.disconnect(deviceId, app.scanForDevices, app.onError);
    clearInterval(readStatesInterval);
    app.scanForDevices();
  },
  readCharacteristic: function (service, characteristic, target, text) {
    var onRead = function (data) {
      // var info = document.createElement('li');
      var d = new Uint8Array(data);
      var message = "";
      for (var i = 0; i < d.length; i++) {
        message += String.fromCharCode(d[i]);
      }
      target.innerHTML = text + message;
    };
    ble.read(deviceId, service, characteristic, onRead, app.onError);
  },
  writeState: function (event) {
    var succes = () => console.log("\nWriten succesfully!!!\n");
    var characteristic = null;

    var data = new Uint8Array(1);
    if (event.type === "touchstart") {
      if (event.target.id == "windowLeftUp") {
        characteristic = WINDOWS.LEFT.CHARACTERISTIC;
        data[0] = WINDOWS.LEFT.UP;
      }
      if (event.target.id == "windowLeftDown") {
        characteristic = WINDOWS.LEFT.CHARACTERISTIC;
        data[0] = WINDOWS.LEFT.DOWN;
      }
      if (event.target.id == "windowRightUp") {
        characteristic = WINDOWS.RIGHT.CHARACTERISTIC;
        data[0] = WINDOWS.RIGHT.UP;
      }
      if (event.target.id == "windowRightDown") {
        characteristic = WINDOWS.RIGHT.CHARACTERISTIC;
        data[0] = WINDOWS.RIGHT.DOWN;
      }
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:red;";
        characteristic = IGNITION.CHARACTERISTIC;
        data[0] = IGNITION.ON;
      }
    } else if (event.type == "touchend") {
      if (event.target.id == "engineStartButton")
        event.target.style = "border-radius: 100%;background-color:none";

      data[0] = WINDOWS.DEFAULT;
      console.log(deviceId, CAR_SERVICE, event.target.id, data);

    }
    //TODO ALERT
    // ble.write(deviceId, CAR_SERVICE , characteristic , data.buffer , succes , app.onError);

  },
  emptyLists: function () {
    deviceList.innerHTML = ""; // empties the list
  },
  showPage: function (page, title) {
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
  createFile: function (fileName = "file.txt") {
    var type = window.PERSISTENT;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, app.onError);

    function successCallback(fs) {
      fs.root.getFile(fileName, {
        create: true,
        exclusive: true
      }, function (fileEntry) {
        alert("File creation successfull!");
      }, function (error) {
        if (error.code == FileError.PATH_EXISTS_ERR) {
          console.log(FileError.PATH_EXISTS_ERR);
        } else if (error.code < 13) {
          app.onError(error.code);
        }
      });
    }
  },
  writeToFile: function (fileName, information) {
    var type = window.PERSISTENT;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, app.onError);

    function successCallback(fs) {
      fs.root.getFile(fileName, {
          create: true
        }, function (fileEntry) {
          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function (e) {
              console.log("Write completed.");
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
          }, app.onError);
        },
        app.onError
      );
    }
  },
  readFile: function (fileName, handler) {
    var type = window.PERSISTENT;
    var information = null;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, app.onError);

    function successCallback(fs) {
      fs.root.getFile(fileName, {}, function (fileEntry) {
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
    }
    return information;
  },
  onError: function (reason) {
    navigator.notification.alert("ERROR: " + reason); // real apps should use notification.alert
    console.log(reason);
  }
};