module.exports = {
	name: 'followerNotifications',
	dependencies: [{
		name: 'jquery'
	}, {
		name: 'velocity',
		url: '//cdn.jsdelivr.net/velocity/1.2.3/velocity.min.js'
	}],
	html: '<div id="new-follower" style="background: red; color: #FFF; bottom: -100%; top: auto; position: absolute; width: 400px; text-align: center; font-family: Arial; padding: 2em; font-size: 4em; text-transform: uppercase;"></div>',
	func: function( socket, username ) {
		registerSocketMessage( 'follower-notifications-newFollower', function( messageObj ) {
			if ( messageObj.message === 'follower-notifications-newFollower' ) {
				var followers = messageObj.usernames;
                showNewFollowerNotification( followers );
			}
		} );

        function showNewFollowerNotification( followers ) {
            if ( followers.length > 0 ) {
                var follower = followers[0];
                var $div = $('#new-follower');
                $div.html( '<span>New follower</span><br><br>' + follower );
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
