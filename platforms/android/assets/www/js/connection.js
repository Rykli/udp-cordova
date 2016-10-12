/* 
 * Java script file with functions for both types of connection
 */

/* Printing the received package
 * object info - the event data
 * Socket socket - socket of the type SocketProperties (either tcp or udp)
 */
function recievedListener (info, socket) 
{   
    console.log("-- recieved Packet");
    console.log("Info: " + info.data + " from " + info.remoteAddress + ":" + info.remotePort);
    if (socket.socketId === info.socketId) {
        var message = _ab2str(info.data);
        console.log(message);
    }
};

/*
 * From ArrayBuffer to String
 */
function _ab2str (buf) 
{
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

/*
 * From String to ArrayBuffer
 */
function _stringToBuffer (str) 
{
    var arr = [];
    for(var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr).buffer;
};



/*
 * Printing socket info
 * @param socket - udp or tcp socket
 */
function printSocketInfo(socket) {
    chrome.sockets.udp.getInfo(socket.socketId, function (socketinfo) {
        console.log("socket " + socketinfo.socketId+":");
        console.log("persistant " + socketinfo.persistent);
        console.log("paused " + socketinfo.paused);
        console.log("localAddress " + socketinfo.localAddress);
        console.log("localPort " + socketinfo.localPort);
                    
    });    
}