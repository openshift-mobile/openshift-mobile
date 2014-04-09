#!/usr/bin/env node

//
// Copies required files into the appropriate platform specific location
//

var filestocopy = [

//ios icon
{"www/res/icon/ios/icon-40@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-40@2x.png"},
{"www/res/icon/ios/icon-40.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-40.png"},
{"www/res/icon/ios/icon-50@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-50@2x.png"},
{"www/res/icon/ios/icon-50.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-50.png"},
{"www/res/icon/ios/icon-60@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-60@2x.png"},
{"www/res/icon/ios/icon-60.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-60.png"},
{"www/res/icon/ios/icon-72@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-72@2x.png"},
{"www/res/icon/ios/icon-72.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-72.png"},
{"www/res/icon/ios/icon-76@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-76@2x.png"},
{"www/res/icon/ios/icon-76.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-76.png"},
{"www/res/icon/ios/icon-small@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-small@2x.png"},
{"www/res/icon/ios/icon-small.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon-small.png"},
{"www/res/icon/ios/icon@2x.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon@2x.png"},
{"www/res/icon/ios/icon.png": "platforms/ios/OpenShift Mobile/Resources/icons/icon.png"},
//ios splash
{"www/res/screen/ios/Default-568h@2x~iphone.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default-568h@2x~iphone.png"},
{"www/res/screen/ios/Default-Portrait@2x~ipad.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default-Portrait@2x~ipad.png"},
{"www/res/screen/ios/Default-Portrait~ipad.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default-Portrait~ipad.png"},
{"www/res/screen/ios/Default@2x~iphone.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default@2x~iphone.png"},
{"www/res/screen/ios/Default~iphone.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default~iphone.png"},
{"www/res/screen/ios/Default-Landscape@2x~ipad.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default-Landscape@2x~ipad.png"},
{"www/res/screen/ios/Default-Landscape~ipad.png":"platforms/ios/OpenShift Mobile/Resources/splash/Default-Landscape~ipad.png"},
//andriod icon
{"www/res/icon/android/icon-36-ldpi.png": "platforms/android/res/drawable-ldpi/icon.png"},
{"www/res/icon/android/icon-48-mdpi.png": "platforms/android/res/drawable-mdpi/icon.png"},
{"www/res/icon/android/icon-72-hdpi.png": "platforms/android/res/drawable-hdpi/icon.png"},
{"www/res/icon/android/icon-96-xhdpi.png": "platforms/android/res/drawable-xhdpi/icon.png"},
{"www/res/icon/android/icon-144-xxhdpi.png": "platforms/android/res/drawable-xxhdpi/icon.png"},

];

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

filestocopy.forEach(function(obj) {
    Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        var srcfile = path.join(rootdir, key);
        var destfile = path.join(rootdir, val);
        //console.log("copying "+srcfile+" to "+destfile);
        var destdir = path.dirname(destfile);
        if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
            fs.createReadStream(srcfile).pipe(fs.createWriteStream(destfile));
        }
    });
});
