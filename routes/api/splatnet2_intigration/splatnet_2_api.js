const axios = require("axios").default;
const MEMBER = require("../../../models/MEMBER");
const { userAgent, functions } = require("../nintendo_intigration/linkaccount");

var baseUrl = "https://app.splatoon2.nintendo.net/api";

const instance = axios.create({
  baseURL: baseUrl,
});

//add auth header to all request
instance.interceptors.request.use(
  async (config) => {
    config.headers["user-agent"] = `${userAgent.userAgentString}`;

    if (!config.user) return config;
    if (!config.member) {
      var member = await MEMBER.findOne({ id: config.user });
      if (!member) return config;
      if (!member.nintendo_account.iksm_token) return config;
      config.member = member;
    }
    var cookie = config.member.nintendo_account.iksm_token;
    if (cookie) {
      config.headers["cookie"] = `iksm_session=${cookie}`;
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

    if (err.response.status === 403 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        var Webservice = await functions.getWebServiceTokenWithSessionToken(originalConfig.member.nintendo_account.session_token, (game = "S2"));
        await functions.getSessionCookieForSplatNet(Webservice.token.accessToken);
        var iksm_session = functions.getIksmToken();

        originalConfig.headers["cookie"] = `iksm_session=${iksm_session}`;

        //write to database
        await MEMBER.findOneAndUpdate({ id: originalConfig.user }, { "nintendo_account.iksm_token": iksm_session });

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
