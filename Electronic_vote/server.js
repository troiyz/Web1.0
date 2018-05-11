const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const util = require('util');
const truffleContract = require('truffle-contract');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8045'));
var ballotArtifact = JSON.parse(fs.readFileSync('./build/contracts/Ballot.json', 'UTF-8'));
var Ballot = truffleContract(ballotArtifact);
Ballot.setProvider(web3.currentProvider);

let vin = '1234567890';
let cost = 1000000000000000000;
let gas = 1000000;
let abi;


var serviceAccount = require('./blockchain-1-firebase-adminsdk-477z7-286990727e.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://blockchain-1.firebaseio.com'
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use('/Style', express.static(__dirname + '/views/Style'));
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

app.set('view engine', 'ejs');
app.set('views', './views');

const isAuthenticated = (req, res, next) => {
    const user = req.session.user;
    console.log(user)
    if (user !== null && user !== undefined) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => res.render('index.ejs'))
app.get('/login', (req, res) => res.render('login.ejs'))
app.get('/createVote', (req, res) => {
    let source = fs.readFileSync('./contracts/ballot.sol', 'UTF-8');
    let compiled = solc.compile(source);

    bin = compiled.contracts[':Ballot'].bytecode;

    // util.log(`>>>>> setup - Bytecode: ${bin}`);
    // util.log(`>>>>> setup - ABI: ${compiled.contracts[':Ballot'].interface}`);

    abi = JSON.parse(compiled.contracts[':Ballot'].interface);

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
        const payload = jwt.decode(idToken, { complete: true }).payload;
        return {
            userId: payload.user_id,
            email: payload.email
        }
    }
    const idToken = req.body.idToken.toString();
    req.session.idToken = idToken;
    req.session.user = toUser(idToken);
    res.json({ status: 'success' })
});

// Get Voters
app.get ('/voted', (req,res) => {
    Ballot.deployed().then(function (instance) {
        winName = instance.winnerName.call();
    winName.then(function(resultName){
        res.json(resultName);
        console.log(resultName.length);
    })
    })
});

app.post('/TestcreateVote', (req, res) => {
    var candidate = req.body.nameCandidate;
    var createCandi;
    var winName;
    var blockNum;
    var BallotContract;
    var voting;
    console.log(candidate.length);

    // console.log(ballotArtifact);
    Ballot.deployed().then(function (instance) {
        createCandi = instance.Ballot_box.sendTransaction(candidate, 1575158400, { from: web3.eth.coinbase, gas: 6721975 });
        voting = instance.vote.sendTransaction(1, {from: web3.eth.coinbase});
        winName = instance.winnerName.call();
        createCandi.then(function(result){
            console.log(result);
        })
        voting.then(function(voteScore){ 
            console.log(voteScore);
        })
        // winName.then(function(resultName){
        //     console.log(resultName);
        // })
        // })
        // blockNum = (web3.eth.getBlock("latest").number)+1;
        // console.log(blockNum);
        // contractAdd = web3.eth.getBlock("latest");
        // console.log(contractAdd);
        // console.log(create.winnerName());
        // instance.Ballot.call().then(function(result){
        // console.log(result);
        // console.log(BallotContract)
        // console.log(Ballot);
    }).catch(function (err) {
        console.log(err);
    })
    res.json(candidate);
});
app.get('/auth', isAuthenticated, (req, res) => {
    res.json(req.session.user)
});

app.listen(3000);
