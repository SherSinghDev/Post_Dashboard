let express = require('express')
let app = express()
let mongoConnect = require('./modals/db')
let patientRouter = require('./controllers/patients/index')
let dashboardRouter = require('./controllers/dashboard/index')
let authRouter = require('./controllers/auth/index')
let userRouter = require('./controllers/users/index')
let applicationsRouter = require('./controllers/application/index')
let session = require("express-session")

// mongodb
mongoConnect()


// middlewares
app.use(express.static('./src/assets'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
    secret: "^*&*(",
    resave: false,
    saveUninitialized: false
}))


// setting ejs
app.set('view engine', 'ejs')
app.set('views', './src/views')



// routes
app.use('/patients', patientRouter)
app.use('/', dashboardRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/applications', applicationsRouter)



// listening
app.listen(3200, () => {
    console.log("Listening to the http://localhost:3200");
})