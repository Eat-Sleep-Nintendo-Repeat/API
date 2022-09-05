const MEMBER = require("../../../models/MEMBER");
var sanitize = require("mongo-sanitize");

const express = require("express");

const route = express.Router();

const crypto = require("crypto");
const base64url = require("base64url");
const request2 = require("request-promise-native");
const jar = request2.jar();
const request = request2.defaults({ jar: jar });
const { v4: uuidv4 } = require("uuid");
const { gzip } = require("zlib");
const { resolveAny } = require("dns");

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

//exchnage code to token
const userAgentVersion = `2.2.0`; // version of Nintendo Switch App, updated once or twice per year
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

const userAgentString = `com.nintendo.znca/${userAgentVersion} (Android/7.1.2)`;

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
  return {
    webapiserver_token: await resp.result.webApiServerCredential.accessToken,
    webapiuserdata: await resp.result.user,
  };
}

async function getWebServiceToken(token, flapg_app, game, apiAccessToken) {
  let parameterId;
  if (game == "S2") {
    parameterId = 5741031244955648; // SplatNet 2 ID
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
  const apiTokens = await getApiToken(sessionToken); // I. Get API Token
  const userInfo = await getUserInfo(apiTokens.access); // II. Get userInfo

  const flapg_nso = await callFlapg(apiTokens.id, 1); // III. Get F flag [NSO]
  const apiAccessToken = await getApiLogin(userInfo, flapg_nso, apiTokens.id); // IV. Get API Access Token
  const flapg_app = await callFlapg(apiAccessToken.webapiserver_token, 2); // V. Get F flag [App]
  const web_service_token = await getWebServiceToken(apiAccessToken.webapiserver_token, flapg_app, game, apiTokens.id); // VI. Get Web Service Token
  return {
    token: web_service_token,
    accountdata: apiAccessToken.webapiuserdata,
  };
}

const splatNetUrl = "https://app.splatoon2.nintendo.net";

async function getSessionCookieForSplatNet(accessToken) {
  const resp = await request({
    method: "GET",
    uri: splatNetUrl,
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

  const iksmToken = getIksmToken();
}

function getCookie(key, url) {
  const cookies = jar.getCookies(url);
  let value;
  cookies.find((cookie) => {
    if (cookie.key === key) {
      value = cookie.value;
    }
    return cookie.key === key;
  });
  return value;
}

function getIksmToken() {
  iksm_session = getCookie("iksm_session", splatNetUrl);
  if (iksm_session == null) {
    throw new Error("Could not get iksm_session cookie");
  }
  return iksm_session;
}

//create oauth url and send it to member
route.get("/surl", (req, res, next) => {
  res.json({ surl: getNSOLogin(req.user.id) });
});

route.post("/linkaccount", async (req, res, next) => {
  try {
    console.log(req.user.id);
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

    // console.log(params);
    // console.log(codeChallenges[req.user.id]);

    if (!codeChallenges[req.user.id]) return res.status(400).json({ message: "Please start the process again" });

    //exchange session_token_code for session_token
    params.session_token = await getSessionToken(params.session_token_code, codeChallenges[req.user.id]);

    var WebService = await getWebServiceTokenWithSessionToken(params.session_token, (game = "S2"));
    params.web_service_token = WebService.token;

    await getSessionCookieForSplatNet(params.web_service_token.accessToken);
    const iksmToken = getIksmToken();

    await MEMBER.findOneAndUpdate({ id: sanitize(req.user.id) }, { nintendo_account: { session_token: params.session_token, iksm_token: "not refreshed yet" } }).then(async (doc) => {
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
  getWebServiceTokenWithSessionToken,
  getIksmToken,
  getSessionCookieForSplatNet,
};

//TODO
// catch all erroes that could occour
//make route only accessible for user tokens
//make in belong of header
