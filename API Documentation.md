<div align="center">
<img src="https://media.discordapp.net/attachments/644283425389412357/911659298650734642/Eat_Sleep_Nintendo_Repeat.png" alt="ESNR-API-Header">
</div>
<br>
<br>
<br>

## Table of Contents
* The Basics
	* [basis URL](#basicurl)
* Authentication
	* [API Keys](#apikeys)
	* [Use of API keys](#useapikeys)
	* [CORS](#CORS)
* Formats
	* [Supported Formats](#formats)
* Methods
	* [Users](#users)
	* [Coins](#coins)
	* [Warns](#warns)

## The Basics
### <a name="basicurl"></a> basis URL
This is the URI where the API is currently reachable:
### `https://eat-sleep-nintendo-repeat.eu/api/`
<br>

## Authentication
### <a name="apikeys"></a> API Keys
The Eat, Sleep, Nintendo, Repeat API is using API Keys to Authenticate requests. You can manage your API Keys in the [Usersettings Menu](https://eat-sleep-nintendo-repeat.eu/usersettings).
![](https://i.ibb.co/Hn8DFs5/Screenshot-2021-08-29-231206.png)

 <span style="color:red">**You must make sure that your API key never gets out to the public. It should be treated as a secret. If foreign programmers get your API key, they can act on your behalf.**</span>
 <br>
 <br>

### <a name="useapikeys"></a> Use of API Keys
To Authorize your request to the API, add a "Authentication" Header to the Request. In the example of CURL this would look like this:
```
curl https://eat-sleep-nintendo-repeat.eu/api/exapleroute \
     -H "Authentication: Token <your api key>"
```

### <a name="CORS"></a> CORS - Cross-Origin Resource Sharing
The API usually responds without a CORS header. However, it is possible to enable CORS headers for individual API keys. [In this case contact an admin of our Discord to get a CORS API key.](mailto:public@dustin-dm.de?subject=cross-origin%20resource%20sharing%20api%20key)

Once you have a CORS API key you can manage its CORS header in your usersettings. Note, however, that you cannot use wildcards such as "*".

![UI Tokens Panel Screenshot](https://i.ibb.co/2v6pFM5/Unbenannt.png)
<br>
<br>

### Formats for requests and responses
#### <a name="formats"></a> Supported Formats
In general, the Eat, Sleep, Nintendo, Repeat API supports only JSON as request body and returns responses only in JSON format.
Therefore, it is not necessary to specify the format.
<br>
<br>
<br>

# Methoden


# <a name="users"></a>GET /users/@me
returns user that belongs to Authentication token
### CURL example
```
curl https://eat-sleep-nintendo-repeat.eu/api/users/@me \
     -H "Authentication: Token <your API Key>" \

```

### Response
```json
{
    "id": "000000000000000000",
    "username": "Max",
    "discriminator": "0000",
    "avatar": "7eff755160b85f4bfb83c4fed8902530",
    "type": 1,
    "serverbooster": false,
    "isuser": false
}
```

# GET /users/:DiscordUserId
returns informations of a discord user

### CURL example
```
curl https://eat-sleep-nintendo-repeat.eu/api/users/330380702505762817 \
     -H "Authentication: Token <your API Key>"

```

### Response
```json
{
    "id": "330380702505762817",
    "username": "Dustin_DM",
    "discriminator": "0254",
    "avatar": "7eff755160b75f4bfb83c4fed8902530",
    "type": 99,
    "typeword": "Admin",
    "serverbooster": true,
    "currencys": {
        "ranks": {
            "rank": 135,
            "xp": 230
        },
        "coins": {
            "amount": 64881,
            "log": [{
                "description": "Disboard Bump",
                "value": 300,
                "date": "2021-08-27T20:13:02.376Z"
            }, {
                "description": "daily coins",
                "value": 150,
                "date": "2021-08-27T20:12:58.105Z"
            }, {
                "description": "Kauf von Farbe - Grün",
                "value": -650,
                "date": "2021-08-26T18:29:27.072Z"
            }]
        }
    },
    "delete_in": null,
    "joined": "2021-08-29T20:02:53.826Z"
}
```

# GET /users
returns infotmations about several users

### Data to be passed
| Query | Details                                     |
|-------|---------------------------------------------|
| id (!)| Multiple Discord User IDs split by comma    |

### CURL example
```
curl https://eat-sleep-nintendo-repeat.eu/api/users?id=330380702505762817,874605952865820733,500658624109084682 \
     -H "Authentication: Token <your API Key>"

```

### Response
```json
[{
    "id": "330380702505762817",
    "username": "Dustin_DM",
    "discriminator": "0254",
    "avatar": "7eff755160b75f4bfb83c4fed8902530",
    "type": 99,
    "typeword": "Admin",
    "serverbooster": true
}, {
    "id": "500658624109084682",
    "username": "Emoji.gg",
    "discriminator": "7083",
    "avatar": "ba681df494b10a6fee894562aac5199b",
    "type": 50,
    "typeword": "Bot",
    "serverbooster": false
}, {
    "id": "874605952865820733",
    "username": "Eat, Sleep, Bot v3",
    "discriminator": "9328",
    "avatar": "52b450647dc7eef0a99d70a631078fd9",
    "type": 50,
    "typeword": "Bot",
    "serverbooster": false
}]
```

# GET /users/toplist
returns a list of users which are sorted according to the ranking list

### Data to be passed
| Query | Details                                     |
|-------|---------------------------------------------|
| max   | Number of users to be listed (default is 10)|

### CURL example
```
curl https://eat-sleep-nintendo-repeat.eu/api/users/toplist?max=3 \
     -H "Authentication: Token <your API Key>"

```

### Response
```json
[{
    "id": "330380702505762817",
    "username": "Dustin_DM",
    "discriminator": "0254",
    "avatar": "7eff755160b75f4bfb83c4fed8902530",
    "type": 99,
    "typeword": "Admin",
    "serverbooster": true,
    "rank": 136
}, {
    "id": "419227063652974592",
    "username": "Vlasdor",
    "discriminator": "3248",
    "avatar": "0422c0836ecc046a98a3a167bf106496",
    "type": 99,
    "typeword": "Admin",
    "serverbooster": true,
    "rank": 122
}, {
    "id": "647816221164699658",
    "username": "lol_lul_",
    "discriminator": "2076",
    "avatar": "43b3f548e7af16baa7b6e40829124787",
    "type": 1,
    "typeword": "Member",
    "serverbooster": true,
    "rank": 111
}]
```

# <a name="coins"></a> GET /coins/:DiscordUserId
returns informations about the coins state of a user

### Authorization notes
<p style="color:yellow"> No permissions are required to query your own coins. For querying the coins of other users, a permission value of 50 or higher is required! <p>

### CURL example
```
curl https://eat-sleep-nintendo-repeat.eu/api/coins/330380702505762817 \
     -H "Authentication: Token <your API Key>"

```

### Response
```json
{
    "user": {
        "id": "330380702505762817",
        "discriminator": "0254",
        "username": "Dustin_DM",
        "avatar": "7eff755160b75f4bfb83c4fed8902530",
        "type": 99,
        "typeword": "Admin",
        "booster": true
    },
    "coindata": {
        "amount": 65630,
        "log": [{
            "description": "daily coins",
            "value": 150,
            "date": "2021-03-11T21:17:41.551Z"
        }],
        "last_daily": "2021-09-02T19:43:52.586Z",
        "purchases": [{
            "date": "2021-06-07T16:39:34.020Z",
            "active": true,
            "_id": "60be4bc6aa9493293441a466",
            "id": 5
        }
    ]}
}
```

# PUT /coins/:DiscordUserId
Transfers coins to a different user

### Authorization notes
<p style="color:yellow">No permissions are required to transfer your own coins to an other user. To transfer the coins of other users, a permission value of 50 or higher is required!</p>

### Data to be passed
| json body            | Details |
|----------------------|---------|
| receiver (String)(!) | The ID of a Discord user who should receive the coins |
| amount (Intiger)(!)  | The number of coins to be transferred |

### CURL example
```
curl -X PUT https://eat-sleep-nintendo-repeat.eu/api/coins/330380702505762817 \
     -H "Authentication: Token <your API Key>" \
     -d "{\"receiver\": \"874605952865820733\", \"amount\": 1}"

```

### Response
```json
```

# POST /coins/:DiscordUserId/daily
Redeems the daily reward

### Authorization notes
<p style="color:yellow">No permissions are required to redeem your own reward. For redeeming the reward of other users a permission value of 50 or higher is required.</p>

### CURL example
```
curl -X PUT https://eat-sleep-nintendo-repeat.eu/api/coins/330380702505762817/daily \
     -H "Authentication: Token <your API Key>"

```

### Response
```json
```

# <a name="warns"></a> GET /warns
returns all warnings or filters all warnings by user id

### Data to be passed
| Query | Details |
|-------|---------|
| id    | The ID of the Discord user to be sorted by |

### CURL example
```
curl https://eat-sleep-nintendo-repeat.eu/api/warns?id=363351055599140864 \
     -H "Authentication: Token <your API Key>"

```

### Response
```json
[{
    "victim": ["363351055599140864"],
    "date": "2021-05-08T15:15:28.257Z",
    "_id": "6097f26c63dc04cf7c2b728b",
    "executor": "330380702505762817",
    "type": 2,
    "deleted_in": "2021-08-09T14:32:12.351Z",
    "reason": "Werbung für Troll Server im state",
    "proof": {
        "type": "img",
        "source": "https://media.discordapp.net/attachments/585860176024698890/840959334786531358/unknown.png"
    },
    "__v": 0
}]
```