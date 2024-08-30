// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "./CompanyToken.sol";

contract CompanyTokenFactory {
    struct CompanyTokenData {
        string name;
        string symbol;
        address owner;
        address companyToken;
    }

    mapping(uint256 => CompanyTokenData) public companyTokens;
    uint256 public companyTokensCount;

    event CompanyTokenCreated(
        address indexed owner,
        address indexed companyToken
    );

    function createCompanyToken(
        string memory name,
        string memory symbol,
        uint256 minRequired
    ) external {
        CompanyToken companyToken = new CompanyToken(
            name,
            symbol,
            msg.sender,
            minRequired
        );
        companyTokens[companyTokensCount] = CompanyTokenData(
            name,
            symbol,
            msg.sender,
            address(companyToken)
        );

        unchecked {
            companyTokensCount++;
        }

        emit CompanyTokenCreated(msg.sender, address(companyToken));
    }

    function getCompanyToken(uint256 tokenId) external view returns (address) {
        return companyTokens[tokenId].companyToken;
    }

    function getAllCompanyTokens()
        external
        view
        returns (CompanyTokenData[] memory)
    {
        CompanyTokenData[] memory tokens = new CompanyTokenData[](
            companyTokensCount
        );
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
