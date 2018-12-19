// (c) 2018 Teodor Stanishev

/* global mainPage, deviceList, refreshButton */
/* global detailPage, DeviceInfoState, DeviceInfoStateButton, disconnectButton */
/* global ble  */

/* jshint browser: true , devel: true*/
"use strict";

//SERVICES AND CHARACTERISTIC

var CAR_SERVICE = "ca227c6b-d187-4aaf-b330-37144d84b02c";
var Characteristic = {
  UUID: "3ff8860e-72ca-4a25-9c4e-99c7d3b08e9b",
  DEFAULT: 0x50,
  windows: {
    left: {
      UP: 0x51,
      DOWN: 0x52,
      currentValue: 0x50
    },
    right: {
      UP: 0x54,
      DOWN: 0x55,
      currentValue: 0x50
    }
  },
  ignition: {
    ON: 0x60,
    START: 0x62,
    currentValue: 0x50
  },
  centralLocking: {
    UNLOCK: 0x75,
    currentValue: 0x50
  },
  password: {
    UUID:"def231dc-07d4-4a71-b735-811e07d44c07" ,
    currentValue: ""
  },
  DATE: {
    currentValue: "",
    SET_DATE_TIME: "1",
    //TODO
  }
};

//Device to autoConnect
//TODO make this read/write from a file
// var deviceId = "DD7449D0-6F2C-9456-4346-38F5812FA3F4";
var deviceId = null;
//
var characteristicValue = null;

//The buffer to be sent
var dataBuffer = new Uint8Array(15);


var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    refreshButton.addEventListener("click", this.scanForDevices, false);
    disconnectButton.addEventListener("click", this.disconnect, false);
    setAlarmButton.addEventListener("click" , function(){
      setAlarmDialog.hidden = false;
    }
    , false);
    setCurrentTimeButton.addEventListener("click" ,function(){
      setTimeDialog.hidden = false;
    } , false);


    // setTimeButton.addEventListener("click" , function(){
    //   ble.write(deviceId , CAR_SERVICE , setTimeDialog.dataset.characteristic , ()=>console.log("OKUREEC") , app.onError);
    // } , false);


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

    ble.isEnabled(() => console.log("Enabled"),() => navigator.notification.alert("Bluetooth isn't enabled"));
    app.scanForDevices();

  },
  initialSetup: function() {
    //Subscribe to all characteristic
    app.subscribeCharacteristic(CAR_SERVICE,Characteristic.UUID,windowLeftValue,"" , true , function(data){
      //Set the date command to DEFAULT
      data[14] = 48;
      dataBuffer.set(data,0);

      var isLocked = dataBuffer[3];
        if(isLocked == Characteristic.centralLocking.UNLOCK){
        lockButtonHolder.hidden = true;
        unlockButtonHolder.hidden = false;
        // nativetransitions.fade(0.2);
      }else if(isLocked == Characteristic.DEFAULT){
        lockButtonHolder.hidden = false;
        unlockButtonHolder.hidden = true;
        // nativetransitions.fade(0.2);
      }
    });
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
    app.showPage('devicesPage', "Select a device");
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
    console.log("\n Device ID Before Click:" + listItem.id + "\n");

    listItem.addEventListener("click",function() {
        deviceId = device.id;
        app.connect();
      },
      false
    );
    deviceList.appendChild(listItem);
  },
  connect: function(e) {
    connectingDialog.hidden = false;
    console.log("\n Device ID :" + deviceId + "\n");
    var onConnect = function(data) {
      app.showPage('engineControl', "Engine Control");
      app.initialSetup();
      connectingDialog.hidden = true;
      app.enterPin(function(){
        app.showPage('engineControl', "Engine Control");
        app.initialSetup();
      },function(){
        app.disconnect();
        app.scanForDevices();
      });
    };
    ble.connect(deviceId,onConnect,app.disconnect);
  },
  disconnect: function(event) {
    ble.disconnect(deviceId, app.scanForDevices, app.onError);
    deviceId = null;
    app.scanForDevices();
  },

  //Helper functions
  subscribeCharacteristic: function(service, characteristic, target, text , isString , onReadCallback) {
    var txt = "null";
    var onNotification = function(buffer) {
      var data = new Uint8Array(buffer);
      // target.innerHTML = text + ("0x" + (data[0] >>> 0).toString(16));
      if(!isString)
        txt = "0x" + (data >>> 0).toString(16);
      else
        txt = String.fromCharCode.apply(null, data);
      target.innerHTML = text + txt;
      if(onReadCallback)
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
  readCharacteristic: function(service, characteristic, target, text , isString) {
    var onRead = function(buffer) {
      var data = new Uint8Array(buffer);
      var txt="";
      if(!isString)
        txt = (data[0] >>> 0).toString(16);
      else
        txt = String.fromCharCode.apply(null, data);
      target.innerHTML = text + txt;
    };
    ble.read(deviceId, service, characteristic, onRead, app.onError);
  },
  writeState: function(event) {
    var succes = () => console.log("\nWriten succesfully!!!\n");
    
    var characteristic = Characteristic.UUID;

    if(event.type === "click"){
      if(event.target.id === "lockButton"){
        Characteristic.centralLocking.currentValue = Characteristic.centralLocking.UNLOCK;
      }else if(event.target.id === "unlockButton"){
        Characteristic.centralLocking.currentValue = Characteristic.DEFAULT;        
      }
    }
    if (event.type === "touchstart") {
      if (event.target.id == "windowLeftUp") {
        // data[1] = Characteristic.windows.left.UP;
        Characteristic.windows.left.currentValue = Characteristic.windows.left.UP;
      }
      if (event.target.id == "windowLeftDown") {
        // data[1] = Characteristic.windows.left.DOWN;
        Characteristic.windows.left.currentValue = Characteristic.windows.left.DOWN;
      }
      if (event.target.id == "windowRightUp") {
        // data[2] = Characteristic.windows.right.UP;
        Characteristic.windows.right.currentValue = Characteristic.windows.right.UP;
      }
      if (event.target.id == "windowRightDown") {
        // data[2] = Characteristic.windows.right.DOWN;
        Characteristic.windows.right.currentValue = Characteristic.windows.right.DOWN;
      }
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:red;";
        // data[0] = Characteristic.ignition.ON;
        Characteristic.ignition.currentValue = Characteristic.ignition.ON;
      }
    } else if (event.type == "touchend") {
      if (event.target.id == "engineStartButton") {
        event.target.style = "border-radius: 100%;background-color:none";
        // data[0] = Characteristic.DEFAULT;
        Characteristic.ignition.currentValue = Characteristic.DEFAULT;
      } else if (
        event.target.id == "windowLeftDown" || event.target.id == "windowLeftUp") {
        // data[1] = Characteristic.DEFAULT;
        Characteristic.windows.left.currentValue = Characteristic.DEFAULT;
      } else if (
        event.target.id == "windowRightDown" || event.target.id == "windowRightUp") {
        // data[2] = Characteristic.DEFAULT;
        Characteristic.windows.right.currentValue = Characteristic.DEFAULT;
      }
    }

    var data = [Characteristic.ignition.currentValue ,
      Characteristic.windows.left.currentValue ,
      Characteristic.windows.right.currentValue, 
      Characteristic.centralLocking.currentValue];

    dataBuffer.set(data , 0);
    // console.log("\n" + dataBuffer.buffer + "\n");
    ble.write(deviceId,CAR_SERVICE,characteristic,dataBuffer.buffer,succes,app.onError);
  },
  setTime: function(event){
    //The command for setting
    var command = Characteristic.DATE.SET_DATE_TIME;
    //Convert current date and time to seconds since Epoch
    var time = Date.parse(new Date(dateTime.value)) * 0.001; 

    //TOOD fix
    time = app.stringToBytes(time.toString() + command);

    dataBuffer.set(time , 4);

    ble.write(deviceId , CAR_SERVICE , Characteristic.UUID , dataBuffer.buffer , function(){
      dataBuffer.set([48] , 14);
      setTimeDialog.hidden = true;
    } , app.onError);
  },
  setAlarm: function(event){
    var command = dateCommand.value;
    console.log(command);
  },
  enterPin: function(onEnter, onCancel){
    var options = {
      title: "Enter Password",
      message: "Please enter your login password.",
      minLength: 3
    };
    PasswordDialogPlugin.showEnterPassword(options, function(result) {
        if (result.cancel) {
          console.log("User cancelled the enter password dialog.");
          onCancel();
        } else {
          var pass = result.password;
          console.log("User completed the enter password dialog.",pass);
          // p = app.stringToBytes(p + "");
          // Characteristic.password.currentValue = p;

          // characteristicValue=characteristicValue.slice(0,characteristicValue.byteLength-1);
          // var pass  = new Uint8Array(characteristicValue.byteLength+p.byteLength);
          // pass.set(characteristicValue,0);
          // pass.set(p , characteristicValue.byteLength);

          pass = app.stringToBytes(pass);
          
          console.log(pass ,  "Lenght is: " + pass.length);
          ble.write(deviceId , CAR_SERVICE , Characteristic.password.UUID , pass.buffer , onEnter , app.onError);
          // onEnter(result.password);
        }
      });
  },
  emptyLists: function() {
    deviceList.innerHTML = ""; // empties the list
  },
  showPage: function(pageId, title) {
    if(deviceId!=null || pageId=='devicesPage'){
      var  page = document.getElementById(pageId);
      var pages = document.getElementsByClassName("pages");
      for (var i = 0; i < pages.length; i++) {
        pages[i].hidden = true;
      }
      // setTimeout(function(){
        page.hidden = false;
        pageTitle.innerHTML = title;
      // } , 50);
      // nativetransitions.flip(0.5 , "right");
    }
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
     return array;
  },
  onError: function(reason) {
    navigator.notification.alert("ERROR: " + reason); // real apps should use notification.alert
    console.log(reason);
  }
};
