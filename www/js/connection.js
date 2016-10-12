/* 
 * Java script file with functions for both types of connection
 */


/* Printing the received package
 * object info - the event data
 * Socket socket - socket of the type SocketProperties (either tcp or udp)
 * @param {object} info - with socket identifier and the result code
 * @param {object} socket - with id
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
 * transforming received message from ArrayBuffer to String
 * @param {ArrayBuffer} buf
 * @returns {String}
 */
function _ab2str (buf) 
{
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};

/*
 * transforming sent message from String to ArrayBuffer
 * @param {String} str
 * @returns {ArrayBuffer}
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
 * @param {object} socket - udp or tcp socket with id
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