/* 
 * When udp connection found B-Controllers, 
 * we can use this library to start working with B-Controller via TCP
 */

var socketTcp;

/*
 * Starting TCP connection with B-Controller
 * @returns {undefined}
 */
function connectBControl()
{
    var socket = createSocketTCP(function(a){
        console.log("TCP connection.");
        console.log("1. TCP Socket No."  + socketTcp.socketId + " was created.", a);
        chrome.sockets.tcp.getSockets(function (arrayin) {
                console.table(arrayin);
                });
        startDiscoveryTCP(function() {
            console.log("2. TCP Discovered");
            chrome.sockets.tcp.getSockets(function (arrayin) {
                console.table(arrayin);
            });
        }, function() {
            console.log("2. TCP Nothing was discovered");
        });
    }, function(a){
        console.log("1. TCP Socket wasn not created", a);
    });
};


/*
 * Creating TCP connection
 * @param {function} callbackSuccess - function that is called in case of sucessfull connection of TCP socket
 * @param {function} callbackError - function that is called in case of error
 * @returns callbackSuccess or callbackError or socketTcp
 */
function createSocketTCP(callbackSuccess,callbackError) {
    console.log("- start creating tcp socket");
        
    chrome.sockets.tcp.create(function (socketI) {
        socketTcp = socketI;
        var socketId = socketI.socketId;
        console.log("- start connecting socket N=", socketId + "via TCP");
        
        chrome.sockets.tcp.connect(socketId,"192.168.1.162", 9092, function (result) {
            if (result !== 0) {
                chrome.sockets.tcp.close(socketId);
                console.log("- Error on tcp connection: " + result);
                return callbackError();
            } else {
                console.log("- Socket tcp is connected");
                chrome.sockets.tcp.onReceive.addListener(function(info) {
                    recievedListener(info,socketTcp);
                });
                return callbackSuccess();
            }            
        });
        
        return socketTcp;
    });
    
    return callbackError;    
};


/* 
 * Sending a message to the B-Controller via TCP
 * @param {function} successCallback
 * @param {function} errorCallback
 * @returns successCallback or errorCallback
 */
function startDiscoveryTCP (successCallback,errorCallback)
{
    var message = "Discovery: Who is out there ? \0\n";
    console.log(" TCP starting discovery with socket no." + socketTcp.socketId);
    
    chrome.sockets.tcp.setPaused(socketTcp.socketId, false, function () {
        
        var broadcastDiscoveryRequest = function() {
            console.log(" TCP Sendind the package");
            
            chrome.sockets.tcp.send(socketTcp.socketId, _stringToBuffer(message), function(result) {
                if(result.resultCode !== 0) {
                    console.log(" TCP Package is not sent.");
                    errorCallback();
                }
                else {
                    console.log(" TCP Package is sent.");
                    successCallback();
                }
            });
                  
        };

        //Don't search indefinetely
        /*setTimeout(function() {
            var i = socketTcp.socketId;
            chrome.sockets.udp.setPaused(i, true, function() {
                console.log(">>>>>>>>>>>>>>> pause socket no." + i);
            });
        }, 10000);*/
        
        broadcastDiscoveryRequest();
    });
}