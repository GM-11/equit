// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Test, console} from "forge-std/Test.sol";
import {CompanyToken} from "../src/CompanyToken.sol";

contract CompanyTokenTest is Test {
    CompanyToken public companyToken;

    struct Proposal {
        address owner;
        bytes data;
        bool executed;
        uint256 timestamp;
        uint256 approvals;
        uint256 totalProposedDilutions;
        // Dilutions[] newShareDistribution;
    }

    function setUp() public {
        companyToken = new CompanyToken(
            "CompanyToken",
            "CT",
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            3
        );
    }

    function testshareHoldersCount() public view {
        assertEq(companyToken.shareHoldersCount(), 1);
    }

    function testProposalCount() public view {
        assertEq(companyToken.proposalsCount(), 0);
    }

    function testMinRequried() public view {
        assertEq(companyToken.MIN_REQUIRED(), 3);
    }

    function testBalanceOf() public view {
        assertEq(
            companyToken.balanceOf(
                address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
            ),
            100 * (10 ** companyToken.decimals())
        );
    }

    function testAddProposal() public {
        address[] memory dilutionsTO = new address[](1);
        dilutionsTO[0] = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        uint256[] memory dilutionsAmount = new uint256[](1);
        dilutionsAmount[0] = 50 * (10 ** companyToken.decimals());
        address[] memory dilutionsFROM = new address[](1);
        dilutionsFROM[0] = address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);

        companyToken.addProposal(
            "CompanyToken",
            "{`from`:{`initial`:100,`final`:50,`address`:`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`},`to`:{`initial`:0,`final`:50,`address`:`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`}}",
            dilutionsTO,
            dilutionsFROM,
            dilutionsAmount,
            1
        );

        assertEq(companyToken.proposalsCount(), 1);
    }
}
