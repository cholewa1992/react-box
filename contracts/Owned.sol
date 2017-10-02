pragma solidity ^0.4.15;
contract Owned {

    address public owner;

    function Owned() public {
        owner = msg.sender;
    }

    modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public isOwner {
        owner = _newOwner;
    }

}
