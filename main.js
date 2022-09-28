const express = require('express')
const { swagger_ui, specs } = require('./configs/swagger')

const user_router = require('./routers/user')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/user', user_router)

app.use('/api-docs', swagger_ui.serve, swagger_ui.setup(specs))

app.listen(port, () => {
	console.log(`server is listening at port ${port}`)
})

