module.exports = {
	name: 'followerNotifications',
	dependencies: [{
		name: 'jquery'
	}, {
		name: 'velocity',
		url: '//cdn.jsdelivr.net/velocity/1.2.3/velocity.min.js'
	}],
    pluginSettings: require('./settings.json'),
	html: '<div id="new-follower" style="bottom: -100%; top: auto; position: absolute;"></div>',
	func: function( socket, username, pluginSettings ) {
		registerSocketMessage( 'follower-notifications-newFollower', function( messageObj ) {
			if ( messageObj.message === 'follower-notifications-newFollower' ) {
				var followers = messageObj.usernames;
                showNewFollowerNotification( followers );
			}
		} );

        function showNewFollowerNotification( followers  ) {
            if ( followers.length > 0 ) {
                var follower = followers[0];
                var $div = $('#new-follower');
                $div.empty();

                // Apply container styles from settings.json
                var existingStyles = $div.attr('style');
                $div.attr('style', existingStyles + ' ' + pluginSettings.styles.container);

                // new follower text
                var newFollowerText = $('<span>', {
                    style: pluginSettings.styles.font
                }).text( 'New follower' );

                // Follower name
                var follower = $('<span>', {
                    style: pluginSettings.styles.font + ' ' + pluginSettings.styles.followerFont
                }).text( follower );

                // Build the div with the follower text
                $div.append( newFollowerText )
                    .append( '<br /><br />' )
                    .append( follower );

                $div.velocity( {
                    bottom: '0'
                } );
                $div.velocity( {
                    bottom: '-100%'
                }, {
                    delay: 5000,
                    complete: function() {
                        followers.shift();
                        showNewFollowerNotification( followers );
                    }
                } );
            }
        }
	}
};
