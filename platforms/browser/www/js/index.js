/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.getElementById('button1').addEventListener('click',searchForBControl);
        /*document.addEventListener('DOMContentReady', function () {
            document.getElementById('button1').addEventListener('click', searchForBControl)});*/
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Ready');
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        
        
    }
};

var UDP = Object.create(null,{
    //Private Attributes
    _settings:
    {
        value: 
        {
            srcPort: 30303,
            dstPort: 1900,
            multicastAddress: "239.255.255.250",
            upnpDiscoveryInterval: 3000,
            upnpDiscoveryCount: 3,
            upnpDiscoveryDuration: 15000
        }
    },
    
    //socket helpers 
    _ab2str:
    {
        value: function (buf) 
        {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }
    },

    _stringToBuffer:
    {
        value: function (str) 
        {
            var arr = [];
            for(var i = 0, j = str.length; i < j; ++i) {
              arr.push(str.charCodeAt(i));
            }
            return new Uint8Array(arr).buffer;
        }
    },

    _upnpDevicePrototypes:
    {
        value: {}
    },
    
    /**
     * Contains an object with filter prorperties for urns and modelNames to
     * identify to which linkit prototype a found upnp device belongs
     */
    _upnpDiscoveryFilters:
    {
        value: {}
    },

//UPNP Linkit interaction

    registerUPNPLinkitPrototype:
    {
        value: function(linkitPrototype)
        {
            var discoveryFilter = linkitPrototype.upnpGetDiscoveryFilter();
            
            for(var urn in discoveryFilter)
            {
                var lowerCaseURN = urn.toLowerCase();
                
                if(!this._upnpDiscoveryFilters[lowerCaseURN]) this._upnpDiscoveryFilters[lowerCaseURN] = {};

                this._upnpDiscoveryFilters[lowerCaseURN] = discoveryFilter[urn]; //["filterSuccess"] = linkitPrototype;

            }
        }
    },    

//UPNP DISCOVERY

    /**
     * Starts an MSearch
     */
    startDiscovery:
    {
        value: function(successCallback,errorCallback)
        {   
            var th = this;
            this._onUDPMessageSuccessCallback = successCallback;
            this._onUDPMessageErrorCallback = errorCallback;
            
            this._discoveryStarted = true;
            //clear the device cache
            this._mSearchDeviceCache = {};
            /*var message = 
                "M-SEARCH * HTTP/1.1\r\n" +
                "HOST:" + this._settings.multicastAddress + ":" + this._settings.dstPort + "\r\n" +
                "MAN:\"ssdp:discover\"\r\n" +
                "ST:upnp:rootdevice\r\n" + 
                "MX:" + this._settings.upnpDiscoveryInterval/1000 + "\r\n" +
                "\r\n";*/
            var message = "Discovery: Who is out there ? \0\n";
                    
            chrome.sockets.udp.setPaused(th._socket.socketId, false, function () {
                var messageCount = 0;
                var broadcastDiscoveryRequest = function()
                {
                    chrome.sockets.udp.send(th._socket.socketId, th._stringToBuffer(message), th._settings.multicastAddress, th._settings.dstPort, function(result) {
                    });
                    if(messageCount < th._settings.upnpDiscoveryCount && th._discoveryStarted) {
                        messageCount++;
                        setTimeout(broadcastDiscoveryRequest, th._settings.upnpDiscoveryInterval);
                    }
                };

                //Don't search indefinetely
                setTimeout(function() {
                    chrome.sockets.udp.setPaused(th._socket.socketId, true, function() {
                        console.log(">>>>>>>>>>>>>>> pause");
                    });
                }, th._settings.upnpDiscoveryDuration);
                broadcastDiscoveryRequest();
            });
        }
    },

    //socket listener delegate method 
    _recvListener:
    {
        value: function(info) 
        {   /* Was before changing
            if (Connect.UPNPManager._socket.socketId === info.socketId) {
                var message = Connect.UPNPManager._ab2str(info.data);
            	Connect.UPNPManager._onUDPMessage(message);
            }*/
            if (UDP._socket.socketId === info.socketId) {
                var message = UDP._ab2str(info.data);
            	UDP.UPNPManager._onUDPMessage(message);
            }
        }
    },
    
    _onUDPMessage:
    {
        value: function(message)
        {   
            var successCallback = this._onUDPMessageSuccessCallback;
            var errorCallback = this._onUDPMessageErrorCallback;
            
            if(!this._discoveryStarted) return;
            
            //Extract Headers
            var msgHeaderArray = ("" + message).split("\r\n");
            var headers = {};
            var th = this;

            for(var i = 1, n = msgHeaderArray.length; i<n; i++)
            {
                var headerItem = msgHeaderArray[i].split(': ');
                var firstColonIndex = msgHeaderArray[i].indexOf(':');                
                
                if(headerItem[0] && headerItem[0].length) headers[msgHeaderArray[i].substring(0,firstColonIndex).toLowerCase()] = msgHeaderArray[i].substring(firstColonIndex+1).trim();
            }
            
            var deviceInfo = 
            {
                location: headers['location'],
                name: headers['server'],
                usn: headers['usn'],
                serviceType: ("" + headers['st']).toLowerCase()
            };      
            console.log(">>>>>>>> deviceInfo");
            //If we have found a location and a usn header we have a device!
            if(deviceInfo.location && deviceInfo.usn) 
            {
                console.log(">>>>>>>> 1");
                //Sanitize location value            
                if(deviceInfo.location.match(/^[0-9]/)) deviceInfo.location = 'http://' + deviceInfo.location; //If only ip is given
                
                //Some Checks
                if(!th._mSearchDeviceCache[deviceInfo.usn])
                {       
                    console.log(">>>>>>>> 2");
                    //We found a new device
                    if (deviceInfo.serviceType === "upnp:rootdevice") {
                        console.log(">>>>>>>> 3");
                        var deviceCache = deviceInfo;
                        th._mSearchDeviceCache[deviceInfo.usn] = deviceCache; 
                    	th._describeDevice(deviceInfo, function(deviceData) {
                            try 
                            {
                                var deviceType = deviceData.description.root.device.deviceType.toLowerCase();
                                var modelName = deviceData.description.root.device.modelName;
                                
                                console.log("found Device: " + deviceType + ", modelName: " + modelName);
                                if (th._upnpDiscoveryFilters[deviceType]) {
                                        var linkitPrototype = th._upnpDiscoveryFilters[deviceType](modelName.toLowerCase());
                                    //Notify the linkit we have found a device belonging to this linkit
                                    if(linkitPrototype && linkitPrototype.upnpDeviceWasDiscovered) {
                                        linkitPrototype.upnpDeviceWasDiscovered(deviceData, successCallback, errorCallback);
                                    }
                                }
                            }
                            catch(e)
                            {
                                console.log(">>>>>>>> error");
                                console.log(e);
                                
                                //if this didn't work out we will ignore this linkit candidate
                                return;
                            }
                        }, 
                        function(error) {
                            console.log(">>>>>>>> error 2");
                        });
                    }
                }
            }
        }
    },
    
    _getLinkitPrototypeForDevice:
    {
        value: function(deviceInfo)
        {
            return this._upnpDevicePrototypes[deviceInfo.serviceType];
        }
    },
    
    _describeDevice:
    {
        value: function(deviceInfo,successCallback,errorCallback,tryCounter)
        {            
            var th = this;
            if(!tryCounter) tryCounter = 1;
            
            if(tryCounter >= 3) 
            {
                errorCallback({error: 'Error getting device description'});
                return;
            }
            
            //Exception-safe try inside a loop will attempt to get the descrpition n times
            try
            {
                //console.log('SENDING XHR ' + deviceInfo.location);
                //Get device description
                console.log(deviceInfo.location);
                ////TODO what is it doing 1
                App.xhr.get("" + deviceInfo.location,{
                    onSuccess: function(status,data)
                    {
                        if(status === 200)
                        { 
                            //TODO what is it doing 2
                            deviceInfo.description = Connect.XML2jsobj(DOMParser.parseFromString(data, "application/xml"));
                            //get device Location
                            var locationMatches = ("" +deviceInfo.location).match(/^((http|https):\/\/)?([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)(:[0-9]*)?/);

                            if(locationMatches && locationMatches.length)
                            {
                                deviceInfo.locationPrefix = ( (locationMatches[1]) ? locationMatches[1] : 'http://' ) + locationMatches[3] + ( (locationMatches[4]) ? locationMatches[4] : ':80' );
                            }
                            else
                            {
                                throw new Error('Could not get location IP and protocol prefix of: ' + deviceInfo.location);
                            }                                                               
                            
                            //No error occured
                            successCallback(deviceInfo);
                        }
                        else
                        {
                            console.log('Description Error State ' + status);
                            //Try Again
                            th._describeDevice(deviceInfo,successCallback,errorCallback,tryCounter+1);
                        }
                    }
                });
            }
            catch(e)
            {
                console.log('Description Error ' + e);
                //Try Again
                th._describeDevice(deviceInfo,successCallback,errorCallback,tryCounter+1);
            }
        }
    },
    
    stopDiscovery:
    {
        value: function()
        {
            this._discoveryStarted = false;
        }
    },
    
//LIFE CYCLE    
    
    create: 
    {
        value: function(callbackSuccess, callbackError)
        {
            var manager = this;
            manager._usns = {};
            manager._mSearchDeviceCache = {};
            if (!manager._socket) {
                chrome.sockets.udp.create(function (socket)
                {
                    manager._socket = socket;
                    var socketId = socket.socketId;
                    chrome.sockets.udp.bind(socketId, "0.0.0.0", manager._settings.srcPort, function (result) {
                        if (result !== 0) {
                            chrome.sockets.udp.close(socketId);
                            console.log("Error on bind(): " + result);
                            callbackError();
                        } else {
                            chrome.sockets.udp.onReceive.addListener(manager._recvListener);
                            callbackSuccess();
                        }
                    });

                });
            }
            return manager;
        }
    }
});

app.initialize();

function searchForBControl()
{
    console.log("A1");
    //var socket = chrome.sockets.udp;
    console.log(chrome.sockets);
    console.log(UDP.create);
    /*var _settings =
    {
        value: 
        {
            srcPort: 30303,
            dstPort: 1900,
            multicastAddress: "192.168.1.255",
            upnDiscoveryInterval: 3000,
            upnDiscoveryCount: 3,
            upnDiscoveryDuration: 15000
        }
    };
    
    (function create(callbackSuccess, callbackError) {
            var manager = this;
            if (!manager._socket) {
                chrome.sockets.udp.create(null, function (socket) {
                    manager._socket = socket;
                    var socketId = socket.socketId;
                    chrome.sockets.udp.bind(socketId, "0.0.0.0", _settings.srcPort, function (result) {
                        if (result !== 0) {
                            chrome.sockets.udp.close(socketId);
                            console.log("Error on bind(): " + result);
                            callbackError();
                        } else {
                            chrome.sockets.udp.onReceive.addListener(manager._recvListener);
                            callbackSuccess();
                        }
                    });

                });
            }
            return manager;
        })();
    */
    alert("end");
}