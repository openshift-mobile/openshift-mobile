$('#domain-page').bind('pagebeforeshow',function() {
	var list = app.rest_get('https://openshift.redhat.com/broker/rest/domains',function(d) {
		build_domain_list(d.data);		
	});
	build_domain_list(list);
});

function extract_domain_name(href) {
	var s = href.split('/');
	return s[s.length-1];
}

function build_domain_list(domains) {

	if(!$.isArray(domains)) {
		return;
	}

	var ul = $('#domain-list');
	ul.empty();
	for(var i=0,l=domains.length;i<l;++i) {
		var domain = domains[i];
		var div = $('<div></div>').html('<b>Name: </b>' + extract_domain_name(domain.links.GET.href) + '<br>' +
				'<b>ID: </b>' + domain.id + '<br>' +
				'<b>Gear Sizes: </b>' + domain['allowed_gear_sizes'] + '<br>' +
				'<b>Creation Time: </b>' + domain['creation_time']
		);
		var li = $('<li></li>');
		var a = $('<a></a>');
		a.append(div);
		li.append(a);
		ul.append(li);
	}
	ul.listview('refresh');
}
