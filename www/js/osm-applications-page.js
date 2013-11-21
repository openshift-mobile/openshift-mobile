$('#applications-page').bind('pagebeforeshow',function() {
	get_applications_list();
});

function get_applications_list() {
	var list = app.rest_get('domains/' + app.get_domain() + '/applications', function(d) {
		build_application_list(d.data);
	});

	if(list !== null && typeof list.data !== 'undefined') {
		build_application_list(list.data||undefined);
	}
}

function build_application_list(apps) {
	if(!$.isArray(apps)) {
		return;
	}
	var ul = $('#application-list');
	ul.empty();
	for(var i=0,l=apps.length;i<l;++i) {
		var a = apps[i];
		var li = $('<li id="aid-' + app.parse_application_identifier(a) + '"></li>');
		li.data("os-name", a.name);
		li.data("os-url", a.app_url);
		li.data('osm-app-data',a);
		
		var a1 = $('<a></a>')
				.html('<img class="osm-icon-container ' + get_apps_img(a.framework.split('-')[0]) + 
						'"/><h3 class="appid">' + a.name + '</h3><p>' + a.app_url + '</p>');
		var a2 = $('<a href="#application-popupMenu" data-rel="popup"></a>');

		a1.click(function() {
			app.set_application_id(extract_identifier($(this).parent().parent().parent()));
			$.mobile.changePage('#app-content-page',{transition:'slide'});
			build_app_content($(this).closest('li').data('osm-app-data'));
		});

		a2.click(function() {
			app.set_application_name($(this).parent().find('.appid').html());
			app.set_application_id(extract_identifier($(this).parent()));
			app.set_application_url($(this).parent().data("os-url"));
		});

		li.append(a1);
		li.append(a2);
		ul.append(li);
	}
	ul.listview('refresh');
}


function get_apps_img(framework) {
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
	
	return (img[framework] || 'osm-openshift-logo');
}

function extract_identifier(node) {
	return node.attr('id').split('-').slice(1).join('-');
}


// Application Operation Functions
$('#application-start').click(function() {
	process_application_action('start', 'Starting', 'Started');
});

$('#application-stop').click(function() {
	process_application_action('stop', 'Stopping', 'Stopped');
});

$('#application-restart').click(function() {
	process_application_action('restart', 'Restarting', 'Restarted');
});

$('#application-view').click(function() {
	$("#application-popupMenu" ).popup( "close" );	
	window.open(app.get_application_url(), '_blank', 'location=no');
});

$('#application-delete').click(function() {
	
	$("#application-popupMenu" ).popup( "close" );	
	$('#application-list').children().addClass('ui-disabled');
	
	$.mobile.loading('show', {
		text : 'Deleting ' + app.get_application_name(),
		textVisible : true,
		theme : 'b',
	});	
	
	app.rest_delete('domains/' + app.get_domain() + '/applications/' + app.get_application_name(), event,
			function(data,text,xhr) {
				$.mobile.loading('hide');
				app.show_alert_dialog("Application Operation",app.get_application_name() + " Deleted Successfully", function() {
					get_applications_list();
				});
				$('#application-list').children().removeClass('ui-disabled');
			},
			function(jqxhr,errType,exception) {
				$.mobile.loading('hide');
				app.show_alert_dialog("Application Operation Failure",app.get_application_name() + " Failed to be Deleted");
				$('#application-list').children().removeClass('ui-disabled');				
			}
		);
});


function process_application_action(action,before_message,after_message) {
	
	$("#application-popupMenu" ).popup( "close" );	
	$('#application-list').children().addClass('ui-disabled');

	$.mobile.loading('show', {
		text : before_message + ' ' + app.get_application_name(),
		textVisible : true,
		theme : 'b',
	});	

	var event = 'event='+action;
	
	app.rest_post('domains/' + app.get_domain() + '/applications/' + app.get_application_name() + '/events', event,
			function(data,text,xhr) {
				$.mobile.loading('hide');
				app.show_alert_dialog("Application Operation",app.get_application_name() + " " + after_message + " Successfully");
				$('#application-list').children().removeClass('ui-disabled');
			},
			function(jqxhr,errType,exception) {
				$.mobile.loading('hide');
				app.show_alert_dialog("Application Operation Failure",app.get_application_name() + " Failed to be "+ after_message);
				$('#application-list').children().removeClass('ui-disabled');				
			}
		);

};
