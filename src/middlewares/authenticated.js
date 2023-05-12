const jwt = require("../utils/jwt")

const asureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ msg: "No tienes autenticación" })
    }

    const token = req.headers.authorization.replace("Bearer ", "")

    try {
        const payload = jwt.decoded(token)
        const { exp } = payload
        /* Verificar nombre currentDate o currentData */
        const currentData = new Date().getTime()
        
        if(exp <= currentData){
            return res.status(401).send({ msg: "El token ha expirado" })
        }

        req.user = payload
        next()
    } catch (error) {
        return res.status(401).send({ msg: "Token no válido" })
    }
}

module.exports = { asureAuth }