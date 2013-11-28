$('#new-alias-page').bind('pagebeforeshow',function(event,data) {
	$('#new-alias-id').val('');
});


$('#create-alias-submit').click(function() {
	var formdata = $('#new-alias-form').serialize();
	
	$('#create-alias-container').children().addClass('ui-disabled');

	$.mobile.loading('show', {
		text : 'Creating ' + $('#new-alias-id').val(),
		textVisible : true,
		theme : 'b',
	});
	
	app.rest_post('domains/' + app.get_domain() + '/applications/' + app.get_application().name + '/aliases/', formdata,
		function(d) {
			$.mobile.loading('hide');
			$('#create-alias-container').children().removeClass('ui-disabled');
			app.show_alert_dialog($("#new-alias-popup-alert-dialog"),"Alias Creation","Alias Created Successfully", function(event,ui){
				history.back();
				$(document).trigger('osm-rebuild-application-aliases');
			});
		},
		function(jqxhr,errType,exception) {
			$.mobile.loading('hide');			
			// Check to see if messages are returned from OpenShift
			if(jqxhr.status == "422") {

				var json = jQuery.parseJSON(jqxhr.responseText);
				var messages = '';
				
				$.each(json.messages, function(index,value) {
					if(messages != '') messages += "\n";
					messages += value.text;
				});
				
				app.show_alert_dialog($("#new-alias-popup-alert-dialog"),"Alias Creation Failed",messages);
			}
			else {
			
				app.show_alert_dialog($("#new-alias-popup-alert-dialog"),"Alias Creation Failed","The Alias Failed to be Created");
			}
			
			$.mobile.loading('hide');
			$('#create-alias-container').children().removeClass('ui-disabled');
		}
	);
	
	return false;
});