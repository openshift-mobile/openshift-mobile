//
//Globals 
//

/** URL to the OpenShift Online REST API */
OPENSHIFT_ONLINE_URL = 'https://openshift.redhat.com/broker/rest/';

/** Minimum API Version supported by OSM */
MIN_SUPPORTED_VERSION = 1.4;

/** Maximum API Version supported by OSM */
MAX_SUPPORTED_VERSION = 1.6;

DEFAULT_TRANSITION = 'none';

/** Default Settings Object */
DEFAULT_SETTINGS = {
	baseurl: OPENSHIFT_ONLINE_URL,
	username: '',
	password: '',
	autolog: false,
	enterprise: false,
	api: MAX_SUPPORTED_VERSION
}


/**
 * Generate an object that encompases the whole framework
 *
 * @return An application object
 * @see OSM_Initializer,OSM_SettingsManager,OSM_REST,OSM_Version
 *
 * @author Joey Yore
 * @version 1.0
 */
function OSM_Application() {

	OSM_Initializer();

	return { 
		settings : OSM_Settings_Manager(),
		rest : OSM_REST(),
		version : OSM_Version()
	}

}


/**
 * Function to handle initialization events
 *
 * When everything is ready, the <i>osm-ready</i> event will be fired
 *
 * @author Joey Yore
 * @version 1.0
 */
function OSM_Initializer() {

	var deviceReadyDeferred = $.Deferred();
	var jqmReadyDeferred = $.Deferred();
	
	document.addEventListener('deviceready',onDeviceReady,false);
	$(document).bind('mobileinit',onJqmReady);
	$.when(deviceReadyDeferred,jqmReadyDeferred).then(ready);

	function onDeviceReady() {
		deviceReadyDeferred.resolve();
	}

	function onJqmReady() {
		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		jqmReadyDeferred.resolve();
	}

	function ready() {
		$(document).trigger('osm-ready');
	}

}


/**
 * Generates an object to handle REST operations
 *
 * @return The object to use 
 *
 * @author Joey Yore
 * @version 1.0
 */
function OSM_REST() {

	var headers = {
		'Accept': 'application/json'
	};



	function operation_base(operation,url,data,callback,errback,precall) {

		//URL Gets contructed from the cached settings baseurl parameter and the supplied context
		$.ajax({
			url: JSON.parse(localStorage['settings']).baseurl + url,
			type: operation,
			data: data,
			async: true,
			crossDomain: true,
			dataType: 'json',
			timeout: 10000,
			headers: headers,
			beforeSend: function(jqxhr,s) {
				if(precall) precall(jqxhr,s);
			},
			success: function(data,text,jqxhr) {
				if(operation === 'GET') {
					localStorage[url] = JSON.stringify(data);
				}
				if(callback) callback(data,text,jqxhr);
			},
			error: function(jqxhr,errType,exception) {
				if(errback) errback(jqxhr,errType,exception);
			}
		});

		if(operation === 'GET') {
			return JSON.parse(localStorage[url] || null);
		}
	}


	return {
		/**
		 * Encodes the user credentials to be used to access the OpenShift Server
		 *
		 * @param username The username to encode
		 * @param password The password to encode
		 *
		 * @author Joey Yore
		 */
		set_credentials : function(username,password) { 
			headers['Authorization'] = 'Basic ' + btoa(username + ':' + password);
		},

		/**
		 * Sets the accept header info to use the appropraite api version
		 *
		 * @param version The version to set
		 *
		 * @author Joey Yore
		 */
		set_api_version : function(version) {

			if(version === undefined || version < MIN_SUPPORTED_VERSION || version > MAX_SUPPORTED_VERSION) {
				headers['Accept'] = 'application/json';
			} else {
				headers['Accept'] = 'application/json; version=' + version;
			}
		},

		/**
		 * Executes a GET REST call
		 *
		 * @param url The URL Context to access
		 * @param callback Callback function to handle the response on success
		 * @param errback Callback function to handle the response on error
		 * @param precall Callback function to perform operations before sending request
		 *
		 * @return Cached response (if available) or null (if unavailable)	
		 *
		 * @author Joey Yore
		 */
		GET : function(url,callback,errback,precall) {
			return operation_base('GET',url,null,callback,errback,precall);
		},

		/**
		 * Executes a POST REST call
		 *
		 * @param url The URL Context to access
		 * @param data The data to post
		 * @param callback Callback function to handle the response on success
		 * @param errback Callback function to handle the response on error
		 * @param precall Callback function to perform operations before sending request
		 *
		 * @author Joey Yore
		 */
		POST : function(url,data,callback,errback,precall) {
			operation_base('POST',url,data,callback,errback,precall);
		},

		/**
		 * Executes a PUT REST call
		 *
		 * @param url The URL Context to access
		 * @param data The data to post
		 * @param callback Callback function to handle the response on success
		 * @param errback Callback function to handle the response on error
		 * @param precall Callback function to perform operations before sending request
		 *
		 * @author Joey Yore
		 */
		PUT : function(url,data,callback,errback,precall) {
			operation_base('PUT',url,data,callback,errback,precall);
		},

		/**
		 * Executes a DELETE REST call
		 *
		 * @param url The URL Context to access
		 * @param callback Callback function to handle the response on success
		 * @param errback Callback function to handle the response on error
		 * @param precall Callback function to perform operations before sending request
		 *
		 * @author Joey Yore
		 */
		DELETE : function(url,callback,errback,precall) {
			operation_base('DELETE',url,null,callback,errback,precall);
		}
	}	
}


/**
 * Object to handle the storing and retrieval of user settings
 *
 * @return The object to use
 *
 * @author Joey Yore
 * @version 1.0
 */
function OSM_Settings_Manager() {

	var _settings = $.extend(DEFAULT_SETTINGS,load_from_cache());
	save_to_cache(_settings);
		

	//NOTE:
	//These functions are defined here in order to allow for the parent 
	//function to use them for the initialization call of loading from 
	//the cache or the predefined defaults
	
	
	function save_to_cache(settings) {
		localStorage['settings'] = JSON.stringify(settings);
	}

	function load_from_cache() {
		return JSON.parse(localStorage['settings'] || "{}");
	}

	//END NOTE

	return {
		/**
		 * Saves settings passed along in a settings object
		 *
		 * @param settings An object with settings to update or add. Only settings that need to be added/updated need to be present.
		 *
		 * @author Joey Yore
		 */
		save : function(settings) {
			save_to_cache($.extend(_settings,settings));
		},

		/**
		 * Retrieves the stored settings
		 *
		 * @return An object with stored settings
		 *
		 * @author Joey Yore
		 */
		load : function() {
			return load_from_cache();
		}
	}	
}


/**
 * Object to handle app support based on api version
 *
 * @param The versiom to use
 * @return The instance to use
 *
 * @author Joey Yore
 * @version 1.0
 */
function OSM_Version(version) {

	//Allows input to be a string or a number
	var ver = parseFloat(version);

	if(isNaN(ver)) {
		return false;
	}

	if(ver < MIN_SUPPORTED || ver > MAX_SUPPORTED) {
		return false
	}

	return {

	}

}
