cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-chrome-apps-common/events.js",
        "id": "cordova-plugin-chrome-apps-common.events",
        "pluginId": "cordova-plugin-chrome-apps-common",
        "clobbers": [
            "chrome.Event"
        ]
    },
    {
        "file": "plugins/cordova-plugin-chrome-apps-common/errors.js",
        "id": "cordova-plugin-chrome-apps-common.errors",
        "pluginId": "cordova-plugin-chrome-apps-common"
    },
    {
        "file": "plugins/cordova-plugin-chrome-apps-common/stubs.js",
        "id": "cordova-plugin-chrome-apps-common.stubs",
        "pluginId": "cordova-plugin-chrome-apps-common"
    },
    {
        "file": "plugins/cordova-plugin-chrome-apps-common/helpers.js",
        "id": "cordova-plugin-chrome-apps-common.helpers",
        "pluginId": "cordova-plugin-chrome-apps-common"
    },
    {
        "file": "plugins/cordova-plugin-chrome-apps-sockets-udp/sockets.udp.js",
        "id": "cordova-plugin-chrome-apps-sockets-udp.sockets.udp",
        "pluginId": "cordova-plugin-chrome-apps-sockets-udp",
        "clobbers": [
            "chrome.sockets.udp"
        ]
    },
    {
        "file": "plugins/cordova-plugin-chrome-apps-sockets-tcp/sockets.tcp.js",
        "id": "cordova-plugin-chrome-apps-sockets-tcp.sockets.tcp",
        "pluginId": "cordova-plugin-chrome-apps-sockets-tcp",
        "clobbers": [
            "chrome.sockets.tcp"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-chrome-apps-common": "1.0.7",
    "cordova-plugin-whitelist": "1.3.0",
    "cordova-plugin-chrome-apps-sockets-udp": "1.3.0",
    "cordova-plugin-chrome-apps-sockets-tcp": "1.3.7-dev"
}
// BOTTOM OF METADATA
});