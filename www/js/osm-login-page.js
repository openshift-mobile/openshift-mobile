$('#login-submit').click(function() {
	var user = $('#login-username').val();
	var pass = $('#login-password').val();
	var auto = String($('#login-auto').is(':checked'));
	var os_type = $("input[name='login-openshift-type-radio-group']:checked").val();
	var enterprise_url = $('#login-enterprise-url').val(); 
	$('#login-container').children().addClass('ui-disabled');
	app.login(user,pass,auto,os_type, enterprise_url);
});

$("input[name='login-openshift-type-radio-group']").change(function(e){
	var enterprise_url_textbox_div = $("#login-enterprise-url-div");
    if($(this).val() == 'enterprise') {
    	enterprise_url_textbox_div.show();
    } else {
    	enterprise_url_textbox_div.hide();
    }
});


$(document).bind('osm-login',function() {
	$.mobile.changePage('#domain-page',{transition:'none'});
});


$(document).bind('osm-login-failed',function() {
	$('#login-instruct').text('Login Failed').css('color','#CC0000');
	$('#login-container').children().removeClass('ui-disabled');
	if($.mobile.activePage.attr('id') !== 'login-page') {
		$.mobile.changePage('#login-page',{transition:'none'});
	}
});

$(document).bind('osm-logout',function() {
	$('#login-username').val(app.getUsername()||'');
	$('#login-password').val('');
	$("#login-enterprise-url-div").hide();
	$("#login-enterprise-url").val('');
	$('#login-auto').attr("checked",false).checkboxradio("refresh");
	$("input[name='login-openshift-type-radio-group'][value=online]").prop('checked', true);	
	$('#login-password').attr('checked','false');
	$('#login-instruct').text('Login to OpenShift').css('color','');
	$('#login-container').children().removeClass('ui-disabled');
	$.mobile.changePage('#login-page',{transition:'none'});
	$.mobile.loading('hide');
});
