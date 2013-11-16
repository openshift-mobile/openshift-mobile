$('#login-submit').click(function() {
	var user = $('#login-username').val();
	var pass = $('#login-password').val();
	var auto = String($('#login-auto').is(':checked'));
	$('#login-container').children().addClass('ui-disabled');
	app.login(user,pass,auto);
});

$(document).bind('osm-login',function() {
	$.mobile.changePage('#domain-page',{transition:'slide'});
});

$(document).bind('osm-login-failed',function() {
	$('#login-instruct').text('Login Failed').css('color','#CC0000');
	$('#login-container').children().removeClass('ui-disabled');
	if($.mobile.activePage.attr('id') !== 'login-page') {
		$.mobile.changePage('#login-page',{transition:'slide'});
	}
});

$(document).bind('osm-logout',function() {
	$('#login-username').val(app.getUsername()||'');
	$('#login-password').val('');
	$('#login-password').attr('checked','false');
	
	$('#login-instruct').text('Login to OpenShift').css('color','');
	$('#login-container').children().removeClass('ui-disabled');
	$.mobile.changePage('#login-page',{transition:'slide'});
	$.mobile.loading('hide');
});
