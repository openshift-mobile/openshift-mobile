
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
			inject(list,data[i]);
		}
		list.listview('refresh');

		function inject(list,domain) {
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
				localStorage['sel_domain'] = i;
				$.mobile.changePage(app_page_id,{transition:DEFAULT_TRANSITION});
			});

			a.append(div);
			li.append(a);
			list.append(li);
		}

		function extract_domain_name(data) {
			return (version < 1.6) ? data.id : data.name;
		}
	}

	
}
