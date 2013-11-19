$('#applications-page').bind('pagebeforeshow',function() {
	var list = app.rest_get('domains/' + app.get_domain() + '/applications', function(d) {
		build_application_list(d.data);
	});
	build_application_list(list);
});

function build_application_list(apps) {
	if(!$.isArray(apps)) {
		return;
	}
	var ul = $('#application-list');
	ul.empty();
	for(var i=0,l=apps.length;i<l;++i) {
		var a = apps[i];
		var li = $('<li id="aid-' + app.parse_application_identifier(a) + '"></li>');
		var a1 = $('<a></a>')
				.html('<img class="osm-icon-container ' + get_apps_img(a.framework.split('-')[0]) + 
						'"/><h3>' + a.name + '</h3><p>' + a.app_url + '</p>');
		var a2 = $('<a href="#application-popupMenu" data-rel="popup"></a>');

		a1.click(function() {
			app.set_application(extract_identifier($(this).parent().parent().parent()));
			//TODO: Transition to app's page
		});

		a2.click(function() {
			app.set_application(extract_identifier($(this).parent()));
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
	}
	
	return (img[framework] || 'osm-openshift-logo')
}

function extract_identifier(node) {
	return node.attr('id').split('-').slice(1).join('-');
}
