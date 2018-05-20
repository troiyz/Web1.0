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


let abi;
var nameAddress = new Array();



var serviceAccount = require('./blockchain-1-firebase-adminsdk-477z7-286990727e.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://blockchain-1.firebaseio.com'
});




const config = {
    apiKey: "AIzaSyBHxu0leiSXx2kCkjIGd8BPd7BEQDvHZAA",
    authDomain: "blockchain-1.firebaseapp.com",
    databaseURL: "https://blockchain-1.firebaseio.com",
    projectId: "blockchain-1",
    storageBucket: "blockchain-1.appspot.com",
    messagingSenderId: "474853322960"
};
firebase.initializeApp(config);

var db = admin.firestore();



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
        res.redirect('/loginVoter');
    }
}

const isAdmin = (req, res, next) => {
    const user = req.session.user;
    console.log(user)
    if (user == undefined || user == null) {
        res.redirect('/');
        return;
    }
    const userId = user.userId;
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
    // console.log(web3.eth.accounts)
    console.log(contractCreation.networks[7777].address)
    res.render('index.ejs')
})

app.get('/loginVoter', (req, res) => res.render('loginAsVoter.ejs'))
app.get('/login', (req, res) => res.render('login.ejs'))

// app.post('/login', (req, res) => res.render('loginAsVoter.ejs'))


app.get('/logout', isAuthenticated, (req, res) => {
    req.session.idToken = null;
    req.session.user = null;
    res.redirect('/')
})

app.get('/getData', (req, res) => {
    console.log(newAddress);
    console.log(nameAddress);
    res.render('getData.ejs')
}
)

app.get('/confirmation', (req, res) => res.render('confirmation.ejs'))

app.post('/confirmation', (req, res) => {
    var phoneNum = req.body.phoneNumber;
    var values = web3.toWei('0.05', 'ether');
    var newAddress = web3.personal.newAccount();
    web3.personal.unlockAccount(newAddress);
    web3.eth.sendTransaction({ to: newAddress, from: web3.eth.coinbase, value: values })
    var nameAddress = db.collection("address").doc(phoneNum);
    var setNameAddress = nameAddress.set({
        address: newAddress
    })
    Ballot.deployed().then(function (instance) {
        giveRight = instance.giveRightToVote.sendTransaction(newAddress, { from: web3.eth.coinbase, gas: 6721975 })
        giveRight.then(function (give) {
            console.log(give);
        }).catch(function (err) {
            console.log("Can't give right to vote");
        })
    })
    // nameAddress[phoneNum] = newAddress;
    console.log(phoneNum, "from Confirmation");
    console.log(newAddress, "from Confirmation");
    res.redirect('confirmation.ejs');
})

app.get('/dashboard', (req, res) => {
    Ballot.deployed().then(function (instance) {
        voteCount = instance.getVoteCountNow.call();
        nameProposals = instance.getProposalsName.call();
        titleName = instance.getTitle.call();
        timeStart = instance.getStartTimeStamp.call();
        timeEnd = instance.getEndTimeStamp.call();
        voteCount.then(function (resultVoteCount) {
            nameProposals.then(function (resultName) {
                var stringName = [];
                for (i = 0; i < resultName.length; i++) {
                    stringName.push(web3.toAscii(resultName[i]).replace(/\0/g, ''));
                }
                resultName = stringName;
                console.log("1", resultName);
                // res.render('vote.ejs', {resultName});
                titleName.then(function (nameTitle) {
                    console.log("2", nameTitle);
                    timeStart.then(function (startTime) {
                        console.log("3", startTime)
                        timeEnd.then(function (endTime) {
                            console.log("4", endTime)
                            res.render('dashboard.ejs', { resultName, nameTitle, resultVoteCount, startTime, endTime });
                        })
                    })
                })
            })
        })
    }).catch(function (err) {
        console.log(err);
    })
})

app.get('/viewResult', (req, res) => {
    var score;
    var win;
    Ballot.deployed().then(function (instance) {
        scoreAll = instance.scoreProposal.call();
        nameProposals = instance.getProposalsName.call();
        winName = instance.winnerName.call();
        voteCount = instance.getVoteCountNow.call();
        scoreAll.then(function (scoreVote) {
            score = scoreVote;
            console.log("1   " + score);
            nameProposals.then(function (resultName) {
                var stringName = [];
                for (i = 0; i < resultName.length; i++) {
                    stringName.push(web3.toAscii(resultName[i]).replace(/\0/g, ''));
                }
                resultName = stringName;
                console.log("2  ", resultName);
                winName.then(function (winnName) {
                    win = winnName;
                    console.log("3  " + winnName)
                    voteCount.then(function (resultVoteCount) {
                        console.log("4 ", resultVoteCount);
                        res.render('viewResult.ejs', { score, winnName, resultName, resultVoteCount });
                    })
                })
            })
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

// app.post('/sessionLogin', (req, res) => {
//     const toUser = idToken => {
//         const payload = jwt.decode(idToken, { complete: true }).payload;
//         return {
//             userId: payload.user_id,
//             email: payload.email
//         }
//     }
//     const idToken = req.body.idToken.toString();
//     req.session.idToken = idToken;
//     req.session.user = toUser(idToken);
//     res.json({ status: 'success' })
// });

app.post('/sessionLogin', (req, res) => {
    const toUser = idToken => {
        const payload = jwt.decode(idToken, { complete: true }).payload;
        return {
            userId: payload.user_id,
            email: payload.email,
            phone_number: payload.phoneNumber,
            ...payload,
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
        nameProposals = instance.getProposalsName.call();
        titleName = instance.getTitle.call();
        nameProposals.then(function (resultName) {
            var stringName = [];
            for (i = 0; i < resultName.length; i++) {
                stringName.push(web3.toAscii(resultName[i]).replace(/\0/g, ''));
            }
            resultName = stringName;
            console.log("1", resultName);
            // res.render('vote.ejs', {resultName});
            titleName.then(function (nameTitle) {
                console.log("2", nameTitle);
                res.render('vote.ejs', { resultName, nameTitle });
            })
        })
    }).catch(function (err) {
        console.log("Can't get name of proposals");
    })
});

app.post('/voted', (req, res) => {
    var phone = req.session.user.phone_number;
    var address;
    voteSelect = req.body.thisclick;
    console.log(phone)
    var getAdd = db.collection("address").doc(phone);
    var query = getAdd.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                address = doc.data().address;
                console.log("2", address);
                Ballot.deployed().then(function (instance) {
                    voting = instance.vote.sendTransaction(voteSelect, { from: web3.eth.coinbase, gas: 6721975 });
                    voting.then(function (voteScore) {
                        console.log(voteScore);
                    }).catch(function (err) {
                        console.log("voting error", err);
                    })
                }).catch(err => {
                    console.log('Error getting document', err);
                })
                console.log(voteSelect);
                res.json({ status: 'success' })
            }
        })
})

app.get('/deleteFirestore', (req, res) => {

    var batch = db.batch();

    db.collection("voters").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            var docdel = doc.data().phoneNumber;
            console.log("1", docdel);
            batch.delete(docdel);
            console.log("2", docdel);
        })
    })
})

app.get('/createVote', (req, res) => {
    Ballot.deployed().then(function (instance) {
        checkCan = instance.checkCreate.call();
        checkCan.then(function (result) {
            console.log(result)
            if (result == undefined || result == false) {
                res.render('createVote.ejs')
            }
            else {
                res.redirect('/dashboard')
            }
        })
    })
    // let source = fs.readFileSync('./contracts/ballot.sol', 'UTF-8');
    // let compiled = solc.compile(source);

    // bin = compiled.contracts[':Ballot'].bytecode;

    // util.log(`>>>>> setup - Bytecode: ${bin}`);
    // util.log(`>>>>> setup - ABI: ${compiled.contracts[':Ballot'].interface}`);

    // abi = JSON.parse(compiled.contracts[':Ballot'].interface);

})

app.post('/createVote', (req, res) => {
    var title = req.body.titleSub;
    var candidate = req.body.nameCandidate;
    var dateStart = req.body.startDate;
    var dateEnd = req.body.endDate;
    var dateStartTimeStamp = Date.parse(dateStart);
    var dateEndTimeStamp = Date.parse(dateEnd);
    var startTimeStamp = dateStartTimeStamp.toString();
    var endTimeStamp = dateEndTimeStamp.toString();
    var startStamp = startTimeStamp.slice(0, 10);
    var endStamp = endTimeStamp.slice(0, 10);
    var startTime = parseInt(startStamp);
    var endTime = parseInt(endStamp);
    var createCandi;
    var winName;
    var blockNum;
    var BallotContract;
    var voting;
    console.log(dateStartTimeStamp, dateEndTimeStamp);
    console.log(startTime, endTime);
    console.log(title, candidate);

    // console.log(ballotArtifact);
    Ballot.deployed().then(function (instance) {
        createCandi = instance.Ballot_box.sendTransaction(title, candidate, startTime, endTime, { from: web3.eth.coinbase, gas: 6721975 });
        timeStart = instance.setStartTimeStamp.sendTransaction(dateStartTimeStamp, { from: web3.eth.coinbase, gas: 6721975 });
        timeEnd = instance.setEndTimeStamp.sendTransaction(dateEndTimeStamp, { from: web3.eth.coinbase, gas: 6721975 });
        createCandi.then(function (result) {
            console.log("10", result);
            timeStart.then(function (startTime) {
                console.log("20", startTime)
                timeEnd.then(function (endTime) {
                    console.log("30", endTime)
                    res.redirect('/createVote');
                })
            })
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
});

app.get('/auth', isAuthenticated, (req, res) => {
    res.json(req.session.user)
});

app.get('/makeadmin', isAuthenticated, (req, res) => {
    const uid = req.session.user.userId;
    admin.auth().setCustomUserClaims(uid, { admin: true }).then(() => {
        res.json({
            'message': `You're admin.`
        })
    });
})

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
