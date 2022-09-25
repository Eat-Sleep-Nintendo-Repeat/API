const MEMBER = require("../../../models/MEMBER");
var sanitize = require("mongo-sanitize");

const express = require("express");

const route = express.Router();

const crypto = require("crypto");
const base64url = require("base64url");
const request2 = require("request-promise-native");
const jar = request2.jar();
const request = request2.defaults({ jar: jar });
const axios = require("axios").default;
const schedule = require("node-schedule");
const { nanoid } = require("nanoid");

var codeChallenges = {};

let authParams = {};

// generate a random hash
function generateRandom(length) {
  return base64url(crypto.randomBytes(length));
}

// calculate a challange for the oauth flow
function calculateChallenge(codeVerifier) {
  const hash = crypto.createHash("sha256");
  hash.update(codeVerifier);
  const codeChallenge = base64url(hash.digest());
  return codeChallenge;
}

//generate params
function generateAuthenticationParams() {
  const state = generateRandom(36);
  const codeVerifier = generateRandom(32);
  const codeChallenge = calculateChallenge(codeVerifier);
  return {
    state,
    codeVerifier,
    codeChallenge,
  };
}

//parse params into url
function getNSOLogin(userid) {
  authParams = generateAuthenticationParams();
  const params = {
    state: authParams.state,
    redirect_uri: "npf71b963c1b7b6d119://auth&client_id=71b963c1b7b6d119",
    scope: "openid%20user%20user.birthday%20user.mii%20user.screenName",
    response_type: "session_token_code",
    session_token_code_challenge: authParams.codeChallenge,
    session_token_code_challenge_method: "S256",
    theme: "login_form",
  };

  const arrayParams = [];
  for (var key in params) {
    if (!params.hasOwnProperty(key)) continue;
    arrayParams.push(`${key}=${params[key]}`);
  }
  const stringParams = arrayParams.join("&");

  //save codechallenge to array
  codeChallenges[userid] = authParams.codeVerifier;

  return `https://accounts.nintendo.com/connect/1.0.0/authorize?${stringParams}`;
}

var userAgentVersion = "2.2.0";
var userAgentString = `com.nintendo.znca/${userAgentVersion} (Android/7.1.2)`;

//update useragent at start of api
fetchUserAgentVersion();

//update useragentversion once a day
schedule.scheduleJob("30 5 * * *", async () => {
  fetchUserAgentVersion();
});

async function fetchUserAgentVersion() {
  var resp = await request({
    method: "GET",
    uri: "https://raw.githubusercontent.com/samuelthomas2774/nintendo-app-versions/main/data/coral-nintendo-eu.json",
    json: true,
  });
  userAgentVersion = resp.versions[0].version;
  userAgentString = `com.nintendo.znca/${resp.versions[0].version} (Android/7.1.2)`;
}

async function getSessionToken(session_token_code, codeVerifier) {
  const resp = await request({
    method: "POST",
    uri: "https://accounts.nintendo.com/connect/1.0.0/api/session_token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Platform": "Android",
      "X-ProductVersion": userAgentVersion,
      "User-Agent": `OnlineLounge/${userAgentVersion} NASDKAPI Android`,
    },
    form: {
      client_id: "71b963c1b7b6d119",
      session_token_code: session_token_code,
      session_token_code_verifier: codeVerifier,
    },
    json: true,
  });
  return resp.session_token;
}

async function getApiToken(session_token) {
  const resp = await request({
    method: "POST",
    uri: "https://accounts.nintendo.com/connect/1.0.0/api/token",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": userAgentVersion,
      "User-Agent": userAgentString,
    },
    json: {
      client_id: "71b963c1b7b6d119",
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
      session_token: session_token,
    },
  });

  return {
    id: resp.id_token,
    access: resp.access_token,
  };
}

async function callFlapg(token, hash_method) {
  const response = await request({
    method: "POST",
    uri: "https://api.imink.app/f",
    headers: {
      "User-Agent": `Eat-Sleep-Nintendo-Repeat_API/1.0.0`, //your unique id here
      "Content-Type": "application/json; charset=utf-8",
    },
    form: {
      token: token,
      hashMethod: hash_method,
    },
  }).catch((err) => {
    console.log(err.response);
    return res.code(500).send({ error: true, message: "Somethong went wrong on our side. Please try again later or contact Dustin_DM" });
  });

  const responseObject = JSON.parse(response);
  return responseObject;
}

async function getUserInfo(token) {
  const response = await request({
    method: "GET",
    uri: "https://api.accounts.nintendo.com/2.0.0/users/me",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": userAgentVersion,
      "User-Agent": userAgentString,
      Authorization: `Bearer ${token}`,
    },
    json: true,
  });

  return {
    nickname: response.nickname,
    language: response.language,
    birthday: response.birthday,
    country: response.country,
  };
}

async function getApiLogin(userinfo, flapg_nso, apiAccessToken) {
  const resp = await request({
    method: "POST",
    uri: "https://api-lp1.znc.srv.nintendo.net/v2/Account/Login",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": userAgentVersion,
      "User-Agent": userAgentString,
      Authorization: "Bearer",
    },
    body: {
      parameter: {
        language: userinfo.language,
        naCountry: userinfo.country,
        naBirthday: userinfo.birthday,
        f: flapg_nso.f,
        naIdToken: apiAccessToken,
        timestamp: flapg_nso.timestamp,
        requestId: flapg_nso.request_id,
      },
    },
    json: true,
    gzip: true,
  });

  if (!resp.result) return;

  return {
    webapiserver_token: await resp.result.webApiServerCredential.accessToken,
    webapiuserdata: await resp.result.user,
  };
}

async function getWebServiceToken(token, flapg_app, game, apiAccessToken) {
  let parameterId;
  if (game == "S2") {
    parameterId = 5741031244955648; // SplatNet 2 ID
  } else if (game == "S3") {
    parameterId = 4834290508791808;
  } else if (game == "AC") {
    parameterId = 4953919198265344; // Animal Crossing ID
  }
  const resp = await request({
    method: "POST",
    uri: "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": userAgentVersion,
      "User-Agent": userAgentString,
      Authorization: `Bearer ${token}`,
    },
    json: {
      parameter: {
        id: parameterId,
        f: flapg_app.f,
        registrationToken: apiAccessToken,
        timestamp: flapg_app.timestamp,
        requestId: flapg_app.request_id,
      },
    },
  });

  return {
    accessToken: resp.result.accessToken,
    expiresAt: Math.round(new Date().getTime()) + resp.result.expiresIn,
  };
}

async function getWebServiceTokenWithSessionToken(sessionToken, game) {
  try {
    const apiTokens = await getApiToken(sessionToken); // I. Get API Token
    const userInfo = await getUserInfo(apiTokens.access); // II. Get userInfo

    const flapg_nso = await callFlapg(apiTokens.id, 1); // III. Get F flag [NSO]
    const apiAccessToken = await getApiLogin(userInfo, flapg_nso, apiTokens.id); // IV. Get API Access Token
    const flapg_app = await callFlapg(apiAccessToken.webapiserver_token, 2); // V. Get F flag [App]
    const web_service_token = await getWebServiceToken(apiAccessToken.webapiserver_token, flapg_app, game, apiTokens.id); // VI. Get Web Service Token
    return {
      token: web_service_token,
      accountdata: apiAccessToken.webapiuserdata,
      userdata: userInfo,
    };
  } catch {
    return;
  }
}

const splatNet2Url = "https://app.splatoon2.nintendo.net";
const splatNet3Url = "https://api.lp1.av5ja.srv.nintendo.net";

async function getSessionCookieForSplatNet(accessToken) {
  const resp = await axios.get(splatNet2Url, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": userAgentVersion,
      "User-Agent": userAgentString,
      "x-gamewebtoken": accessToken,
      "x-isappanalyticsoptedin": false,
      "X-Requested-With": "com.nintendo.znca",
      Connection: "keep-alive",
    },
  });

  var iksm_session = resp.headers["set-cookie"][0].split(";")[0].replace("iksm_session=", "");

  return iksm_session;
}

async function getSessionTokenForSplatNet3(accessToken, na_country) {
  var VersionRes = await request.get("https://raw.githubusercontent.com/samuelthomas2774/nintendo-app-versions/main/data/splatnet3-app.json", { json: true });

  const resp = await axios.post(
    splatNet3Url + "/api/bullet_tokens",
    {},
    {
      headers: {
        "Content-Type": "application/json",
        "X-Web-View-Ver": VersionRes.version,
        "X-NACOUNTRY": na_country,
        "Accept-Language": "en-GB",
        "X-GameWebToken": accessToken,
      },
    }
  );

  if (resp.status === 204) return null;

  return resp.data.bulletToken;
}

var queue = [];
async function refreshTokenForSplatNet3(session_token) {
  var id = nanoid(64);
  queue.push(id);

  return new Promise(async (resolve, reject) => {
    async function checkPlace() {
      try {
        if (queue[0] === id) {
          var web_service_token = await getWebServiceTokenWithSessionToken(session_token, (game = "S3"));
          var bullet_token = await getSessionTokenForSplatNet3(web_service_token.token.accessToken, web_service_token.userdata.country);
          queue.shift();
          resolve({ token: bullet_token, country: web_service_token.userdata.country });
        } else {
          setTimeout(async () => {
            await checkPlace();
          }, 1000);
        }
      } catch {
        reject();
      }
    }
    await checkPlace();
  });
}

//create oauth url and send it to member
route.get("/surl", (req, res, next) => {
  res.json({ surl: getNSOLogin(req.user.id) });
});

route.post("/linkaccount", async (req, res, next) => {
  try {
    var redirectURL = req.body.rink;

    //extract session_state, session_token_code and state from rink
    const params = {};
    redirectURL
      .split("#")[1]
      .split("&")
      .forEach((str) => {
        const splitStr = str.split("=");
        params[splitStr[0]] = splitStr[1];
      });

    if (!codeChallenges[req.user.id]) return res.status(400).json({ message: "Please start the process again" });

    //exchange session_token_code for session_token
    params.session_token = await getSessionToken(params.session_token_code, codeChallenges[req.user.id]);

    var WebService = await getWebServiceTokenWithSessionToken(params.session_token, (game = "S3"));
    params.web_service_token = WebService.token.accessToken;

    var bullet_token = await getSessionTokenForSplatNet3(params.web_service_token, WebService.userdata.country);

    await MEMBER.findOneAndUpdate({ id: sanitize(req.user.id) }, { "nintendo_account.session_token": params.session_token, "nintendo_account.bulletToken": { token: bullet_token, region: WebService.userdata.country } }).then(async (doc) => {
      res.json({
        success: true,
        nintendo_account: WebService.accountdata,
        requested_update: req.user.id,
        updated: doc.id,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: "Something went wrong. If you did not pasted the r-link wrong than the error is on our side. Feel free to try again",
    });
  }
});

exports.route = route;
exports.userAgent = {
  userAgentString,
  userAgentVersion,
};
exports.functions = {
  refreshTokenForSplatNet3,
};
