if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
}

web3.eth.defaultAccount = web3.eth.accounts[0];

var BallotContract = web3.eth.contract([ { "constant": false, "inputs": [ { "name": "proposal", "type": "uint256" } ], "name": "vote", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "proposals", "outputs": [ { "name": "name", "type": "bytes32" }, { "name": "voteCount", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "proposalNames", "type": "bytes32[]" }, { "name": "_timeToExpiry", "type": "uint256" } ], "name": "Ballotbox", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "chairperson", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "timeToExpiry", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "winningProposal", "outputs": [ { "name": "winningProposal_", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "startTime", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "voter", "type": "address" } ], "name": "giveRightToVote", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "voters", "outputs": [ { "name": "weight", "type": "uint256" }, { "name": "voted", "type": "bool" }, { "name": "delegate", "type": "address" }, { "name": "vote", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getNow", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "timeNow", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "winnerName", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ]);

var Ballot = BallotContract.at('0x0d5834723d3d98096a692776115e16248d92f35f');
        console.log(Ballot);

$(document).ready(function() {
    var wrapper         = $(".container1"); 
    var add_button      = $(".add_form_field"); 
    
    $(add_button).click(function(e){ 
        e.preventDefault();
            $(wrapper).append('<div><input type="text" name="nameCandidate[]"/><a href="#" class="delete">Delete</a></div>'); //add input box
    });
    $(wrapper).on("click",".delete", function(e){ 
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
});


$("#button").click(function() {
    Ballot.Ballotbox(document.getElementsByName('nameCandidate[]'), 1575158400);
});

function nameOfCandidate(){
    var inps = document.getElementsByName('nameCandidate[]');
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



