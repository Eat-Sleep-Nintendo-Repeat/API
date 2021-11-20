<div align="center">
<img src="https://media.discordapp.net/attachments/644283425389412357/911697425939456020/Eat_Sleep_Nintendo_Repeat_1.png" alt="ESNR-Socket-Header">
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
* Event Groups
    * [What are Event Groups](#eventgroups)
    * [Available Event Groups](#eventgrouplist)

## The Basics
### <a name="softwareused"></a> Used Software
The Socket is build with [socket.io](https://github.com/socketio/socket.io). You can choose a socket.io client that best suits you and your programming language to connect to socket.io server from Eat, Sleep, Nintendo, Repeat
<br>

### <a name="basicurl"></a> basis URL
This is the URI where out socket.io server is currently reachable:
### `https://eat-sleep-nintendo-repeat.eu/api/socketio`
<br>

## Authentication
### <a name="apikeys"></a> API Keys
The Socket.io Server of Eat, Sleep, Nintendo, Repeat is using API Keys to Authenticate connections. You can manage your API Keys in the [Usersettings Menu](https://eat-sleep-nintendo-repeat.eu/usersettings).
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
The Socket.io Server usually is not allowing connections to clients with a different origin then our server. However, it is possible to establish a connection with a client from a different origin for individual API keys. [In this case contact an admin of our Discord to get a CORS API key.](mailto:public@dustin-dm.de?subject=cross-origin%20resource%20sharing%20api%20key)

Once you have a CORS API key you can manage its CORS header in your usersettings. Note, however, that you cannot use wildcards such as "*".

![UI Tokens Panel Screenshot](https://i.ibb.co/2v6pFM5/Unbenannt.png)

<br>
<br>
<br>

# Event Groups
## <a name="eventgroups"></a> About Event Groups
Event groups are accessible rooms where you can get live updates on specific topics. For example, when a user has a new rank or when the status of a tournament changes. This way you and your service can react to certain things immediately when something changes at Eat, Sleep, Nintendo, Repeat.

## How to join a Event Group?
After you connected to the socket.io server. You just emit a "join" Event and add the Event Group you want to join as a String in the body. Based on the client you are using it can look like this:

```
socket.on("connect", () => {
    socket.emit("join", {EventGroup: "system"})
})
```
You will not get a response from the Server that tells you if it worked or not.

## How to leave a Event Group?
Just emit a "leave" Event and add the Event Group you want to leave as a String in the body. Based on the client you are using it can look like this:

```
    socket.emit("leave", {EventGroup: "system"})
```
You will not get a response from the Server that tells you if it worked or not.

<br>
<br>

# <a name="eventgrouplist"></a> List of Event Groups:
