// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CompanyToken is ERC20, ERC20Burnable {
    struct ShareHolder {
        uint256 id;
        address addr;
        uint256 amount;
    }

    struct Proposal {
        uint256 id;
        address owner;
        string title;
        bytes data;
        bool executed;
        uint256 timestamp;
        uint256 approvals;
        uint256 totalProposedDilutions;
        // Dilutions[] newShareDistribution;
    }

    struct Dilutions {
        // uint256 id;
        uint256 timestamp;
        address from;
        address to;
        uint256 amount;
    }

    event AddProposal(
        address indexed owner,
        uint256 indexed txIndex,
        bytes data,
        uint256 totalProposedDilutions
    );
    event ApproveProposal(address indexed owner, uint256 indexed txIndex);
    event RevokeProposal(address indexed owner, uint256 indexed txIndex);
    event ExecuteProposal(address indexed owner, uint256 indexed txIndex);
    event UpdateProposal(
        address indexed owner,
        uint256 indexed txIndex,
        bytes data,
        uint256 totalProposedDilutions
    );

    mapping(uint256 => ShareHolder) public shareHolders;
    uint256 public shareHoldersCount;

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalsCount;

    mapping(uint256 => mapping(uint256 => Dilutions)) public proposedDilutions;

    mapping(uint256 => mapping(address => bool)) public approved;

    uint256 public MIN_REQUIRED;

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalsCount, "proposal does not exist");
        _;
    }

    modifier enoughApprovals(uint256 proposalId) {
        require(
            proposals[proposalId].approvals >= MIN_REQUIRED,
            "Not enough approvals"
        );
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _initialShareHolder,
        uint256 _minRequired
    ) ERC20(_name, _symbol) {
        require(_initialShareHolder != address(0), "Invalid address");
        uint256 amount = 100 * (10 ** decimals());
        _mint(_initialShareHolder, amount);
        unchecked {
            shareHolders[shareHoldersCount] = ShareHolder(
                shareHoldersCount,
                _initialShareHolder,
                amount
            );
            shareHoldersCount++;
        }
        MIN_REQUIRED = _minRequired;
    }

    function addProposal(
        bytes calldata data,
        string calldata title,
        address[] calldata dilutionsTO,
        address[] calldata dilutionsFROM,
        uint256[] calldata dilutionsAMOUNT, // capital kitna jana hai
        uint256 totalProposedDilutions
    ) external {
        require(data.length > 0, "Invalid data");
        require(
            dilutionsTO.length == dilutionsFROM.length &&
                dilutionsTO.length == dilutionsAMOUNT.length &&
                dilutionsTO.length == totalProposedDilutions,
            "Invalid dilutions"
        );
        proposals[proposalsCount] = Proposal(
            proposalsCount,
            msg.sender,
            title,
            data,
            false,
            block.timestamp,
            0,
            totalProposedDilutions
        );
        for (uint256 i = 0; i < totalProposedDilutions; ) {
            proposedDilutions[proposalsCount][i] = Dilutions(
                block.timestamp,
                dilutionsFROM[i],
                dilutionsTO[i],
                dilutionsAMOUNT[i]
            );
            unchecked {
                ++i;
            }
        }
        unchecked {
            proposalsCount++;
        }

        emit AddProposal(
            msg.sender,
            proposalsCount - 1,
            data,
            totalProposedDilutions
        );
    }

    function approveProposal(
        uint256 proposalId
    ) external proposalExists(proposalId) {
        require(approved[proposalId][msg.sender] == false, "Already approved");
        approved[proposalId][msg.sender] = true;
        proposals[proposalId].approvals++;

        emit ApproveProposal(msg.sender, proposalId);
    }

    function revokeProposal(
        uint256 proposalId
    ) external proposalExists(proposalId) {
        require(approved[proposalId][msg.sender] == true, "Not approved");
        approved[proposalId][msg.sender] = false;

        emit RevokeProposal(msg.sender, proposalId);
    }

    function executeProposal(
        uint256 proposalId
    ) external proposalExists(proposalId) enoughApprovals(proposalId) {
        require(
            proposals[proposalId].executed == false,
            "Proposal already executed"
        );

        proposals[proposalId].executed = true;

        uint256 total = proposals[proposalId].totalProposedDilutions;

        // shareHolders[shareHoldersCount] = ShareHolder(
        //     shareHoldersCount,
        //     msg.sender,
        //     total
        // );
        // unchecked {
        //     shareHoldersCount++;
        // }

        for (uint256 i = 0; i < total; ) {
            Dilutions memory dilution = proposedDilutions[proposalId][i];

            shareHolders[shareHoldersCount] = ShareHolder(
                shareHoldersCount,
                dilution.to,
                dilution.amount * (10 ** decimals())
            );

            _transfer(
                dilution.from,
                dilution.to,
                dilution.amount * (10 ** decimals())
            );
            unchecked {
                ++i;
                ++shareHoldersCount;
            }
        }

        emit ExecuteProposal(msg.sender, proposalId);
    }

    function updateProposal(
        uint256 proposalId,
        bytes calldata data,
        Dilutions[] calldata newShareDistribution
    ) external proposalExists(proposalId) {
        require(
            proposals[proposalId].owner == msg.sender,
            "Not the owner of the proposal"
        );
        require(data.length > 0, "Invalid data");
        proposals[proposalId].data = data;

        for (uint256 i = 0; i < newShareDistribution.length; ) {
            proposedDilutions[proposalsCount][i] = newShareDistribution[i];
            unchecked {
                ++i;
            }
        }

        emit UpdateProposal(
            msg.sender,
            proposalId,
            data,
            newShareDistribution.length
        );
    }

    function getProposal(
        uint256 proposalId
    ) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getDilutionsForProposal(
        uint256 proposalId
    ) external view returns (Dilutions[] memory) {
        Dilutions[] memory dilutions = new Dilutions[](
            proposals[proposalId].totalProposedDilutions
        );
        for (
            uint256 i = 0;
            i < proposals[proposalId].totalProposedDilutions;

        ) {
            dilutions[i] = proposedDilutions[proposalId][i];
            unchecked {
                ++i;
            }
        }
        return dilutions;
    }

    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory _proposals = new Proposal[](proposalsCount);
        for (uint256 i = 0; i < proposalsCount; ) {
            _proposals[i] = proposals[i];
            unchecked {
                ++i;
            }
        }
        return _proposals;
    }

    function getAllShareHolders() external view returns (ShareHolder[] memory) {
        ShareHolder[] memory _shareHolders = new ShareHolder[](
            shareHoldersCount
        );
        for (uint256 i = 0; i < shareHoldersCount; ) {
            _shareHolders[i] = shareHolders[i];
            unchecked {
                ++i;
            }
        }
        return _shareHolders;
    }
}
