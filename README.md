# Setup

Create a settings.json file in the root plugin directory with the following structure:

```
{
	"apiKey" : "LCTV_KEY_PARAM",
	"streamerUsername" : "LCTV_USER_NAME",
	"fetchIntervalMinutes" : 5,
	"followerStatus" : "follower"
}
```

You can get your apiKey from the RSS followers page. Click the RSS icon beside "Followers" on this page:

[https://www.livecoding.tv/LCTV_USERNAME/settings/followers/](https://www.livecoding.tv/LCTV_USERNAME/settings/followers/)

## Updating Users's Status

When a user follows the stream, the plugin will set the user's status (in the 'users' brain) to whatever is set in the plugin's setting: 'followerStatus' field. If the field value for the status is not an available status, no status will be set on the user.
