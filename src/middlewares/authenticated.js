const jwt = require("../utils/jwt");

const ensureAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(403)
      .send({ msg: "La petición no tiene la cabecera de autentificación" });
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.decoded(token);
    const { expiration_date } = payload;
    const currentTime = Date.now();

    if (expiration_date <= currentTime) {
      return res.status(400).send({ msg: "El token ha expirado" });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(400).send({ msg: "El token no es válido" });
  }
};

module.exports = {
    ensureAuth,
};
