
/**
 * Performs the login call
 *
 * @param app OSM_Applicaiton object to use
 * @param callback Callback to handle the successful login
 * @param errback Callback to handle the unsuccessful login
 * @param precall Function to call before network is used
 *
 * @author Joey Yore
 * @version 1.0
 */
function login(app,callback,errback,precall) {
	//Show a loading spinner
	$.mobile.loading('show', {
		text : 'Logging In...',
		textVisible : true,
		theme : 'b',
	});

	//Update everything based on stored settings
	var settings = app.settings.load();
	app.rest.set_credentials(settings.username,settings.password);
	app.rest.set_api_version(settings.api);
	app.rest.GET('domains',callback,errback,precall);
}

/**
 * Logout of the application and return to a page
 *
 * @param app The OSM_Application object to use
 * @param page The page id to transition to (defaults to '#login-page')
 *
 * @author Joey Yore
 * @version 1.0
 */
function logout(app,page) {

	app.settings.save({
		'password' : '',
		'autolog' : false
	});
	$.mobile.changePage(page || '#login-page',{
		transition:DEFAULT_TRANSITION
	});
}


/**
 * Build the list of domains on the domain page
 *
 * @param event Event data passed thru event bind
 *
 * @author Joey Yore
 * @version 1.0
 */
function domain_list_build(event) {
	var list_id = event.data.list_id;
	var app = event.data.app;
	var app_page_id = event.data.app_page_id;


	if(list_id === undefined || app === undefined) {
		return false;
	}

	var list = $(list_id);
	var version = app.settings.load().version;

	var rdata = app.rest.GET('domains',function(d) {
		build_domain_list(d.data);
	});

	if(rdata !== null && typeof rdata.data !== 'undefined') {
		build_domain_list(rdata.data);
	}

	function build_domain_list(data) {

		if(!$.isArray(data)) {
			return false;
		}

		list.empty();

		for(var i=0,l=data.length;i<l;++i) {
			inject(list,data,i);
		}
		list.listview('refresh');

		function inject(list,domains,index) {
			var domain = domains[index];
			var namesup = app.support.is_supported('domains.name',i);

			var div = $('<div></div>')
						.html(( namesup.supported ? ('<b>Name: </b>' + domain.name + '<br>') : '') +
							  '<b>ID: </b>' + domain.id + '<br>' +
							  '<b>Gear Sizes: </b>' + domain['allowed_gear_sizes'] + '<br>' +
							  '<b>Creation time: </b>' + domain['creation_time']
			);

			var li = $('<li></li>');
			var a = $('<a id="domain-' + (domain.name||domain.id) + '"></a>');
			
			a.click(function() {
				localStorage['sel_domain'] = index;
				$.mobile.changePage(app_page_id,{transition:DEFAULT_TRANSITION});
			});

			a.append(div);
			li.append(a);
			list.append(li);
		}

	}
	
}

/**
 * Build the list of applications on the applications page
 *
 * @param event Event data passed thru event bind
 *
 * @author Joey Yore
 * @version 1.0
 */
function application_list_build(event) {
	var list_id = event.data.list_id;
	var app = event.data.app;
	var app_page_id = event.data.app_page_id;


	if(list_id === undefined || app === undefined) {
		return false;
	}

	var list = $(list_id);
	var version = app.settings.load().version;

	var support = app.support.is_supported('applications.list',localStorage['sel_domain']);

	if(support.supported === false) {
		return false;
	}

	var rdata = app.rest.GET(support.url,function(d) {
		build_application_list(d.data);
	});

	if(rdata !== null && typeof rdata.data !== 'undefined') {
		build_application_list(rdata.data);
	}

	function build_application_list(data) {

		if(!$.isArray(data)) {
			return false;
		}

		list.empty();

		for(var i=0,l=data.length;i<l;++i) {
			inject(list,data,i);
		}
		list.listview('refresh');	

		function inject(list,applications,index) {
			var application = applications[index];
			var li = $('<li id="aid-' + application.id + '"></li>');
			li.data('os-name',application.name);
			li.data('os-url',application.app_url);
			li.data('osm-app-data',application);

			var a1 = $('<a></a>').html('<img class="osm-icon-container ' +
										get_img(application.framework.split('-')[0]) +
										'"/><h3 class="appid">' + application.name + '</h3><p>' + application.app_url + '</p>');
			var a2 = $('<a href="#application-popupMenu" data-rel="popup"></a>');

			a1.click(function() {
				localStorage['sel_application'] = index;
				//$.mobile.changePage(???,{transition:DEFAULT_TRANSITION});
			});

			a2.click(function() {
				localStorage['sel_application'] = index;
			});

			li.append(a1);
			li.append(a2);
			list.append(li);
		}

		function get_img(name) {
			var img = {
				'10gen': 'osm-openshift-10gen-logo',
				haproxy: 'osm-openshift-haproxy-logo',
				jbossas: 'osm-openshift-jbossas-logo',
				jbosseap: 'osm-openshift-jbosseap-logo',
				jbossews: 'osm-openshift-jbossews-logo',
				jenkins: 'osm-openshift-jenkins-logo',
				mongodb: 'osm-openshift-mongodb-logo',
				mysql: 'osm-openshift-mysql-logo',
				nodejs: 'osm-openshift-nodejs-logo',
				perl: 'osm-openshift-perl-logo',
				php: 'osm-openshift-php-logo',
				phpmyadmin: 'osm-openshift-phpmyadmin-logo',
				postgresql: 'osm-openshift-postgresql-logo',
				python: 'osm-openshift-python-logo',
				ruby: 'osm-openshift-ruby-logo',
				switchyard: 'osm-openshift-switchyard-logo',
				zend: 'osm-openshift-zend-logo',
			};
	
			return (img[name] || 'osm-openshift-logo');
		}
	}
}


/**
 * Processes application events (view,start,stop,etc)
 *
 * @param app The OSM Application object to use
 * @param menu_id The ID selector for the popup menu
 * @param list_id The ID selector for the list
 * @param action The event action (start,stop,etc)
 * @param before_message A message to display when starting the event
 * @param after_message A message to display after an event finishes
 *
 * @author Andrew Block, Joey Yore
 * @verison 1.0
 */
function process_application_action(app,menu_id,list_id,action,before_message,after_message) {

	var menu = $(menu_id);
	var list = $(list_id);
	
	menu.popup('close');
	list.children().addClass('ui-disabled');

	var app_name = JSON.parse(localStorage[app.support.is_supported('applications.list',localStorage['sel_domain']).url]).data[localStorage['sel_application']].name;


	var support = app.support.is_supported('application.events',[
		localStorage['sel_domain'],
		localStorage['sel_application']
	]);

	if(!support.supported) return false;

	$.mobile.loading('show', {
		text: before_message + ' ' + app_name,
		textVisible: true,
		theme: 'b'
	});

	var event = 'events='+action;

	app.rest.POST(support.url,event,function(data,text,xhr) {
		$.mobile.loading('hide');
		//TODO: show alert SUCCESS
		list.children().removeClass('ui-disabled');
	},
	function(xhr,err,exception) {
		$.mobile.loading('hide');
		//TODO: show alert ERROR
		list.children().removeClass('ui-disabled');

	});
}




