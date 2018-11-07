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


var DeviceName = {
    service: "180A",
    characteristic: "2A29"
};
var DeviceModel = {
    service: "180A",
    characteristic: "2A28"
}
var deviceId = 0;



var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('click', this.scanForDevices, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
    },
    onDeviceReady: function() {
        if(!ble.isEnabled){
            navigator.notification.alert("Bluetooth isn't enabled");
        }
        app.scanForDevices();  
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
            // disconnectButton.dataset.deviceId = deviceId;
            app.readCharacteristic(DeviceName.service , DeviceName.characteristic , buttonState);
            app.readCharacteristic(DeviceModel.service , DeviceModel.characteristic , modelName);
            app.showPage(mainPage , "Main");
        };
        ble.connect(deviceId, onConnect, app.onError);
    },
    onConnect: function(event){
        app.readCharacteristic(DeviceName.service , DeviceName.characteristic);
        app.readCharacteristic(DeviceModel.service , DeviceModel.characteristic);
    },
    disconnect: function(event) {
        ble.disconnect(deviceId, app.scanForDevices, app.onError);
        // app.scanForDevices();
    },
    readCharacteristic: function( service  , characteristic , item){
        var onRead = function(data){
            // var info = document.createElement('li');
            var d = new Uint8Array(data);
            var message='';
            for(var i=0;i< d.length ; i++){
                message+=String.fromCharCode(d[i]);
            }
            item.innerHTML += message;
            // var html = '<b>' + message + '</b>';
            // info.innerHTML += html;
            // info.dataset.deviceId = deviceId;  // TODO
            // characteristicsList.appendChild(info);
        };
        ble.read(deviceId ,service , characteristic , onRead , app.onError);
    },
    discoverServices: function(){
        
    },
    emptyLists:function(){
        deviceList.innerHTML = ''; // empties the list
        buttonState.innerHTML = '<b>Manufacturer Name</b><br>';
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