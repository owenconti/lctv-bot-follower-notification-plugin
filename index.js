'use strict';

const request = require('request');
const parseString = require('xml2js').parseString;
const runtime = require('../../utils/Runtime');
const Templater = require('../../utils/Templater');
const Log = require('../../utils/Log');
const websocket = require('../../utils/websocket');
const settings = require('./settings.json');
const brainKey = 'plugin-follower-notification';

module.exports = [{
	types: ['startup'],
	action: function( chat ) {
		const fetchIntervalMinutes = 1;
		setInterval( function() {
			fetchFollowers( chat );
		}, 10000);
	}
}];

/**
 * Fetch the followers from LCTV site
 * @param  {Client} chat
 * @return {void}
 */
function fetchFollowers( chat ) {
	let url = Templater.run( "https://www.livecoding.tv/rss/{{username}}/followers/?key={{key}}", {
		username: settings.streamerUsername,
		key: settings.apiKey
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
