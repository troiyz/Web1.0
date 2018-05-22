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
const $ = require('jquery');
const moment = require('moment');

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
    // console.log(user)
    if (user !== null && user !== undefined) {
        next();
    } else {
        res.redirect('/');
    }
}

const isAdmin = (req, res, next) => {
    const user = req.session.user;
    // console.log(user)
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
    res.render('index.ejs')
})

// app.get('/loginVoter', (req, res) => res.render('loginAsVoter.ejs'))
// app.get('/login', (req, res) => res.render('login.ejs'))
// app.post('/login', (req, res) => res.render('loginAsVoter.ejs'))


app.get('/logout', isAuthenticated, (req, res) => {
    firebase.auth().signOut();
    req.session.idToken = null;
    req.session.user = null;
    res.redirect('/')
})

app.get('/createVote', isAuthenticated, (req, res) => {
    Ballot.deployed().then(function (instance) {
        checkCan = instance.checkCreate.call();
        checkCan.then(function (result) {
            // console.log(result)
            if (result == undefined || result == false) {
                res.render('createVote.ejs')
            }
            else {
                res.redirect('/dashboard')
            }
        })
    })
})
// let source = fs.readFileSync('./contracts/ballot.sol', 'UTF-8');
// let compiled = solc.compile(source);

// bin = compiled.contracts[':Ballot'].bytecode;

// util.log(`>>>>> setup - Bytecode: ${bin}`);
// util.log(`>>>>> setup - ABI: ${compiled.contracts[':Ballot'].interface}`);

// abi = JSON.parse(compiled.contracts[':Ballot'].interface);

app.post('/createVote', isAuthenticated, isAdmin, (req, res) => {
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
    console.log("Start Time : " + startTime, "End Time : " + endTime);
    console.log(title, candidate);

    // function deleteCollection(collectionPath, batchSize) {
    //     var collectionRef = db.collection(collectionPath);
    //     var query = collectionRef.orderBy('__name__').limit(batchSize);

    //     return new Promise((resolve, reject) => {
    //         deleteQueryBatch(db, query, batchSize, resolve, reject);
    //     });
    // }

    // function deleteQueryBatch(db, query, batchSize, resolve, reject) {
    //     query.get()
    //         .then((snapshot) => {
    //             // When there are no documents left, we are done
    //             if (snapshot.size == 0) {
    //                 return 0;
    //             }

    //             // Delete documents in a batch
    //             var batch = db.batch();
    //             snapshot.docs.forEach((doc) => {
    //                 batch.delete(doc.ref);
    //             });

    //             return batch.commit().then(() => {
    //                 return snapshot.size;
    //             });
    //         }).then((numDeleted) => {
    //             if (numDeleted === 0) {
    //                 resolve();
    //                 return;
    //             }

    //             // Recurse on the next process tick, to avoid
    //             // exploding the stack.
    //             process.nextTick(() => {
    //                 deleteQueryBatch(db, query, batchSize, resolve, reject);
    //             });
    //         })
    //         .catch(reject);
    // }

    // deleteCollection('/address', 100)
    //     .then(() => {
    //     })

    // deleteCollection('/voters', 100)
    //     .then(() => {
    //         // res.json({
    //         //     message: 'ok'
    //         // })
    //     })

    // console.log(ballotArtifact);
    Ballot.deployed().then(function (instance) {
        createCandi = instance.Ballot_box.sendTransaction(title, candidate, startTime, endTime, { from: web3.eth.coinbase, gas: 6721975 });
        timeStart = instance.setStartTimeStamp.sendTransaction(dateStartTimeStamp, { from: web3.eth.coinbase, gas: 6721975 });
        timeEnd = instance.setEndTimeStamp.sendTransaction(dateEndTimeStamp, { from: web3.eth.coinbase, gas: 6721975 });
        createCandi.then(function (result) {
            timeStart.then(function (startTime) {
                timeEnd.then(function (endTime) {
                    console.log(result)
                    res.redirect('/createVote');
                })
            })
        }).catch(function (err) {
            console.log("create candidate Error !!");
        })
    }).catch(function (err) {
        console.log("Deployed function create vote Failed!!");
    })
});

app.get('/admin', isAuthenticated, isAdmin, (req, res) => res.render('admin.ejs'))

app.get('/confirmation', isAuthenticated, isAdmin, (req, res) => {
    Ballot.deployed().then(function (instance) {
        titleName = instance.getTitle.call();
        titleName.then(function (nameTitle) {
            res.render('confirmation.ejs', {nameTitle})
        }).catch(function (err) {
            console.log(err);
        })
    })
})

app.post('/confirmation', isAuthenticated, isAdmin, (req, res) => {
    var phoneNum = req.body.phoneNumber;
    var values = web3.toWei('0.05', 'ether');
    var newAddress = web3.personal.newAccount();
    console.log(newAddress);
    web3.personal.unlockAccount(newAddress);
    web3.eth.sendTransaction({ to: newAddress, from: web3.eth.coinbase, value: values })
    var nameAddress = db.collection("address").doc(phoneNum);
    var setNameAddress = nameAddress.set({
        address: newAddress
    })
    Ballot.deployed().then(function (instance) {
        giveRight = instance.giveRightToVote.sendTransaction(newAddress, { from: web3.eth.coinbase, gas: 6721975 })
        giveRight.then(function (give) {
            console.log("Give right to vote => address :" + newAddress);
            // res.redirect('/confirmation');
        }).catch(function (err) {
            console.log("Can't give right to vote");
        })
    })
    // console.log(phoneNum, "from Confirmation");
    // console.log(newAddress, "from Confirmation");
})

app.get('/dashboard', isAuthenticated, isAdmin, (req, res) => {
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
                console.log("Get Name Candidate" + resultName);
                // res.render('vote.ejs', {resultName});
                titleName.then(function (nameTitle) {
                    console.log("Get title" + nameTitle);
                    timeStart.then(function (startTime) {
                        console.log("Get Start Time" + startTime)
                        timeEnd.then(function (endTime) {
                            console.log("Get End Time" + endTime)
                            startTime = startTime.toNumber()
                            endTime = endTime.toNumber()
                            startTime2 = moment(startTime).format('DD-MM-YYYY HH:mm')
                            endTime2 = moment(endTime).format('DD-MM-YYYY HH:mm')
                            res.render('dashboard.ejs', { resultName, nameTitle, resultVoteCount, startTime2, endTime2, startTime, endTime });
                        })
                    })
                })
            })
        })
    }).catch(function (err) {
        console.log(err);
    })
})

app.get('/viewResult', isAuthenticated, (req, res) => {
    var score;
    Ballot.deployed().then(function (instance) {
        scoreAll = instance.scoreProposal.call();
        nameProposals = instance.getProposalsName.call();
        winName = instance.winnerName.call();
        voteCount = instance.getVoteCountNow.call();
        scoreAll.then(function (scoreVote) {
            score = scoreVote;
            console.log("Get score :" + score);
            nameProposals.then(function (resultName) {
                var stringName = [];
                for (i = 0; i < resultName.length; i++) {
                    stringName.push(web3.toAscii(resultName[i]).replace(/\0/g, ''));
                }
                resultName = stringName;
                console.log("Get name :", resultName);
                winName.then(function (winnName) {
                    console.log("Get winner name :" + winnName)
                    voteCount.then(function (resultVoteCount) {
                        console.log("result :" + resultVoteCount);
                        res.render('viewResult.ejs', { score, winnName, resultName, resultVoteCount });
                    })
                })
            })
        }).catch(function (err) {
            console.log("can't get winner name");
        })
    })

})

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
app.get('/vote', isAuthenticated, (req, res) => {
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

app.post('/voted', isAuthenticated, (req, res) => {
    var phone = req.session.user.phone_number;
    var address;
    voteSelect = req.body.thisclick;
    var getAdd = db.collection("address").doc(phone);
    var query = getAdd.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                address = doc.data().address;
                // console.log("Add :" + address);
                Ballot.deployed().then(function (instance) {
                    voting = instance.vote.sendTransaction(voteSelect, { from: web3.eth.coinbase, gas: 6721975 });
                    voting.then(function (voteScore) {
                        console.log(voteScore);
                    }).catch(function (err) {
                        console.log(err);
                    })
                }).catch(err => {
                    console.log('Error getting document', err);
                })
            }
        })
    res.redirect('/');
})

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


app.get('/deleteFirestore', (req, res) => {
    function deleteCollection(collectionPath, batchSize) {
        var collectionRef = db.collection(collectionPath);
        var query = collectionRef.orderBy('__name__').limit(batchSize);

        return new Promise((resolve, reject) => {
            deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
    }

    function deleteQueryBatch(db, query, batchSize, resolve, reject) {
        query.get()
            .then((snapshot) => {
                // When there are no documents left, we are done
                if (snapshot.size == 0) {
                    return 0;
                }

                // Delete documents in a batch
                var batch = db.batch();
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                return batch.commit().then(() => {
                    return snapshot.size;
                });
            }).then((numDeleted) => {
                if (numDeleted === 0) {
                    resolve();
                    return;
                }

                // Recurse on the next process tick, to avoid
                // exploding the stack.
                process.nextTick(() => {
                    deleteQueryBatch(db, query, batchSize, resolve, reject);
                });
            })
            .catch(reject);
    }

    deleteCollection('/address', 100)
        .then(() => {
        })

    deleteCollection('/voters', 100)
        .then(() => {
            res.json({
                message: 'ok'
            })
        })
})


app.listen(3000);
