# Setup

Create a settings.json file in the root plugin directory with the following structure:

```
{
	"apiKey" : "LCTV_KEY_PARAM",
	"streamerUsername" : "LCTV_USER_NAME",
	"fetchIntervalMinutes" : 5,
	"followerStatus" : "follower",
    "styles" : {
        "font" : "color: #FFF; font-family: Arial; font-size: 2em; text-transform: uppercase; text-shadow: 0 2px 0 rgb(0, 50, 100);",
        "followerFont" : "font-size: 3em; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
        "container" : "width: 400px;  padding: 2em; text-align: center; margin: 1em; border: 1px solid #0070E8; background: -webkit-linear-gradient(top, #87e0fd 0%,#53cbf1 40%,#05abe0 100%);"
    }
}
```

You can get your apiKey from the RSS followers page. Click the RSS icon beside "Followers" on this page:

[https://www.livecoding.tv/LCTV_USERNAME/settings/followers/](https://www.livecoding.tv/LCTV_USERNAME/settings/followers/)

You can change the styles of the fly out, by editing the `styles` object in the `settings.json` file.

## Updating Users's Status

When a user follows the stream, the plugin will set the user's status (in the 'users' brain) to whatever is set in the plugin's setting: 'followerStatus' field. If the field value for the status is not an available status, no status will be set on the user.
