$('#new-application-page').bind('pagebeforeshow',function(event,data) {
	
	// Check to make sure entry is not from cartridge dialog
	var prevPage = data.prevPage.attr('id');
	
	if(prevPage != null && prevPage != 'new-application-cartridge-dialog') {
				
		var list = app.rest_get('cartridges',function(d) {
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
		if("standalone" == cartridge.type) {
			openShiftCartridges.push([cartridge.name, cartridge.display_name]);	
		}
	}
	
	openShiftCartridges.sort(function(a,b){ 		
		if(a[1] < b[1]) return -1;
		if(a[1] > b[1]) return 1;	
		return 0;
	});
	
	for(var i=0,l=openShiftCartridges.length;i<l;++i) {
		var openShiftCartridge = openShiftCartridges[i];
		newAppCartridgeList.append('<option value="' + openShiftCartridge[0] + '">' + openShiftCartridge[1] + '</option>');

	}
	
	newAppCartridgeList.trigger("change");

}

$('#create-application-submit').click(function() {
	var formdata = $('#new-application-form').serialize();
	$('#create-application-container').children().addClass('ui-disabled');

	$.mobile.loading('show', {
		text : 'Creating ' + $('#new-application-name').val(),
		textVisible : true,
		theme : 'b',
	});
	
	app.rest_post('domains/' + app.get_domain() + '/applications', formdata,
		function(d) {
			$.mobile.loading('hide');
			$('#create-application-container').children().removeClass('ui-disabled');
			app.show_alert_dialog("Application Creation","Application Created Successfully", function(event,ui){
				history.back();
			});
		},
		function(jqxhr,errType,exception) {
			
			// Check to see if messages are returned from OpenShift
			if(jqxhr.status = "422") {
				
				var json = jQuery.parseJSON(jqxhr.responseText);
				var messages = "";
				
				$.each(json.messages, function(index,value) {
					if(messages != "") messages += "\n";
					messages += value.text;
				});
				
				app.show_alert_dialog("Application Creation Failed",messages);
			}
			else {
				app.show_alert_dialog("Application Creation Failed","The Application Failed to be Created");
			}
			
			$.mobile.loading('hide');
			$('#create-application-container').children().removeClass('ui-disabled');
		}
	);
	
	return false;
});

