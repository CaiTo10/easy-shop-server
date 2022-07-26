// middle use to verify user login
const { expressjwt: jwt } = require("express-jwt");

const secret = process.env.JWT_SECRET
const protectedRoute = ()=> verify({ secret, algorithms: ["HS256"] })

function authJwt() {
  const secret = process.env.JWT_SECRET;
  const unprotectedRoute = [
    // REGEX expression is to allow wildcard after the url stated
    { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
    { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
    { url: /\/api\/v1\/orders(.*)/, methods:["GET","POST"] },
    { url: /\/public\/uploads(.*)/, methods:["GET", "OPTIONS"] },     
    "/api/v1/users/login",
    "/api/v1/users/register",
  ]
  return jwt({
    secret,
    algorithms: ["HS256"],
    // isRevoked: isRevoked,
  }).unless({
    // exclude the route from the auth check
    path: unprotectedRoute,
  });
}

async function isRevoked(req, token) {
  if (!token.payload?.isAdmin) {
    // console.log({token})
    // done(null,true)
    return  true;
  }
  // done()
  return  false;
}
exports = protectedRoute
module.exports = authJwt;