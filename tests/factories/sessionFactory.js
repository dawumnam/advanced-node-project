const Keygrip = require("keygrip");
const Buffer = require("safe-buffer").Buffer;
const keys = require("../../config/keys");
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");
  sessionsig = keygrip.sign("session=" + session);
  return { session, sessionsig };
};
