var Ballot = artifacts.require("./ballot.sol");

module.exports = function(deployer) {
  deployer.deploy(Ballot);
};
