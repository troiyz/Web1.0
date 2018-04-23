if (typeof web3 !== 'undefined') {
     web3 = new Web3(web3.currentProvider);
    
} else {
     web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}


web3.eth.defaultAccount = web3.eth.accounts[0];

var BallotContract = web3.eth.contract([ { "constant": false, "inputs": [ { "name": "proposal", "type": "uint256" } ], "name": "vote", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "proposals", "outputs": [ { "name": "name", "type": "bytes32" }, { "name": "voteCount", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "proposalNames", "type": "bytes32[]" }, { "name": "_timeToExpiry", "type": "uint256" } ], "name": "Ballotbox", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "chairperson", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "timeToExpiry", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "winningProposal", "outputs": [ { "name": "winningProposal_", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "startTime", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "voter", "type": "address" } ], "name": "giveRightToVote", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "voters", "outputs": [ { "name": "weight", "type": "uint256" }, { "name": "voted", "type": "bool" }, { "name": "delegate", "type": "address" }, { "name": "vote", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getNow", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "timeNow", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "winnerName", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ]);

var Ballot = BallotContract.at('0x8cdaf0cd259887258bc13a92c0a6da92698644c0');
        console.log(Ballot);



$("#button").click(function() {
    Ballot.Ballotbox(document.getElementsByName('mytext[]'), 1575158400);
});

function nameOfCandidate(){
    var inps = document.getElementsByName('mytext[]');
    for (var i = 0; i <inps.length; i++) {
        var nameCandidate=inps[i];
            alert("pname["+i+"].value="+nameCandidate.value);}
}

function getName(){
    var inputName = document.getElementsByName('inps[]');
    for(var i = 0; i< inputName.length; i++){
        var nameNo=inputName[i];
        
    }
}



