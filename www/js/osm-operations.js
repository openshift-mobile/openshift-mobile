
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
 * @author Andrew Block
 * @version 1.0
 */
function logout(app,page) {

	localStorage.clear();
	
	$('#login-username').val(app.settings.username ||'');
	$('#login-password').val('');
	$("#login-enterprise-url-div").hide();
	$("#login-enterprise-url").val('');
	$('#login-auto').checkboxradio();
	$('#login-auto').prop("checked",false).checkboxradio("refresh");
	$("input[name='login-openshift-type-radio-group'][value=online]").prop('checked', true);	
	$('#login-password').attr('checked','false');
	$('#login-instruct').text('Login to OpenShift').css('color','');
	$('#login-container').children().removeClass('ui-disabled');

	app.settings.save({
		'password' : '',
		'username' : '',
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
	var empty_list_id = event.data.empty_list_id;
	var app = event.data.app;
	var app_page_id = event.data.app_page_id;


	if(empty_list_id === undefined || list_id === undefined || app === undefined) {
		return false;
	}

	var list = $(list_id);
	var empty_list = $(empty_list_id);
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
		
		if(data.length == 0) {
			empty_list.show();
		}
		else {
			empty_list.hide();
		}

		for(var i=0,l=data.length;i<l;++i) {
			inject(list,data,i);
		}
		list.listview('refresh');

		function inject(list,domains,index) {
			var domain = domains[index];
			var namesup = app.support.is_supported('domains.name');
			var name = namesup.supported ? domain.name : domain.id;
			
			var li = $('<li id="did-' + domain.id + '"></li>');
			var a1 = $('<a></a>').html('<h2 class="ui-li-heading">' + name + '</h2>' +
					'<p>Available Gears: ' + domain.available_gears + '</p>');
			var a2 = $('<a href="#domain-popupMenu" data-rel="popup"></a>');
			
			a1.click(function() {
			localStorage['sel_domain'] = index;
			$.mobile.changePage(app_page_id,{transition:DEFAULT_TRANSITION});
			});
			
			a2.click(function() {
			localStorage['sel_domain'] = index;
			});
			
			li.append(a1);
			li.append(a2);
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
	var empty_list_id = event.data.empty_list_id;
	var app = event.data.app;
	var app_page_id = event.data.app_page_id;


	if(list_id === undefined || app === undefined) {
		return false;
	}

	var list = $(list_id);
	var empty_list = $(empty_list_id);
	var version = app.settings.load().version;

	var support = app.support.is_supported('applications.list');

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
		
		if(data.length == 0) {
			empty_list.show();
		}
		else {
			empty_list.hide();
		}

		for(var i=0,l=data.length;i<l;++i) {
			inject(list,data,i);
		}
		list.listview('refresh');	

		function inject(list,applications,index) {
			var application = applications[index];
			var li = $('<li id="aid-' + application.id + '"></li>');

			var a1 = $('<a></a>').html('<img class="osm-icon-container ' +
										get_img(application.framework.split('-')[0]) +
										'"/><h3 class="appid">' + application.name + '</h3><p>' + application.app_url + '</p>');
			var a2 = $('<a href="#application-popupMenu" data-rel="popup"></a>');

			a1.click(function() {
				localStorage['sel_application'] = index;
				$.mobile.changePage(app_page_id,{transition:DEFAULT_TRANSITION});
			});

			a2.click(function() {
				localStorage['sel_application'] = index;
			});

			li.append(a1);
			li.append(a2);
			list.append(li);
		}

		
	}
}

/**
 * Gets the class name to apply a specific logo
 *
 * @param name The name of the framework to get the logo for
 * @return The classname for the logo
 *
 * @author Joey Yore
 * @version 1.0
 */
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

/**
 * Build the list of applications on the applications page
 *
 * @param event Event data passed thru event bind
 *
 * @author Joey Yore
 * @version 1.0
 */
function application_content_build(event) {
	var app = event.data.app;
	var app_info_id = event.data.app_info_id;
	var title_id = event.data.title_id;
	var cartridge_list_id = event.data.cartridge_list_id;
	var cartridge_empty_list_id = event.data.cartridge_empty_list_id;
	var alias_list_id = event.data.alias_list_id;
	var alias_empty_list_id = event.data.alias_empty_list_id;

	var support = app.support.is_supported('application.get');

	if(support.supported === false) {
		return false;
	}

	var rdata = app.rest.GET(support.url,function(d) {
		build_page(d.data);
	});

	if(rdata !== null && typeof rdata.data !== 'undefined') {
		build_page(rdata.data);
	}


	function build_page(data) {


		$(title_id).text(data.name);

		build_info_tab();
		build_cartridge_tab();
		build_aliases_tab();
	
	
		function build_info_tab() {

			var param = $(app_info_id).find('td');

			
			var p1 = $(param[1]);
			if(app.support.is_supported('applications.id').supported) {
				p1.prev().show();
				p1.show().text(data.id);
			} else {
				p1.prev().hide();
				p1.hide();
			}

			$(param[0]).text(data.name);
			$(param[2]).text(data.app_url);
			$(param[3]).text(data.framework);
			$(param[4]).text(data.gear_count);
			$(param[5]).text(data.gear_profile);
			$(param[6]).text(data.scalable);
			$(param[7]).text(data.auto_deploy);
			$(param[8]).text(data.deployment_type);
			$(param[9]).text(data.deployment_branch);

		}

		function build_cartridge_tab() {

			var support = app.support.is_supported('application.cartridges');
			if(!support.supported) return false;

			var rdata = app.rest.GET(support.url,function(d) {
				build_cartridge_list(d.data);
			});

			if(rdata !== null && typeof rdata !== 'undefined') {
				build_cartridge_list(rdata.data);
			}

			function build_cartridge_list(cdata) {
				var ul = $(cartridge_list_id);
				ul.empty();

				var l = cdata.length;
				if(l == 0) {
					$(cartridge_empty_list_id).show();
				} else {
					$(cartridge_empty_list_id).hide();
				}

				for(var i=0;i<l;++i) {
					inject(ul,cdata,i);
				}
				ul.listview('refresh');

				function inject(list,cartridges,index) {
					var c = cartridges[index];

					var li = $('<li></li>');
					var status_id = data.name + '-' + c.name.replace('.','-') + '-status';
						var a1 = $('<a></a>').html(
						'<img class="osm-icon-container ' + get_img(c.name.split('-')[0]) + 
						'"/><h3>' + c.display_name + '</h3><p><b>Status:</b> <span id="' + status_id + '">Pending...</span><br><b>Gears:</b> ' +
						c.current_scale + ' (min: ' + c.scales_from + ', max: ' + 
						c.scales_to + ')</p>'
						
					);

					var a2 = $('<a href="#cartridge-popupMenu" data-rel="popup"></a>');

					a1.click(function() {
						localStorage['sel_cartridge'] = index;
						//update_cartridge_status(index);
						refresh();
					});

					a2.click(function() {
						localStorage['sel_cartridge'] = index;
					});


					li.append(a1);
					li.append(a2);
					list.append(li);

					update_cartridge_status(index);

					function update_cartridge_status(index) {
						localStorage['sel_cartridge'] = index;

						var support = app.support.is_supported('cartridge.status');

						if(!support.supported) {
							return false;
						}

						var rdata = app.rest.GET(support.url,function(d) {
							helper(d);
						});

						if(rdata !== null && typeof rdata !== 'undefined') {
							helper(rdata);
						}


						function helper(data) {
							var msg = data.data.status_messages[0].message;
							var node = $('#' + status_id);

							if(msg.indexOf('stopped') >= 0) {
								node.text('Stopped').css('color','#CC0000');
							} else {
								node.text('Started').css('color','#007700');
							}
						}
					}
				}
			}
		}

		function build_aliases_tab() {
			var support = app.support.is_supported('application.aliases');
			if(!support.supported) return false;

			var rdata = app.rest.GET(support.url,function(d) {
				build_alias_list(d);
			});

			if(rdata !== null && typeof rdata !== 'undefined') {
				build_alias_list(rdata);
			}

			function build_alias_list(adata) {
				var data = adata.data;
				var ul = $(alias_list_id);
				ul.empty();

				var l = data.length;
				if(l == 0) {
					$(alias_empty_list_id).show();
				} else {
					$(alias_empty_list_id).hide();
				}

				for(var i=0;i<l;++i) {
					inject(ul,data,i);
				}
				ul.listview('refresh');

				function inject(list,aliases,index) {
					var alias = aliases[index];

					var li = $('<li></li>');
					var a1 = $('<a></a>').html('<h3>' + alias.id + '</h3');
					var a2 = $('<a href="#" id="#alias-delete"></a>');

					a1.click(function() {
						localStorage['sel_alias'] = index;
					});

					a2.click(function() {
						localStorage['sel_alias'] = index;
						alias_delete();
					});

					li.append(a1);
					li.append(a2);
					list.append(li);


					function alias_delete() {
						
						var alias_name = JSON.parse(localStorage[app.support.is_supported('application.aliases').url]).data[localStorage['sel_alias']].id;

						
						var support = app.support.is_supported('aliases.delete');

						show_confirm_dialog($( '#application-content-popup-confirm-dialog' ), "Alias Action", "Are you sure you want to delete " + alias_name + "?", function(){

							$('#app-content-aliases').children().addClass('ui-disabled');

							$.mobile.loading('show', {
								text : 'Deleting ' + alias_name,
								textVisible : true,
								theme : 'b',
							});
							
							app.rest.DELETE(support.url,
									function(data,text,xhr) {
										$.mobile.loading('hide');
										show_alert_dialog($("#application-content-popup-alert-dialog"),"Alias Operation", alias_name + " Deleted Successfully");
										$('#app-content-aliases').children().removeClass('ui-disabled');
										refresh();
									},
									function(jqxhr,errType,exception) {

										$.mobile.loading('hide');
										// Check to see if messages are returned from OpenShift
										if(jqxhr.status == "422") {
											var json = jQuery.parseJSON(jqxhr.responseText);
											var messages = "";

											$.each(json.messages, function(index,value) {
												if(messages != "") messages += "\n";
												messages += value.text;
											});

											show_alert_dialog($("#application-content-popup-alert-dialog"),"Alias Operation Failed",messages);
										}
										else {
											show_alert_dialog($("#application-content-popup-alert-dialog"),"Alias Operation Failure", alias_name + " Failed to be Deleted");
										}

										$('#app-content-aliases').children().removeClass('ui-disabled');				
									}
								);

						});
					

					
					}

				}
			}
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
 * @author Andrew Block
 * @author Joey Yore
 * @verison 1.0
 */
function process_application_action(app,menu_id,list_id,action,before_message,after_message) {

	var menu = $(menu_id);
	var list = $(list_id);
	
	menu.popup('close');
	list.children().addClass('ui-disabled');

	var app_name = JSON.parse(localStorage[app.support.is_supported('applications.list').url]).data[localStorage['sel_application']].name;


	var support = app.support.is_supported('application.events');

	if(!support.supported) return false;

	$.mobile.loading('show', {
		text: before_message + ' ' + app_name,
		textVisible: true,
		theme: 'b'
	});

	var event = 'event='+action;

	app.rest.POST(support.url,event,function(data,text,xhr) {
		$.mobile.loading('hide');
		show_alert_dialog($("#applications-popup-alert-dialog"),"Application Operation", app_name + " " + after_message + " Successfully");

		list.children().removeClass('ui-disabled');
	},
	function(xhr,err,exception) {
		$.mobile.loading('hide');
		show_alert_dialog($("#applications-popup-alert-dialog"),"Application Operation Failure", app_name + " Failed to be "+ after_message);
		list.children().removeClass('ui-disabled');
	});
}

/**
 * Processes cartridge events (start,stop,etc)
 *
 * @param app The OSM Application object to use
 * @param menu_id The ID selector for the popup menu
 * @param list_id The ID selector for the list
 * @param action The event action (start,stop,etc)
 * @param before_message A message to display when starting the event
 * @param after_message A message to display after an event finishes
 *
 * @author Andrew Block
 * @author Joey Yore
 * @verison 1.0
 */
function process_cartridge_action(app,menu_id,list_id,action,before_message,after_message) {

	var menu = $(menu_id);
	var list = $(list_id);

	menu.popup('close');
	list.children().addClass('ui-disabled');

	var cartridge_name = JSON.parse(localStorage[app.support.is_supported('application.cartridges').url]).data[localStorage['sel_cartridge']].name;

	var support = app.support.is_supported('cartridge.events');

	if(!support.supported) return false;

	$.mobile.loading('show', {
		text : before_message + ' ' + cartridge_name,
		textVisible : true,
		theme : 'b'
	});

	var event = 'event=' + action;

	app.rest.POST(support.url,event,function(data,text,xhr) {
		$.mobile.loading('hide');
		show_alert_dialog($('#application-content-popup-alert-dialog'),'Cartridge Operation', cartridge_name + ' ' + after_message + 'successfully');
		list.children().removeClass('ui-disabled');
		refresh();
	},
	function(xhr,err,exception) {
		$.mobile.loading('hide');
		show_alert_dialog($('#application-content-popup-alert-dialog'),'Cartridge Operation', cartridge_name + ' ' + 'failed to be ' + after_message);
		list.children().removeClass('ui-disabled');
	});

}

/**
 * Initialize the Create Alias Page
 *
 * @param event Event data passed thru event bind
 *
 * @author Andrew Block
 * @version 1.0
 */
function new_alias_init(event) {
	var alias_name = $(event.data.alias_name_id);
	alias_name.val("");
}

/**
 * Initialize the Create Domain Page
 *
 * @param event Event data passed thru event bind
 *
 * @author Andrew Block
 * @version 1.0
 */
function new_domain_init(event) {

	var domain_name = $(event.data.domain_name_id);
	
	domain_name.val("");
}


/**
 *	Refreshes the current page
 */
function refresh() {
	$('#' + $.mobile.activePage.attr('id')).trigger('pagebeforeshow');
}

/**
 * Build the list of application type for new creation
 *
 * @param event Event data passed thru event bind
 * @param data allows for access to previous page data
 *
 * @author Andrew Block
 * @author Joey Yore
 * @version 1.0
 */
function application_type_list_build(event, data) {
	
	// Check to make sure entry is not from cartridge dialog
	var prevPage = data.prevPage.attr('id');

	if(prevPage != null && prevPage != 'new-application-cartridge-dialog') {

	
		var list_id = event.data.list_id;
		var app = event.data.app;
		var name_id = event.data.name_id;
		var git = event.data.git;
		var git_container = event.data.git_container;
		var git_url = event.data.git_url;
	
		if(list_id === undefined || app === undefined || name_id === undefined || git === undefined || git_container === undefined || git_url === undefined) {
			return false;
		}
	
		var list = $(list_id);
		var version = app.settings.load().version;
	
		var support = app.support.is_supported('cartridges.get');
	
		if(support.supported === false) {
			return false;
		}
	
		var rdata = app.rest.GET(support.url,function(d) {
			build_application_type_list(d.data);
		});
	
		if(rdata !== null && typeof rdata.data !== 'undefined') {
			build_application_type_list(rdata.data);
		}
	}

	function build_application_type_list(data) {

		if(!$.isArray(data)) {
			return false;
		}

		$(name_id).val('');
		$(git_url).val('');
		$(git_container).hide();
		$(git).prop("checked", false);
		$(git).checkboxradio("refresh");
		list.empty();
		list.trigger('change');

		var osm_cartridges = [];

		for(var i=0,l=data.length;i<l;++i) {
			var cartridge = data[i];
			if(cartridge.type === "standalone") {
				osm_cartridges.push([cartridge.name,cartridge.display_name]);
			}
		}

		osm_cartridges.sort(function(a,b) {
			if(a[1] < b[1]) return -1;
			if(a[1] > b[1]) return 1;
			return 0;
		});
		
		for(var i=0,l=osm_cartridges.length;i<l;++i) {
			list.append('<option value="' + osm_cartridges[i][0] + '">' + osm_cartridges[i][1] + '</option>');
		}

		list.trigger('change');
	}
}



/**
 * Triggers the page's alert popup with customizable content
 *
 * @param popup_object The jQuery node for the popup
 * @param header HTML content for the popup header
 * @param content HTML content for the popup body
 * @param callback A callback function to be called when the alert is dismissed
 *
 * @author Andrew Block
 * @version 1.0
 */
function show_alert_dialog(popup_object,header,content,callback) {

	popup_object.find('[id$="popup-alert-dialog-header"]').html(header);
	popup_object.find('[id$="popup-alert-dialog-content"]').html(content);

	popup_object.popup();
	popup_object.popup('open');
	popup_object.unbind();

	if(callback) {
		popup_object.bind({
			popupafterclose: function(event,ui) {
				callback(event,ui);
			}
		});
	}
}

/**
 * Build the list of embedded cartridges
 *
 * @param event Event data passed thru event bind
 * @param data allows for access to previous page data
 *
 * @author Andrew Block
 * @author Joey Yore
 * @version 1.0
 */
function embedded_cartridge_type_list_build(event, data) {
	
	// Check to make sure entry is not from cartridge dialog
	var prevPage = data.prevPage.attr('id');

	if(prevPage != null && prevPage != 'new-embedded-cartridge-cartridge-dialog') {
	
		var list_id = event.data.list_id;
		var app = event.data.app;
	
		if(list_id === undefined || app === undefined) {
			return false;
		}
	
		var list = $(list_id);
		var version = app.settings.load().version;
	
		var support = app.support.is_supported('cartridges.get');
	
		if(support.supported === false) {
			return false;
		}
	
		var rdata = app.rest.GET(support.url,function(d) {
			build_embedded_cartridge_type_list(d.data);
		});
	
		if(rdata !== null && typeof rdata.data !== 'undefined') {
			build_embedded_cartridge_type_list(rdata.data);
		}
	}
	
	function build_embedded_cartridge_type_list(data) {

		if(!$.isArray(data)) {
			return false;
		}

		list.empty();
		list.trigger('change');

		var osm_cartridges = [];

		for(var i=0,l=data.length;i<l;++i) {
			var cartridge = data[i];
			if(cartridge.type === "embedded") {
				osm_cartridges.push([cartridge.name,cartridge.display_name]);
			}
		}

		osm_cartridges.sort(function(a,b) {
			if(a[1] < b[1]) return -1;
			if(a[1] > b[1]) return 1;
			return 0;
		});
		
		for(var i=0,l=osm_cartridges.length;i<l;++i) {
			list.append('<option value="' + osm_cartridges[i][0] + '">' + osm_cartridges[i][1] + '</option>');
		}

		list.trigger('change');
	}
}

/**
 * Triggers the page's confirm popup with customizable content
 *
 * @param popup_object The jQuery node for the popup
 * @param header HTML content for the popup header
 * @param content HTML content for the popup body
 * @param yes_callback A callback function to be called when the yes button is clicked
 * @param no_callback A callback function to be called when the no button is clicked
 *
 * @author Andrew Block
 * @version 1.0
 */
function show_confirm_dialog(popup_object,header,content,yes_callback, no_callback) {
	popup_object.find("[id$='popup-confirm-dialog-header']").html(header);
	popup_object.find("[id$='popup-confirm-dialog-content']").html(content);

	popup_object.popup();
	popup_object.popup( "open" );
	popup_object.unbind();
		
	// Yes Callback
	var yes_button = popup_object.find("[id$='popup-confirm-dialog-yes-button']");
	var yes_button_callback;

	if(yes_callback) {
		yes_button_callback = function() {
			popup_object.popup("close");
			yes_callback();
		};
	}
	else {
		yes_button_callback =  function() {
			popup_object.popup("close");
		};
	}
		
	yes_button.unbind();
	yes_button.bind("click",yes_button_callback);
		
	// Optional No Callback
	var no_button = popup_object.find("[id$='popup-confirm-dialog-no-button']");
	var no_button_callback;

	if(no_callback) {
		no_button_callback = function() {
			popup_object.popup("close");
			no_callback();
		};
	}
	else {
		no_button_callback =  function() {
			popup_object.popup("close");
		};
	}

	// Bind No Button
	no_button.unbind();
	no_button.bind("click", no_button_callback);
}
