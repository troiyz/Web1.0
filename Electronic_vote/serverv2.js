const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const util = require('util');

let vin = '1234567890';
let cost = 1000000000000000000;
let gas = 1000000;
let abi = undefined;
let bin = undefined;
let web3 = undefined;


var serviceAccount = require('./blockchain-1-firebase-adminsdk-477z7-286990727e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://blockchain-1.firebaseio.com'
});

const app        =    express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use('/Style' ,express.static(__dirname + '/views/Style'));
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
  });

app.set('view engine', 'ejs');
app.set('views', './views');

const isAuthenticated = (req, res, next) => {
    const user = req.session.user;
    console.log(user)
    if (user !== null && user !== undefined ) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => res.render('index.ejs'))
app.get('/login', (req, res) => res.render('login.ejs'))
app.get('/createVote', (req, res) => {
    let source = fs.readFileSync('./src/ballot.sol', 'UTF-8');
    let compiled = solc.compile(source);

    // bin = compiled.contracts[':Ballot'].bytecode;

    // util.log(`>>>>> setup - Bytecode: ${bin}`);
    util.log(`>>>>> setup - ABI: ${compiled.contracts[':Ballot'].interface}`);
    
    abi = JSON.parse(compiled.contracts[':Ballot'].interface);

    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8085'));

    util.log('>>>>> setup - Completed !!!')
    res.render('testCreateVote.ejs')
})
app.get('/logout', isAuthenticated, (req, res) => {
    req.session.idToken = null;
    req.session.user = null;
    res.redirect('/')
})
app.get('/home', (req, res) => res.render('home.ejs'))
app.get('/vote', (req, res) => res.render('vote.ejs'))
app.post('/vote', (req, res) => res.render('vote.ejs'))

app.post('/sessionLogin', (req, res) => {
    const toUser = idToken => {
        const payload = jwt.decode(idToken, {complete: true}).payload;
        return {
            userId: payload.user_id,
            email: payload.email
        }
    }
    const idToken = req.body.idToken.toString();
    req.session.idToken = idToken;
    req.session.user = toUser(idToken);
    res.json({status: 'success'})
});

app.post('/TestcreateVote', (req,res) => {
    var candidate = req.body.nameCandidate;
    console.log(candidate);
    res.json(candidate)
})

app.get('/auth', isAuthenticated, (req, res) => {
    res.json(req.session.user)
});

app.listen(3000);
