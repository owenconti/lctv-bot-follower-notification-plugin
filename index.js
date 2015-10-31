'use strict';

// node modules
const request = require('request');
const parseString = require('xml2js').parseString;

// bot classes
const runtime = require('../../utils/Runtime');
const Templater = require('../../utils/Templater');
const Log = require('../../utils/Log');
const websocket = require('../../utils/websocket');
const Client = require('../../utils/Client');
const Settings = require('../../utils/Settings');

// constants
const availableStatuses = Settings.getSetting( 'user-status', 'statuses' );
const pluginSettings = require('./settings.json');
const brainKey = 'plugin-follower-notification';

module.exports = [{
	types: ['startup'],
	action: function( chat ) {
		const fetchIntervalMinutes = pluginSettings.fetchIntervalMinutes;
		setInterval( function() {
			fetchFollowers( chat );
		}, 60000 * fetchIntervalMinutes);
	}
}];

/**
 * Fetch the followers from LCTV site
 * @param  {Client} chat
 * @return {void}
 */
function fetchFollowers( chat ) {
	let url = Templater.run( "https://www.livecoding.tv/rss/{{username}}/followers/?key={{key}}", {
		username: pluginSettings.streamerUsername,
		key: pluginSettings.apiKey
	} );

	Log.log( '[follower-notification] Fetching followers list' );

	request( url, ( err, response, body ) => {
		if ( err ) {
			console.error( err );
			return;
		}

		parseFollowerXml( body, ( followers ) => {
			saveFollowersToBrain( followers, chat );
		} );
	} );
}

/**
 * Determines how many new followers we have.
 * Saves the followers to the brain.
 * Tells the websocket connection we have new followers.
 * @param  {array} followers
 * @param  {Client} chat
 * @return {void}
 */
function saveFollowersToBrain( followers, chat ) {
	// Find new followers that don't exist in the brain yet
	let existingFollowers = runtime.brain.get( brainKey ) || [];
	let newFollowers = followers.filter( (follower) => {
		if ( existingFollowers.indexOf( follower.title[0] ) === -1 ) {
			return true;
		}
	}).map( ( follower ) => {
		return follower.title[0];
	});

	Log.log( '[follower-notification] Existing followers: ' + existingFollowers.length );
	Log.log( '[follower-notification] New followers: ' + newFollowers.length );

	// Set new followers' statuses
	updateNewFollowersStatus( newFollowers, chat );

	// Save the followers
	existingFollowers = existingFollowers.concat( newFollowers );
	runtime.brain.set( brainKey, existingFollowers );

	// Tell the websocket connection we have new followers
	if ( newFollowers.length > 0 ) {
		websocket.sendMessage( chat.credentials.room, {
			message: 'newFollower',
			usernames: newFollowers
		});
	}
}

/**
 * Loops the new followers, and sets their
 * status to 'follower'.
 * @param  {[type]} newFollowers [description]
 * @param  {[type]} chat         [description]
 * @return {[type]}              [description]
 */
function updateNewFollowersStatus( newFollowers ) {
	const followerStatus = pluginSettings.followerStatus;
	if ( !availableStatuses[ followerStatus ] ) {
		Log.log(`[follower-notification] The specified followerStatus: ${followerStatus} is not an available status.`);
		return;
	}

	newFollowers.forEach( ( username ) => {
		let user = Client.getUser( username );
		let isUserAFollower = user.hasStatus( followerStatus );

		// Set the status
		if ( !isUserAFollower ) {
			user.status = followerStatus;
			user.saveToBrain();
		}
	} );
}

/**
 * Parse the XML data
 * @param  {string}   xml
 * @param  {Function} callback
 * @return {void}
 */
function parseFollowerXml( xml, callback ) {
	parseString( xml, ( err, result ) => {
		if ( err ) {
			console.error( err );
			return;
		}

		let followers = result.rss.channel[0].item;
		callback( followers );
	} );
}
