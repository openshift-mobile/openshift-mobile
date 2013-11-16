$('#new-application-page').bind('pagebeforeshow',function(event,data) {
	
	// Check to make sure entry is not from cartridge dialog
	var prevPage = data.prevPage.attr('id');
	
	if(prevPage != null && prevPage != 'new-application-cartridge-dialog') {
				
		var list = app.rest_get('https://openshift.redhat.com/broker/rest/cartridges',function(d) {
			build_new_application_cartridge_list(d.data);		
		});
		build_new_application_cartridge_list(list);
	}
});

$(document).bind('osm-new-application-page',function() {
	$.mobile.changePage('#new-application-page',{transition:'pop'});
});

function build_new_application_cartridge_list(cartridges) {

	if(!$.isArray(cartridges)) {
		return;
	}
	
	$('#new-application-name').val('');
	
	var newAppCartridgeList = $('#new-application-cartridge');
	newAppCartridgeList.empty();
	newAppCartridgeList.trigger("change");

	var openShiftCartridges = [];
	
	for(var i=0,l=cartridges.length;i<l;++i) {
		var cartridge = cartridges[i];
		openShiftCartridges.push([cartridge.name, cartridge.display_name]);
	}
	
	openShiftCartridges.sort(function(a,b){ 
		var aL = a[1].toLowerCase();
		var bL = b[1].toLowerCase();
		
		if(aL[1] < bL[1]) return -1;
		if(aL[1] > bL[1]) return 1;	
		return 0;
	});
	
	for(var i=0,l=openShiftCartridges.length;i<l;++i) {
		var openShiftCartridge = openShiftCartridges[i];
		newAppCartridgeList.append('<option value="' + openShiftCartridge[0] + '">' + openShiftCartridge[1] + '</option>');

	}
	
	newAppCartridgeList.trigger("change");

}

$('#create-application-submit').click(function() {
	var applicationName = $('#new-application-name').val();
	var cartridgeType = $('#new-application-cartridge').val();
	alert("Application Name: "+applicationName+"\nCartridge Type: "+cartridgeType);
//	var auto = String($('#login-auto').is(':checked'));
//	$('#login-container').children().addClass('ui-disabled');
//	app.login(user,pass,auto);
});



