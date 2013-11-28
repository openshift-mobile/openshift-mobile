$('#new-embedded-cartridge-page').bind('pagebeforeshow',function(event,data) {
	
	// Check to make sure entry is not from cartridge dialog
	var prevPage = data.prevPage.attr('id');
	
	if(prevPage != null && prevPage != 'new-embedded-cartridge-cartridge-dialog') {
				
		var list = app.rest_get('cartridges',function(d) {
			build_embedded_cartridge_list(d.data);		
		});
		build_embedded_cartridge_list(list);
	}
});

$(document).bind('osm-new-embedded-cartridge-page',function() {
	$.mobile.changePage('#new-embedded-cartridge-page',{transition:'pop'});
});

function build_embedded_cartridge_list(cartridges) {


	if(!$.isArray(cartridges)) {
		return;
	}
	
	
	var newEmbeddedCartridgeList = $('#new-embedded-cartridge-cartridge');
	newEmbeddedCartridgeList.empty();
	newEmbeddedCartridgeList.trigger("change");

	var openShiftCartridges = [];
	
	for(var i=0,l=cartridges.length;i<l;++i) {
		var cartridge = cartridges[i];
		if("embedded" == cartridge.type) {
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
		newEmbeddedCartridgeList.append('<option value="' + openShiftCartridge[0] + '">' + openShiftCartridge[1] + '</option>');

	}
	
	newEmbeddedCartridgeList.trigger("change");

}


$('#create-embedded-cartridge-submit').click(function() {
	var formdata = $('#new-embedded-cartridge-form').serialize();
	$('#create-embedded-cartridge-container').children().addClass('ui-disabled');

	$.mobile.loading('show', {
		text : 'Creating ' + $('#new-embedded-cartridge-cartridge option:selected').text(),
		textVisible : true,
		theme : 'b',
	});
	
	app.rest_post('domains/' + app.get_domain() + '/applications/' + app.get_application().name + '/cartridges/', formdata,
		function(d) {
			$.mobile.loading('hide');
			$('#create-embedded-cartridge-container').children().removeClass('ui-disabled');
			app.show_alert_dialog($("#new-embedded-cartridge-popup-alert-dialog"),"Embedded Cartridge Creation","Embedded Cartridge Created Successfully", function(event,ui){
				history.back();
				$(document).trigger('osm-rebuild-application-cartridges');
			});
		},
		function(jqxhr,errType,exception) {
			
			// Check to see if messages are returned from OpenShift
			if(jqxhr.status == "422") {
				
				var json = jQuery.parseJSON(jqxhr.responseText);
				var messages = "";
				
				$.each(json.messages, function(index,value) {
					if(messages != "") messages += "\n";
					messages += value.text;
				});
				
				app.show_alert_dialog($("#new-embedded-cartridge-popup-alert-dialog"),"Application Creation Failed",messages);
			}
			else {
				app.show_alert_dialog($("#new-embedded-cartridge-popup-alert-dialog"),"Embedded Cartridge Creation Failed","The Embedded Cartridge Failed to be Created");
			}
			
			$.mobile.loading('hide');
			$('#create-embedded-cartridge-container').children().removeClass('ui-disabled');
		}
	);
	
	return false;
});