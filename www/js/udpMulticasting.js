/* 
 * UDP functions
 * Getting the B-Controller address
 */

var socketUdp;

function searchForBControl()
{
    var socket1 = createSocket(function(){
        console.log("1. Socket No."  + socketUdp.socketId + " was created.");
        startDiscovery(function() {
            console.log("2. Discovered");
            
            /*chrome.sockets.udp.close(socketUdp.socketId, function() {
                console.log("udp socket " + socketUdp.socketId + " is closed");
            });*/
            connectBControl();
        }, function() {
            console.log("2. Nothing was discovered");
        });
        
    }, function(){
        console.log("1. Socket wasn not created");
    });
    
}

function startDiscovery (successCallback,errorCallback)
{   
    _discoveryStarted = true;
    var message = "Discovery: Who is out there ? \0\n";
    console.log("starting discovery with socket no." + socketUdp.socketId);        
    chrome.sockets.udp.setPaused(socketUdp.socketId, false, function () {
        //var messageCount = 0;
        var broadcastDiscoveryRequest = function()
        {
            console.log("Sendind the package");
            chrome.sockets.udp.send(socketUdp.socketId, _stringToBuffer(message), "192.168.1.255", 30303, function(result) {
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
            var i=socketUdp.socketId;
            chrome.sockets.udp.setPaused(i, true, function() {
                console.log(">>>>>>>>>>>>>>> pause socket udp no." + i);
            });
        }, 10000);*/
        
        broadcastDiscoveryRequest();
    });
}



/* Creating udpSocket
 * Binding udp socket
 * Adding a listener
 */
function createSocket(callbackSuccess,callbackError) {
    console.log("- start creating udp socket");
    
    chrome.sockets.udp.create(function (socketI) {
        socketUdp=socketI;
        var socketId = socketI.socketId;
        console.log("- start binding udp socket N=", socketI.socketId);
        
        chrome.sockets.udp.bind(socketId, "192.168.1.255", 0, function (result) {
            if (result !== 0) {
                chrome.sockets.udp.close(socketId);
                console.log("- Error on bind(): " + result);
                return callbackError();
            } else {
                console.log("- Socket is binded");
                chrome.sockets.udp.onReceive.addListener(function(info){
                    console.log("listener is added");
                    recievedListener(info, socketUdp);
                });
                //chrome.sockets.udp.onReceive.addListener(recievedListenerUdp);
                return callbackSuccess();
            }
        });
        
        return socketUdp;
    });
    
    return callbackError;
};