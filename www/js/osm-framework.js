//
//Globals 
//

/** URL to the OpenShift Online REST API */
OPENSHIFT_ONLINE_URL = 'https://openshift.redhat.com/broker/rest/';

/** Minimum API Version supported by OSM */
MIN_SUPPORTED_VERSION = 1.4;

/** Maximum API Version supported by OSM */
MAX_SUPPORTED_VERSION = 1.6;

/** Default page transition animation */
DEFAULT_TRANSITION = 'none';

/** Time in ms to wait between prerendering next page */
PRERENDER_DELAY = 250;

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
		support : OSM_Support(),
		
		/**
		 * Sets the api version for the entire framework to use
		 *
		 * @param version The version to set
		 *
		 * @author Joey Yore
		 */
		set_api_version : function(version) {
			this.rest.set_api_version(version);
			this.settings.save({'version':version});
		}

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
	var prerenderDeferred = $.Deferred();
	
	document.addEventListener('deviceready',onDeviceReady,false);
	$(document).bind('mobileinit',onJqmReady);
	$.when(deviceReadyDeferred,jqmReadyDeferred,prerenderDeferred).then(ready);

	function onDeviceReady() {
		deviceReadyDeferred.resolve();
	}

	function onJqmReady() {
		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		jqmReadyDeferred.resolve();
	}

	function prerenderPages() {
		var pages = $("[data-role='page'] .prerender:not(.ui-page)");
		var i = 0;
		var count = pages.length;
		
		function prerender() {
			if(++i < count) {
				var page = $(pages[i]);
				page.page();
				setTimeout(prerender,PRERENDER_DELAY);
			} else {
				prerenderDeferred.resolve();
			}
		}
		prerender();
	}

	prerenderPages();

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

	// NOTE:
	// This object maintains a variable in order to track
	// if there has been new data stored to the local storage
	// cache. 
	//
	// This allows for the JSON parsing function to be called
	// only when necessary. Any other time the direct object
	// can simply be returned
	
	
	var ret = {
		/**
		 * Saves settings passed along in a settings object
		 *
		 * @param settings An object with settings to update or add. Only settings that need to be added/updated need to be present.
		 *
		 * @author Joey Yore
		 */
		save : function(settings) {
			_settings = $.extend(_settings,settings);
			localStorage['settings'] = JSON.stringify(_settings);
			ndata = true;
		},

		/**
		 * Retrieves the stored settings
		 *
		 * @return An object with stored settings
		 *
		 * @author Joey Yore
		 */
		load : function() {
			if(ndata) {
				_settings = JSON.parse(localStorage['settings'] || "{}");
				ndata = false;
			}
			
			//Return a deep copy of the _settings object as it prevents
			//tampering with the internal _settings object as to not break
			//other parts of the code that need the settings
			return $.extend({},_settings); 
		}
	};

	var ndata = true;
	var _settings = $.extend(DEFAULT_SETTINGS,ret.load());
	ret.save(_settings);
	return ret;
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
function OSM_Support() {

	var version = JSON.parse(localStorage['settings'] || '{}').version || MAX_SUPPORTED_VERSION;
	
	var supported = {
		domains : {
			name : {
				supported: (version < 1.6) ? false : true,
			},
			list: {
				supported: true,
				url: 'domains'
			},
			delete : {
				supported: false,
				url: (version < 1.6) ? 'domain/<domain-id>' : 'domain/<domain-name>'
			},
			update : {
				supported: false,
				url: (version < 1.6) ? 'domain/<domain-id>' : 'domain/<domain-name>'
			}
		},
		applications : {
			list: {
				supported: true,
				url: (version < 1.6) ? '/domain/<domain-id>/applications' : 'domain/<domain-name>/applications'
			}
		}
	}

	function format_response(object,index) {
		var domain = JSON.parse(localStorage['domains']);
		if('url' in object) {
			object.url = object.url
				.replace('<domain-name>',domain.data[index].name||'')
				.replace('<domain-id>',domain.data[index].id||'')
			;
		}
		return object;
	}

	return {

		/**
		 * Determine if some operation is supported
		 *
		 * @param operation The operation to check (ex. applications.list)
		 * @param index The Index to access for lists (ex. domains, applications, cartridges, etc)
		 * @return false A support object 
		 *
		 */
		is_supported : function(operation,index) {
			var indexes = operation.split('.')
			var current = supported;

			for(var i=0,l=indexes.length;i<l;++i) {
				current = current[indexes[i]];
			}

			if(current === undefined) {
				return {supported:false};
			}

			return format_response(current,index);
		}
	}

}
