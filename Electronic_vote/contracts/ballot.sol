pragma solidity ^0.4.16;

/// @title Voting with delegation.
contract Ballot {
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;
    uint public timeToExpiry;
    uint public startTime;
    uint public timeNow;
    uint public voteCountNow;
    uint[] public scoreAll;

    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;
    bytes32[] Candidate;

    /// Create a new ballot to choose one of `proposalNames`.
    function Ballot_box(bytes32[] proposalNames ,uint _startTime ,uint _timeToExpiry) public payable{
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        timeToExpiry = _timeToExpiry;
        startTime = _startTime;
        Candidate = proposalNames;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
    
    function getProposalsName() public constant returns (bytes32[] nameCandi_) {
        nameCandi_ = Candidate;
    }

    // function getProposalsName(bytes32[] Candidate) public returns (bytes32[]) {
    //     bytes memory bytesString = new bytes(Candidate.length * 32);
    //     uint urlLength;
    //     for (uint i=0; i<Candidate.length; i++) {
    //         for (uint j=0; j<32; j++) {
    //             byte char = byte(bytes32(uint(Candidate[i]) * 2 ** (8 * j)));
    //             if (char != 0) {
    //                 bytesString[urlLength] = char;
    //                 urlLength += 1;
    //             }
    //         }
    //     }
    //     bytes32[] bytesStringTrimmed;
    //     for (i=0; i<urlLength; i++) {
    //         bytesStringTrimmed[i] = bytesString[i];
    //     }
    //     return bytesStringTrimmed;
    // }   

    function getProposalsCounts() public constant returns (uint) {
        return (proposals.length);
    }   


    // Give `voter` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address voter) public payable{
        // If the argument of `require` evaluates to `false`,
        // it terminates and reverts all changes to
        // the state and to Ether balances. It is often
        // a good idea to use this if functions are
        // called incorrectly. But watch out, this
        // will currently also consume all provided gas
        // (this is planned to change in the future).
        require(
            (msg.sender == chairperson) &&
            !voters[voter].voted &&
            (voters[voter].weight == 0)
        );
        voters[voter].weight = 1;
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint proposal) public payable{
        Voter storage sender = voters[msg.sender];
        require((!sender.voted) &&
            (voters[msg.sender].weight == 1) &&
            (now < timeToExpiry) &&
            (now > startTime));
        sender.voted = true;
        sender.vote = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        voteCountNow += 1;
        proposals[proposal].voteCount += 1;
    }

    function getVoteCountNow() public constant returns (uint) {
        return voteCountNow;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function scoreProposal() public payable returns(uint[] scoreProposal_) {
        scoreProposal_ = new uint[](proposals.length);
        for (uint i = 0; i < proposals.length; i++) {
            scoreProposal_[i] = proposals[i].voteCount;
        }
        return scoreProposal_;
    }
    
    function winnerName() public view  returns (string) {
            bytes memory bytesString = new bytes(32);
            bytes32 x = proposals[winningProposal()].name;
            uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
                if (char != 0) {
                    bytesString[charCount] = char;
                    charCount++;
                }
            }
        bytes memory winnerName_ = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            winnerName_[j] = bytesString[j];
        }
    return string(winnerName_);

}
    function getNow() public payable returns (uint){
        timeNow = now;
        return timeNow;
    }
    
    

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    // function winnerName() public view 
    //        returns (bytes32 winnerName_)
    //{
    //    winnerName_ = proposals[winningProposal()].name;
    //}

}