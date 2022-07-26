const app = require("../servers").app;
const api = process.env.API_URL;


const productRoutes = require("../routes/api/ProductRoutes")
const categoryRoutes = require("../routes/api/CategoryRoutes")
const userRoutes = require("../routes/api/UsersRoutes")
const orderRoutes = require("../routes/api/OrderRoutes")

app.use(`${api}/products`,productRoutes)
app.use(`${api}/categories`,categoryRoutes)
app.use(`${api}/users`,userRoutes)
app.use(`${api}/orders`,orderRoutes)

module.exports = app;
