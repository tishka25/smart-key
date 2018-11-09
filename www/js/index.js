// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, DeviceInfoState, DeviceInfoStateButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';


var ButtonState = {
    service: "0000160a-0000-1000-8000-00805F9B34FB",
    characteristic: "00002a28-0000-1000-8000-00805F9B34FB"
};
var DeviceModel = {
    service: "0000180a-0000-1000-8000-00805F9B34FB",
    characteristic:"00002a29-0000-1000-8000-00805F9B34FB"
}
var deviceId = 'DD7449D0-6F2C-9456-4346-38F5812FA3F4';
                
var readButtonStateInterval = null;



var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('click', this.scanForDevices, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
        changeState.addEventListener('touchstart' ,this.writeState , false);
        changeState.addEventListener('touchend' ,this.writeState , false);
    },
    onDeviceReady: function() {
        ble.isEnabled(()=>console.log("Enabled") , ()=> navigator.notification.alert("Bluetooth isn't enabled")); 
        app.scanForDevices();

        // //Go to scanner if not connect after 10 sec
        // setTimeout(function(){
        //     // ble.disconnect();
        //     ble.isConnected(deviceId , ()=>console.log("nice"), app.scanForDevices());
        // } , 10000);
    },
    scanForDevices: function() {
        app.emptyLists();
        app.showPage(devicesPage , "Select a device");
        // scan for all devices
        ble.startScanWithOptions([],{ reportDuplicates: false },app.onDiscoverDevice , app.onError);
        // //Stop after 5 sec
        setTimeout(ble.stopScan , 5000);
    },
    onDiscoverDevice: function(device) {
        ble.autoConnect(deviceId , app.onConnect , app.disconnect);

        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;  // TODO
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
        for(var i =0;i<deviceList.children.length ; i++){
            var _device = deviceList.children[i];
            _device.addEventListener("click" ,app.connect , false);
        }
    },
    connect: function(e) {
        deviceId = e.target.dataset.deviceId;
        var onConnect = function(data) {
            //Inteval to read the button state
            readButtonStateInterval = setInterval( ()=>app.readCharacteristic(ButtonState.service , ButtonState.characteristic , buttonState , "<b>Button State:</b> <br>") , 100);

            app.readCharacteristic(DeviceModel.service , DeviceModel.characteristic , modelName , "<b>Model name:</b> <br>");
            app.showPage(mainPage , "Main");
        };
        ble.connect(deviceId, onConnect, app.disconnect);
    },
    onConnect: function(event){
        readButtonStateInterval = setInterval( ()=>app.readCharacteristic(ButtonState.service , ButtonState.characteristic , buttonState , "<b>Button State:</b> <br>") , 100);

        app.readCharacteristic(DeviceModel.service , DeviceModel.characteristic , modelName , "<b>Model name:</b> <br>");
        app.showPage(mainPage , "Main");
    },
    disconnect: function(event) {
        ble.disconnect(deviceId, app.scanForDevices, app.onError);
        clearInterval(readButtonStateInterval);
        // app.scanForDevices();
    },
    readCharacteristic: function( service  , characteristic , target , text){
        var onRead = function(data){
            // var info = document.createElement('li');
            var d = new Uint8Array(data);
            var message='';
            for(var i=0;i< d.length ; i++){
                message+=String.fromCharCode(d[i]);
            }
            target.innerHTML = text + message;
        };
        ble.read(deviceId ,service , characteristic , onRead , app.onError);
    },
    writeState : function(event){
        var succes = ()=>console.log();
        var data = new Uint8Array(1);
        if(event.type === 'touchstart'){
            data[0] = 0x58;
        }else{
            data[0] = 0x56;
        }
        ble.write(deviceId , ButtonState.service , ButtonState.characteristic , data.buffer , succes , app.onError);
    },
    emptyLists : function(){
        deviceList.innerHTML = ''; // empties the list
        buttonState.innerHTML = '<b>Button state:</b><br>';
        modelName.innerHTML = '<b>Model Name</b><br>';
    },
    showPage:function(page, title) {
        var pages = document.getElementsByClassName("pages");
        for(var i = 0;i<pages.length;i++){
            pages[i].hidden = true;
        }
        setTimeout(()=>{
        page.hidden = false;
        pageTitle.innerHTML = title;} , 50);
        nativetransitions.fade(0.2);
    },
    onError: function(reason) {
        navigator.notification.alert("ERROR: " + reason); // real apps should use notification.alert
    }
};