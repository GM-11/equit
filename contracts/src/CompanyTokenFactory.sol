// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "./CompanyToken.sol";

contract CompanyTokenFactory {
    mapping(uint256 => address) public companyTokens;
    uint256 public companyTokensCount;

    event CompanyTokenCreated(
        address indexed owner,
        address indexed companyToken
    );

    function createCompanyToken(
        string memory name,
        string memory symbol,
        address owner,
        uint256 minRequired
    ) public {
        require(
            companyTokens[companyTokensCount] == address(0),
            "CompanyTokenFactory: token already exists"
        );

        CompanyToken companyToken = new CompanyToken(
            name,
            symbol,
            owner,
            minRequired
        );
        companyTokens[companyTokensCount] = address(companyToken);

        unchecked {
            companyTokensCount++;
        }

        emit CompanyTokenCreated(owner, address(companyToken));
    }

    function getCompanyToken(uint256 tokenId) public view returns (address) {
        return companyTokens[tokenId];
    }

    function getAllCompanyTokens() public view returns (address[] memory) {
        address[] memory tokens = new address[](companyTokensCount);
        uint256 _total = companyTokensCount;
        for (uint256 i = 0; i < _total; ) {
            tokens[i] = companyTokens[i];
            unchecked {
                ++i;
            }
        }
        return tokens;
    }
}
