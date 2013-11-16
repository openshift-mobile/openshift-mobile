

function OpenShiftMobile(auth,settings) {

	//Make sure we have jQuery loaded
	if(!window.jQuery) {
		return false;
	}	

	//
	//Private variables
	//
	
	var deviceReadyDeferred = $.Deferred();
	var jqmReadyDeferred = $.Deferred();
	var logged_in = false;
	var creds = CredentialManager();
	var config = $.extend({
		version: '1.6',
		headers : {
			'Authorization' : '',
			'Accept' : 'application/json'			
		},
		base_url : 'https://openshift.redhat.com/broker/rest/'
	},settings);



	//
	//Public methods
	//
	
	//Initialize frameworks
	this.initialize = function() {
		document.addEventListener('deviceready',onDeviceReady, false);
		$(document).bind('mobileinit',onJqmReady);
		this.target_api(config.version);
		$.when(deviceReadyDeferred,jqmReadyDeferred).then(ready);
	};

	//Set target api version
	this.target_api = function(api) {
		var h = config.headers['Accept'].split(';');
		if(api) {
			config.headers['Accept'] = h[0] + '; version=' + api;
		} else {
			config.headers['Accept'] = h[0];
		}
	};


	this.get_domain = function() {
		return config.domain;
	}

	this.set_domain = function(domain) {
		config.domain = domain;
	}

	this.get_application = function() {
		return config.application;
	}

	this.set_application = function(application) {
		config.application = application;
	}

	//Send a GET request over REST (auto caches)
	this.rest_get = function(url,callback,errback,precall) {
		$.ajax({
			url : config.base_url + url,
			type : 'GET',
			dataType : 'json',
			crossDomain : true,
			timeout : 5000,
			headers : config.headers,
			beforeSend : function(jqxhr,s) {
				//TODO: Add framework handling
				if(precall) precall(jqxhr,s);
			},
			success : function(data,text,xhr) {
				//Cache data and call user callback
				localStorage[url] = JSON.stringify(data);
				if(callback) callback(data,text,xhr);
			},
			error : function(jqxhr,errType,exception) {
				//TODO: Add framework handling
				if(errback) errback(jqxhr,errType,exception);
			}
		});	

		//return cached data or null
		return JSON.parse(localStorage[url] || null);
	};

	this.login = function(username,password,auto) {

		if(typeof username === 'undefined') {
			username = creds.getUsername();
			password = creds.getPassword();
			auto = creds.getAutolog();
		}

		//set the auth headers
		config_auth_header(username,password);
		creds.set(username,password,auto);
		

		//Show a loading spinner
		$.mobile.loading('show', {
			text : 'Logging In...',
			textVisible : true,
			theme : 'b',
		});
		
		//Verification REST call
		this.rest_get('user',
			function() {
				$(document).trigger('osm-login');
				$.mobile.loading('hide');
			},
			function() {
				$(document).trigger('osm-login-failed');
				$.mobile.loading('hide');
			}
		);
	};

	this.logout = function() {
		$.mobile.loading('show', {
			text : 'Logging Out...',
			textVisible : true,
			theme : 'b',
		});
		creds.setPassword('');
		creds.setAutolog('false');
		creds.store();
		$(document).trigger('osm-logout');
	};

	this.isAutolog = function() {
		return creds.getAutolog();
	};

	this.getUsername = function() {
		return creds.getUsername();
	};

	//
	//Private methods
	//
		
	//Set auth header
	var config_auth_header = function(username,password) {
		config.headers['Authorization'] = 'Basic: ' + btoa(username + ":" + password);
	};

	// Phonegap is ready
	var onDeviceReady = function() {
		document.addEventListener("backbutton", function (e) {
			if($.mobile.activePage.attr('id') === 'login-page' ||
			   $.mobile.activePage.attr('id') === 'domain-page' ) {
	            e.preventDefault();
			}
        }, false );
		deviceReadyDeferred.resolve();
	};

	//jQuery Mobile is ready
	var onJqmReady = function() {
		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;

		jqmReadyDeferred.resolve();
	};

	//All Initializations are done, triger the ready event
	var ready = function() {
		$(document).trigger('openshiftready');
	};


	//
	//private classes
	//
	
	function CredentialManager(username,password,autolog) {
		
		var user = localStorage['auth.username'] || '';
		var pass = localStorage['auth.password'] || '';
		var auto = localStorage['auth.autolog'] || 'false';

		user = (typeof username === 'string') ? username : user;
		pass = (typeof password === 'string') ? password : pass;
		auto = (typeof autolog === 'string') ? autolog : auto;

		return {
			getUsername : function() { return user; },
			setUsername : function(username) { user=username; },
			getPassword : function() { return pass; },
			setPassword : function(password) { pass=password; },
			getAutolog : function() { return auto; },
			setAutolog : function(autolog) { auto=autolog; },
			get : function() {
				return {
					username:user,
					password:pass,
					autolog:auto
				};
			},
			set : function(username,password,autolog) {
				user = username;
				pass = password;
				auto = autolog;
				this.store();
			},
			store : function() {
				localStorage['auth.username'] = user;
				localStorage['auth.password'] = pass;
				localStorage['auth.autolog'] = auto;
			},
			clear : function() {
				localStorage.removeItem('auth.username');
				localStorage.removeItem('auth.password');
				localStorage.removeItem('auth.autolog');
			}
		};
	}
}



