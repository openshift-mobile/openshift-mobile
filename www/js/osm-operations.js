
/**
 * Performs the login call
 *
 * @param app OSM_Applicaiton object to use
 * @param callback Callback to handle the successful login
 * @param errback Callback to handle the unsuccessful login
 * @param precall Function to call before network is used
 *
 * @author Joey Yore
 * @version 1.0
 */
function login(app,callback,errback,precall) {
	//Show a loading spinner
	$.mobile.loading('show', {
		text : 'Logging In...',
		textVisible : true,
		theme : 'b',
	});

	//Update everything based on stored settings
	var settings = app.settings.load();
	app.rest.set_credentials(settings.username,settings.password);
	app.rest.set_api_version(settings.api);
	app.rest.GET('domains',callback,errback,precall);
}

/**
 * Logout of the application and return to a page
 *
 * @param app The OSM_Application object to use
 * @param page The page id to transition to (defaults to '#login-page')
 *
 * @author Joey Yore
 * @version 1.0
 */
function logout(app,page) {

	app.settings.save({
		'password' : '',
		'autolog' : false
	});
	$.mobile.changePage(page || '#login-page',{
		transition:DEFAULT_TRANSITION
	});
}



