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
		var li = $('<li></li>');
		var a1 = $('<a></a>')
				.html('<img src="' + get_apps_img(a.framework) + 
						'"/><h3>' + a.name + '</h3><p>' + a.app_url + '</p>');
		var a2 = $('<a id="application-' + a.name + '" href="#application-popupMenu" data-rel="popup"></a>');

		a1.click(function() {
			app.set_application(a.name);
			//TODO: Transition to app's page	
		});

		a2.click(function() {
			app.set_application($(this).attr('id').split('-')[1]);
		});

		li.append(a1);
		li.append(a2);
		ul.append(li);
	}
	ul.listview('refresh');
}


function get_apps_img(framework) {
	var img = {

	}
	
	return 'img/frameworks/' + (img[framework] || 'icon-72.png')
}
