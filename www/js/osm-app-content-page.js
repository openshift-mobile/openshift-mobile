
function build_app_content(data) {

	//Title
	$('#app-content-title').text(data.name);

	//Info page
	var param = $('#app-content-info').find('td');
	$(param[0]).text(data.id);
	$(param[1]).text(data.app_url);
	$(param[2]).text(data.framework);
	$(param[3]).text(data.gear_count);
	$(param[4]).text(data.gear_profile);
	$(param[5]).text(data.scalable);
	$(param[6]).text(data.auto_deploy);
	$(param[7]).text(data.deployment_type);
	$(param[8]).text(data.deployment_branch);
	

	get_cartridge_list(data);
	
	get_alias_list(data);
}

function get_cartridge_list(data) {
	var c = app.rest_get('application/' + data.id + '/cartridges', function(d) {
		build_cartridge_list(d);		
	});
	
	if(c !== null && typeof c !== 'undefined') {
		build_cartridge_list(c);
	}
}

function get_alias_list(data) {
	var a = app.rest_get('application/' + data.id + '/aliases', function(d){
		build_alias_list(d);		
	});

	if(a !== null && typeof a !== 'undefined') {
		build_alias_list(a);
	}
}

function build_cartridge_list(rdata) {
	
	var data = rdata.data;
	var ul = $('#app-cartridge-list');

	ul.empty();
	for(var i=0,l=data.length;i<l;++i) {
		var li = $('<li></li>');
		li.data('osm-cartridge-data',data[i]);

		var a1 = $('<a></a>')
				 .html('<img class="osm-icon-container ' + get_apps_img(data[i].name.split('-')[0]) +
					   '"/><h3>' + data[i].display_name + '</h3><p><b>Status:</b> <span id="' + $('#app-content-title').text() + '-' + data[i].name.replace('.','-') +'-status">Pending...</span><br><b>Gears:</b> ' + data[i].current_scale + ' (min: ' + data[i].scales_from + ', max: ' + data[i].scales_to + ')</p>');

		var a2 = $('<a href="#cartridge-popupMenu" data-rel="popup"></a>');

		a1.click(function() {
			
		});

		a2.click(function() {
			app.set_cartridge($(this).parent().data("osm-cartridge-data"));
		});

		li.append(a1);
		li.append(a2);
		ul.append(li);

		update_status(data[i]);
	}
	ul.listview('refresh');
}

function update_status(cartridge) {
	var cached = app.rest_get('application' + cartridge.links.GET.href.split('application')[1] + '?include=status_messages',function(d) {
		update_status_helper(d);
	});

	update_status_helper(cached);
}

function update_status_helper(d) {

	if(d === null || typeof d.data === 'undefined') {
		return;
	}

	var message = d.data.status_messages[0].message;
	var node = $('#' + $('#app-content-title').text() + '-' + d.data.name.replace('.','-') + '-status');

	if(message.indexOf('stopped') >= 0 ) {
		node.text('Down').css('color','#CC0000');
	} else {
		node.text('Up').css('color','#007700');
	}

}

function build_alias_list(rdata) {

	var data = rdata.data;
	var ul = $('#app-alias-list');
	ul.empty();
	for(var i=0,l=data.length;i<l;++i) {
		var li = $('<li></li>');
		li.data('osm-alias-data',data[i]);

		var a1 = $('<a></a>').html('<h3>' + data[i].id + '</h3>');
		var a2 = $('<a href="#" id="#alias-delete"></a>');

		a2.click(function() {
		
			app.set_alias($(this).parent().data("osm-alias-data"));
			
			app.show_confirm_dialog($( '#application-content-popup-confirm-dialog' ), "Alias Action", "Are you sure you want to delete " + app.get_alias().id + "?", function(){
				
				$('#app-content-aliases').children().addClass('ui-disabled');
				
				$.mobile.loading('show', {
					text : 'Deleting ' + app.get_alias().id,
					textVisible : true,
					theme : 'b',
				});
				
				app.rest_delete('domains/' + app.get_domain() + '/applications/' + app.get_application().name + '/aliases/' + app.get_alias().id, event,
						function(data,text,xhr) {
							$.mobile.loading('hide');
							app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Alias Operation",app.get_alias().id + " Deleted Successfully");
							$('#app-content-aliases').children().removeClass('ui-disabled');
							get_alias_list(app.get_application());
						},
						function(jqxhr,errType,exception) {

							$.mobile.loading('hide');
							// Check to see if messages are returned from OpenShift
							if(jqxhr.status == "422") {
								var json = jQuery.parseJSON(jqxhr.responseText);
								var messages = "";
								
								$.each(json.messages, function(index,value) {
									if(messages != "") messages += "\n";
									messages += value.text;
								});
								
								app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Alias Operation Failed",messages);
							}
							else {
								app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Alias Operation Failure",app.get_alias().id + " Failed to be Deleted");
							}

							$('#app-content-aliases').children().removeClass('ui-disabled');				
						}
					);
			
			});
		});
		
		li.append(a1);
		li.append(a2);
		ul.append(li);
	}
	ul.listview('refresh');
}

$(document).bind('osm-new-app-content-aliases',function() {
	$.mobile.changePage('#new-alias-page',{transition:'pop'});
});

$(document).bind('osm-new-app-content-cartridges',function() {
	$.mobile.changePage('#new-embedded-cartridge-page',{transition:'pop'});
});


$('#app-content-add').click(function() {
	$(document).trigger("osm-new-" + $(this).data('app-content-trigger'));
});

$(document).bind('osm-rebuild-application-aliases',function() {
	get_alias_list(app.get_application());
});

$(document).bind('osm-rebuild-application-cartridges',function() {
	get_cartridge_list(app.get_application());
});


//Cartridge Operation Functions
$('#cartridge-start').click(function() {
	process_cartridge_action('start', 'Starting', 'Started');
});

$('#cartridge-stop').click(function() {
	process_cartridge_action('stop', 'Stopping', 'Stopped');
});

$('#cartridge-reload').click(function() {
	process_cartridge_action('reload', 'Reloading', 'Reloaded');
});

$('#cartridge-restart').click(function() {
	process_cartridge_action('restart', 'Restarting', 'Restarted');
});

$('#cartridge-delete').click(function() {
	
	$("#cartridge-popupMenu" ).popup( "close" );
	
	// Timeout needed to handle chaining of popups
	setTimeout( function(){

			app.show_confirm_dialog($( '#application-content-popup-confirm-dialog' ), "Cartridge Action", "Are you sure you want to delete " + app.get_cartridge().name + "?", function(){
				
				$('#app-cartridge-list').children().addClass('ui-disabled');
				
				$.mobile.loading('show', {
					text : 'Deleting ' + app.get_cartridge().name,
					textVisible : true,
					theme : 'b',
				});	
				
				app.rest_delete('domains/' + app.get_domain() + '/applications/' + app.get_application().name + '/cartridges/' + app.get_cartridge().name, event,
						function(data,text,xhr) {
							$.mobile.loading('hide');
							app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Cartridge Operation",app.get_cartridge().name + " Deleted Successfully");
							$('#app-cartridge-list').children().removeClass('ui-disabled');
							get_cartridge_list(app.get_application());
						},
						function(jqxhr,errType,exception) {

							$.mobile.loading('hide');
							// Check to see if messages are returned from OpenShift
							if(jqxhr.status == "422") {
								var json = jQuery.parseJSON(jqxhr.responseText);
								var messages = "";
								
								$.each(json.messages, function(index,value) {
									if(messages != "") messages += "\n";
									messages += value.text;
								});
								
								app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Cartridge Operation Failed",messages);
							}
							else {
								app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Cartridge Operation Failure",app.get_cartridge().name + " Failed to be Deleted");
							}

							$('#app-cartridge-list').children().removeClass('ui-disabled');				
						}
					);
				
			});
		}, 100 );
});



function process_cartridge_action(action,before_message,after_message) {
	
	$("#cartridge-popupMenu" ).popup( "close" );	
	$('#app-cartridge-list').children().addClass('ui-disabled');

	$.mobile.loading('show', {
		text : before_message + ' ' + app.get_cartridge().name,
		textVisible : true,
		theme : 'b',
	});	

	var event = 'event='+action;
	
	app.rest_post('domains/' + app.get_domain() + '/applications/' + app.get_application().name + '/cartridges/' + app.get_cartridge().name + '/events', event,
			function(data,text,xhr) {
				$.mobile.loading('hide');
				app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Cartridge Operation",app.get_cartridge().name + " " + after_message + " Successfully");
				$('#app-cartridge-list').children().removeClass('ui-disabled');
				get_cartridge_list(app.get_application());
			},
			function(jqxhr,errType,exception) {
				$.mobile.loading('hide');
				app.show_alert_dialog($("#application-content-popup-alert-dialog"),"Cartridge Operation Failure",app.get_cartridge().name + " Failed to be "+ after_message);
				$('#app-cartridge-list').children().removeClass('ui-disabled');
				
				// TODO: Should we do a refresh anyways just in case? 
			}
		);

};

