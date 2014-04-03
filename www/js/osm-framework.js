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
 * @class OSM_Application
 *
 * @return An application object
 * @see OSM_Initializer,OSM_Settings_Manager,OSM_REST,OSM_Support
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
		 * @name OSM_Application#set_api_version
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
 * @class OSM_Initializer
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
		
		document.addEventListener("backbutton",backButtonControl);
		
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
	
	function backButtonControl(event) {

		var navpanel = $.mobile.activePage.jqmData( "panel" );
		
		// If Panel is Open, close, otherwise proceed with back button Logic
		if(navpanel != undefined && navpanel == "open") {
			$.mobile.activePage.find('div[data-role="panel"]').panel("close"); 
		}
		else {
			var prevPageUrl = $.mobile.urlHistory.getPrev();
			
			if($.mobile.activePage.attr("id") == "login-page" || (typeof prevPage != undefined && prevPageUrl.hash == "#login-page")) {
				event.preventDefault();
	            navigator.app.exitApp();
			}
			else {
				history.back();
			}
		}
	}

}


/**
 * Generates an object to handle REST operations
 *
 * @class OSM_REST
 *
 * @return The object to use 
 *
 * @author Joey Yore
 * @author Andrew Block
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
			timeout: 60000,
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
		 * @name OSM_REST#set_credentials
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
		 * Sets the accept header info to use the appropriate api version
		 *
		 * @name OSM_REST#set_api_version
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
		 * @name OSM_REST#GET
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
		 * @name OSM_REST#POST
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
		 * @name OSM_REST#PUT
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
		 * @name OSM_REST#DELETE
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
 * @class OSM_Settings_Manager
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
		 * @name OSM_Settings_Manager#save
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
		 * @name OSM_Settings_Manager#load
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
 * @class OSM_Support
 *
 * @return The instance to use
 *
 * @author Joey Yore
 * @version 1.0
 */
function OSM_Support() {

	var _version = JSON.parse(localStorage['settings'] || '{}').version || MAX_SUPPORTED_VERSION;
	
	var supported = {
		domains : {
			name : {
				supported: (_version < 1.6) ? false : true,
			},
			list: {
				supported: true,
				url: 'domains'
			},
			delete : {
				supported: true,
				url: 'domain/<domain-name>'
			},
			update : {
				supported: false,
				url: (_version < 1.6) ? 'domain/<domain-id>' : 'domain/<domain-name>'
			}, 
			add : {
				supported: true,
				url : 'domains'
			}
		},
		applications : {
			id : {
				supported: (_version < 1.6) ? false : true
			},
			uuid : {
				supported: (_version < 1.6) ? true : false
			},
			list: {
				supported: true,
				url: 'domain/<domain-name>/applications?nolinks=true'
			},
			add: {
				supported: true,
				url: 'domain/<domain-name>/applications'
			},
		},
		application : {
			get : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>?nolinks=true' : 'application/<application-id>?nolinks=true'
			}, 
			events : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/events' : 'application/<application-id>/events'
			},
			cartridges : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/cartridges?nolinks=true' : 'application/<application-id>/cartridges?nolinks=true'
			},
			aliases : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/aliases?nolinks=true' : 'application/<application-id>/aliases?nolinks=true'
			}
		},
		aliases : {
			add : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/aliases' : 'application/<application-id>/aliases'
			},
			delete : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/alias/<alias-name>' : 'applications/<application-id>/aliases/<alias-name>'
			}
		},
		cartridges : {
			get : {
				supported : true,
				url : 'cartridges?nolinks=true'
			},
			add : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/cartridges' : 'application/<application-id>/cartridges'
			}
		},
		cartridge : {
			get : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/cartridge/<cartridge-name>?nolinks=true' : 'application/<application-id>/cartridge/<cartridge-name>?nolinks=true'
			},
			status : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/cartridge/<cartridge-name>?include=status_messages&nolinks=true' : 'application/<application-id>/cartridge/<cartridge-name>?include=status_messages&nolinks=true'
			},
			events : {
				supported : true,
				url : (_version < 1.6) ? 'domain/<domain-name>/application/<application-name>/cartridge/<cartridge-name>/events' : 'application/<application-id>/cartridge/<cartridge-name>/events'
			},
		},
		settings : {
			user : {
				supported : true,
				url : 'user?nolinks=true'
			},
			subscriptions : {
				supported : (_version < 1.6) ? false : true,
				url : 'plans?nolinks=true'
			},
			ssh_keys : {
				supported : true,
				url : 'user/keys?nolinks=true'
			},
			get_ssh_key : {
				supported : true,
				url : 'user/keys/<ssh-key-name>?nolinks=true'
			}
		}
	}

	function format_response(object,index) {

		if('url' in object) {
		
			var domain = JSON.parse(localStorage['domains']).data[localStorage['sel_domain']];

			if(domain !== undefined) {

				object.url = inject_domain_info(object.url,domain);

				var application = JSON.parse(localStorage['domain/' + (domain.name||domain.id) + '/applications?nolinks=true']||'{}');

				if('data' in application) {
					application = application.data[localStorage['sel_application']];
				} else {
					application = undefined;
				}

				if(application !== undefined) {
					object.url = inject_application_info(object.url,application);

					var cartridge = JSON.parse(localStorage[inject_application_info(inject_domain_info(supported.application.cartridges.url,domain),application)]||'{}');
					if('data' in cartridge) {
						cartridge = cartridge.data[localStorage['sel_cartridge']]
					} else {
						cartridge = undefined;
					}
					if(cartridge !== undefined) {
						object.url = inject_cartridge_info(object.url,cartridge);
					}

					var alias = JSON.parse(localStorage[inject_application_info(inject_domain_info(supported.application.aliases.url,domain),application)]||'{}');
					
					if('data' in alias) {
						alias = alias.data[localStorage['sel_alias']]
					} else {
						alias = undefined;
					}
					
					if(alias !== undefined) {
						object.url = inject_alias_info(object.url,alias);
					}
					
					
				}
			}		
			
			var ssh_key = JSON.parse(localStorage[supported.settings.ssh_keys.url]||'{}');
			if('data' in ssh_key) {
				ssh_key = ssh_key.data[localStorage['sel_ssh_key']];
			} else {
				ssh_key = undefined;
			}
			
			if(ssh_key !== undefined) {
				object.url = inject_ssh_key_info(object.url,ssh_key);
			}
		}
		return object;


		function inject_domain_info(url,domain) {
			return url.replace('<domain-name>',('name' in domain) ? domain.name : '')
					  .replace('<domain-id>',('id' in domain) ? domain.id : '')
			;
		}

		function inject_application_info(url,application) {
			return url.replace('<application-name>',('name' in application) ? application.name : '')
					  .replace('<application-id>',('id' in application) ? application.id : '')
			;
		}

		function inject_cartridge_info(url,cartridge) {
			return url.replace('<cartridge-name>',('name' in cartridge) ? cartridge.name : '')
			;
		}
		
		function inject_alias_info(url,alias) {
			return url.replace('<alias-name>',('id' in alias) ? alias.id : '')
			;
		}
		
		function inject_ssh_key_info(url,ssh_key) {
			return url.replace('<ssh-key-name>',('name' in ssh_key) ? ssh_key.name : '')
			;
		}

	}

	return {

		/**
		 * Determine if some operation is supported
		 *
		 * @name OSM_Support#is_supported
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

			return format_response($.extend({},current),index);
		}
	}

}
