const axios = require("axios").default;
const MEMBER = require("../../../models/MEMBER");
const { userAgent, functions } = require("../nintendo_intigration/linkaccount");

var baseUrl = "https://api.lp1.av5ja.srv.nintendo.net/api/graphql";

const instance = axios.create({
  baseURL: baseUrl,
});

var cache = null;
async function cachesplatnetuseragent() {
  if (cache) {
    return cache;
  } else {
    var VersionRes = await axios.get("https://raw.githubusercontent.com/samuelthomas2774/nintendo-app-versions/main/data/splatnet3-app.json", { json: true });
    cache = VersionRes.data.version;
    setTimeout(() => {
      cache = null;
    }, 3600000);
    return cache;
  }
}

//add auth header to all request
instance.interceptors.request.use(
  async (config) => {
    config.headers["user-agent"] = `${userAgent.userAgentString}`;
    config.headers["Accept-Language"] = "en-GB";
    config.headers["X-Web-View-Ver"] = await cachesplatnetuseragent();
    config.headers["Content-Type"] = "application/json";

    if (!config.headers.user) return config;
    if (!config.member) {
      var member = await MEMBER.findOne({ id: config.headers.user });
      if (!member) return config;
      if (!member.nintendo_account.bulletToken) return config;
      config.member = member;
    }
    var token = config.member.nintendo_account.bulletToken;
    if (token) {
      config.headers["authorization"] = `Bearer ${token.token}`;
    }
    return config;
  },
  (error) => {
    return error;
  }
);

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        var web_service_token = await functions.getWebServiceTokenWithSessionToken(originalConfig.member.nintendo_account.session_token, (game = "S3"));
        var bulletToken = await functions.getSessionTokenForSplatNet3(web_service_token.token.accessToken, web_service_token.userdata.country);
        console.log(bulletToken)
        console.log(web_service_token.userdata.country)

        originalConfig.headers["authorization"] = `Bearer ${bulletToken}`;

        //write to database
        await MEMBER.findOneAndUpdate(
          { id: 
            originalConfig.headers.user },
          {
            "nintendo_account.bulletToken.token": bulletToken,
            "nintendo_account.bulletToken.region": web_service_token.userdata.country,
          }
        )
        
        var secondtry = await axios(originalConfig);

        return secondtry;
      } catch (_error) {
        console.log(_error);
        return _error;
      }
    }
    return err;
  }
);

exports.axios = instance;
exports.baseUrl = baseUrl;
