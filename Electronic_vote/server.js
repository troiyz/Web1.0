const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const firebase = require("firebase");
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const util = require('util');
const truffleContract = require('truffle-contract');
const S = require('string');
const $ = require("jquery");

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8045'));
var ballotArtifact = JSON.parse(fs.readFileSync('./build/contracts/Ballot.json', 'UTF-8'));
var Ballot = truffleContract(ballotArtifact);
Ballot.setProvider(web3.currentProvider);

var title;
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

const isAdmin = (req, res, next) => {
    const userId = req.session.user.userId;
    const idToken = req.session.idToken;
    admin.auth().verifyIdToken(idToken).then((claims) => {
        if (claims.admin === true) {
            next();
        } else {
            res.redirect('/');
        }
    });
}

app.get('/', (req, res) => {
    let contractCreation = JSON.parse(fs.readFileSync('./build/contracts/Ballot.json', 'UTF-8'));
    console.log(contractCreation.networks[7777].address)
    res.render('index.ejs')
})
app.get('/login', (req, res) => res.render('login.ejs'))

app.get('/logout', isAuthenticated, (req, res) => {
    req.session.idToken = null;
    req.session.user = null;
    res.redirect('/')
})

app.get('/getData', (req, res) => res.render('getData.ejs'))

app.get('/confirmation', (req, res) => res.render('confirmation.ejs'))

app.post('/confirmation', (req, res) => {
    phoneNum = req.body.phoneNumber;
    console.log(phoneNum);
})

app.get('/dashboard', (req, res) => {
    Ballot.deployed().then(function (instance) {
        voteCount = instance.getVoteCountNow.call();
        voteCount.then(function (resultVoteCount) {
            console.log(voteCount);
            console.log(resultVoteCount);
            res.render('dashboard.ejs', { resultVoteCount });
        })
    })
})

app.get('/viewResult', (req, res) => {
    var score;
    var win;
    Ballot.deployed().then(function (instance) {
        scoreAll = instance.scoreProposal.call();
        winName = instance.winnerName.call();
        scoreAll.then(function (scoreVote) {
            score = scoreVote;
            console.log("1   " + score);
        }).catch(function (err) {
            console.log("can't get score");
        })
        winName.then(function (winnName) {
            win = winnName;
            console.log("2   " + winnName)
            res.render('viewResult.ejs', {score, winnName});
        }).catch(function (err) {
            console.log("can't get winner name");
        })
    })

})

// catch(function (err) {
//     console.log("Fail to get Winner name and score vote");
// })
// app.get('/vote', (req, res) => res.render('vote.ejs'))
// app.post('/vote', (req, res) => res.render('vote.ejs'))

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
app.get('/vote', (req, res) => {
    Ballot.deployed().then(function (instance) {
        // countProposals = instance.getProposalsCounts.call();
        nameProposals = instance.getProposalsName.call();
        // countProposals.then(function(resultLength){
        //     res.json(resultLength);
        //     console.log(resultName.length);
        // })
        nameProposals.then(function (resultName) {
            var stringName = [];
            for (i = 0; i < resultName.length; i++) {
                stringName.push(web3.toAscii(resultName[i]).replace(/\0/g, ''));
            }
            resultName = stringName;
            console.log(resultName);
            res.render('vote.ejs', { resultName });
        })
    }).catch(function (err) {
        console.log("Can't get name of proposals");
    })
});

app.post('/voted', (req, res) => {
    voteSelect = req.body.thisclick;
    console.log(voteSelect);
    Ballot.deployed().then(function (instance) {
        voting = instance.vote.sendTransaction(voteSelect, { from: web3.eth.coinbase });
        voting.then(function (voteScore) {
            console.log(voteScore);
        })
    }).catch(function (err) {
        console.log("Can't deployed function vote");
    })
})

app.get('/createVote', (req, res) => {
    let source = fs.readFileSync('./contracts/ballot.sol', 'UTF-8');
    let compiled = solc.compile(source);

    bin = compiled.contracts[':Ballot'].bytecode;

    // util.log(`>>>>> setup - Bytecode: ${bin}`);
    // util.log(`>>>>> setup - ABI: ${compiled.contracts[':Ballot'].interface}`);

    abi = JSON.parse(compiled.contracts[':Ballot'].interface);

    util.log('>>>>> setup - Completed !!!')
    res.render('createVote.ejs')
})

app.post('/createVote', (req, res) => {
    title = req.body.titleSub;
    var candidate = req.body.nameCandidate;
    var dateStart = req.body.startDate;
    var dateEnd = req.body.endDate;
    var dateStartTimeStamp = Date.parse(dateStart);
    var dateEndTimeStamp = Date.parse(dateEnd);
    var createCandi;
    var winName;
    var blockNum;
    var BallotContract;
    var voting;
    console.log(dateStartTimeStamp, dateEndTimeStamp);
    console.log(title, candidate);

    // console.log(ballotArtifact);
    Ballot.deployed().then(function (instance) {
        createCandi = instance.Ballot_box.sendTransaction(candidate, dateStartTimeStamp, dateEndTimeStamp, { from: web3.eth.coinbase, gas: 6721975 });
        // voting = instance.vote.sendTransaction(1, { from: web3.eth.coinbase });
        // voting.then(function (voteScore) {
        //     console.log(voteScore);
        // })
        createCandi.then(function (result) {
            console.log(result);
        }).catch(function (err) {
            console.log("create candidate Error !!");
        })
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
        console.log("Deployed function create vote Failed!!");
    })
    res.json(candidate);
});

app.get('/auth', isAuthenticated, (req, res) => {
    res.json(req.session.user)
});

app.get('/admin/users', isAuthenticated, isAdmin, (req, res) => {
    admin.auth().listUsers(1000)
        .then(function (listUsersResult) {
            res.json({
                userList: listUsersResult
            });
            // res.render('admin/userlist', {
            //     userList: listUsersResult
            // });
        })
        .catch(function (error) {
            console.log("Error listing users:", error);
            res.json(error);
        });
});


app.listen(3000);
