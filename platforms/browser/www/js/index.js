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

app.initialize();

var socket;
var _discoveryStarted = false;

function _ab2str (buf) 
{
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

function _stringToBuffer (str) 
{
    var arr = [];
    for(var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr).buffer;
};

function recievedListener (info) 
{   
    console.log("-- recieved Packet");
    console.log("Info: " + info.data + " from " + info.remoteAddress + ":" + info.remotePort);
    if (socket.socketId === info.socketId) {
        var message = _ab2str(info.data);
        console.log(message);
        
    }
};

function createSocket(callbackSuccess,callbackError) {
        console.log("- start creating");
        
            chrome.sockets.udp.create(function (socketI) {
                socket=socketI;
                var socketId = socketI.socketId;
                console.log("- start binding socket N=", socketI.socketId);
                chrome.sockets.udp.bind(socketId, "192.168.1.136", 0, function (result) {
                if (result !== 0) {
                    chrome.sockets.udp.close(socketId);
                    console.log("- Error on bind(): " + result);
                    return callbackError();
                } else {
                    console.log("- Socket is binded");
                    //TODO Listener after checking that it sends what it has to
                    chrome.sockets.udp.onReceive.addListener(recievedListener);
                    return callbackSuccess();
                }
            });
            return socket;
        });
        return callbackError;
    };

function startDiscovery (successCallback,errorCallback)
{   
    _discoveryStarted = true;
    var message = "Discovery: Who is out there ? \0\n";
    console.log("starting discovery with socket no." + socket.socketId);        
    chrome.sockets.udp.setPaused(socket.socketId, false, function () {
        //var messageCount = 0;
        var broadcastDiscoveryRequest = function()
        {
            console.log("Sendind the package");
            chrome.sockets.udp.send(socket.socketId, _stringToBuffer(message), "192.168.1.255", 30303, function(result) {
                if(result.resultCode !== 0)
                {
                    errorCallback();
                }
                else {
                    console.log("Package is sent.");
                    successCallback();
                }
            });
                    /*if(messageCount < th._settings.upnpDiscoveryCount && th._discoveryStarted) {
                        messageCount++;
                        setTimeout(broadcastDiscoveryRequest, th._settings.upnpDiscoveryInterval);
                    }*/
        };

        //Don't search indefinetely
        /*setTimeout(function() {
            chrome.sockets.udp.setPaused(socket.socketId, true, function() {
                console.log(">>>>>>>>>>>>>>> pause");
            });
        }, 10000);*/
        
        broadcastDiscoveryRequest();
    });
}

function searchForBControl()
{
    var socket1 = createSocket(function(a){
        console.log("1. Socket No."  + socket.socketId + " was created.", a);
        startDiscovery(function() {
            console.log("2. Discovered");
            connectBControl();
        }, function() {
            console.log("2. Nothing was discovered");
        });
    }, function(a){
        console.log("1. Socket wasn not created", a);
    });
}

function connectBControl()
{
    var tls = require('tls');
    var fs = require('fs');

    /*var options = {
        key  : fs.readFileSync('TLS/client-key.der'),
        cert : fs.readFileSync('TLS/client-cert.der')
    };*/
}

/*var myFunc = function()
{
    //cb
}

foo.create({},function(result){
    //success
},function(error){
    
});*/

/*var m = function(a,b,c,d)
{
    a();
}


m(function(){
    setTimeout(function(){
        console.log('Im called');

    })*/