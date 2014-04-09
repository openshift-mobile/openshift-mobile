#!/usr/bin/env node

//Adds the necessary plugins

var pluginlist = [
	'org.apache.cordova.inappbrowser@0.2.3',
	'com.verso.cordova.clipboard',
	'https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git'
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("phonegap local plugin add " + plug, puts);
});
