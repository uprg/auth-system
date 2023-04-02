const express = require('express')
const app = express()
const randomToken = require('rand-token')
const jwt = require('jsonwebtoken')

app.use(express.urlencoded({extended: true}))
app.use(express.json())

let db = [];

let secretkey = 'notgood'

let expiresIn = '1h'

app.post('/signin', (req, res) => {
    let {email, password} = req.body

    let refreshtoken = randomToken.uid(256)

    db.push({
        email,
        password,
        refreshtoken
    })

    res.status(201).json({
        message: 'user created'
    })
})

app.post('/login', (req, res) => {
    let {email, password} = req.body

    db.forEach(user => {
        if (email === user.email && password === user.password){
            let token = jwt.sign({email, password}, secretkey, {algorithm: 'HS256', expiresIn})

            res.status(200).json({
                token,
                refreshtoken: user.refreshtoken
            })

        }
        else{
            res.status(404).json({
                message: 'user not found'
            })
        }
    })
})

app.post('/home', (req, res) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        let {email} = jwt.verify(token, secretkey)
        
        res.status(200).json({
            message: `Welcome ${email}`
        })
    }
    catch (e) {
        res.status(401).json({
            message: 'Unauthorized'
        })
    }
})

app.post('/requesttoken', (req, res) => {
    let {refreshtoken} = req.body

    db.forEach(user => {
        if (refreshtoken === user.refreshtoken){
            let token = jwt.sign({email: user.email, password: user.password}, secretkey, {algorithm: 'HS256', expiresIn})
            res.status(200).json({
                token
            })
        }
        else{
            res.status(400).json({
                message: 'Bad Request'
            })
        }
    })
})

app.listen(8080, () => console.log('listening on port 8080'))