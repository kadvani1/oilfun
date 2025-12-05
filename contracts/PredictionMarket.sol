// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PredictionMarketAMM
 * @notice Prediction market with dynamic odds based on pool liquidity
 * @dev Optimized for BSC mainnet
 * 
 * HOW IT WORKS:
 * =============
 * 1. Users bet USDC on YES or NO outcomes
 * 2. Share price = Opposite Side Stake / Total Stake
 * 3. Lower price (underdog) = More shares for same USDC
 * 4. At resolution, entire pool is distributed to winners proportionally
 * 
 * DYNAMIC RETURNS:
 * ================
 * Returns are NOT fixed - they depend on final pool liquidity.
 * 
 * Example:
 * - Pool has 1000 USDC on YES, 200 USDC on NO
 * - NO price = 1000/1200 = 83% (high odds, fewer shares per USDC)
 * - YES price = 200/1200 = 17% (low odds, more shares per USDC)
 * - If you bet 100 USDC on YES at 17%, you get MORE shares
 * - If YES wins, you get a bigger slice of the 1200 USDC pool
 * 
 * The earlier you bet on the underdog, the more shares you accumulate,
 * and the bigger your share of the final pool when you win.
 */
contract PredictionMarketAMM is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Custom Errors ============
    error Unauthorized();
    error InvalidAddress();
    error InvalidQuestionId();
    error InvalidAmount();
    error MarketClosed();
    error MarketNotClosed();
    error MarketResolved();
    error MarketNotResolved();
    error InsufficientShares();
    error InsufficientLiquidity();
    error InvalidPrice();
    error AlreadyClaimed();
    error NoWinnings();
    error NoWinningShares();

    // ============ Constants ============
    uint256 private constant SCALING_FACTOR = 1e18;

    // ============ Immutables ============
    IERC20 public immutable usdc;
    address public immutable owner;

    // ============ Storage ============
    uint256 public totalQuestions;

    struct Question {
        uint128 totalYesStake;   // Total USDC staked on YES
        uint128 totalNoStake;    // Total USDC staked on NO
        uint128 totalYesShares;  // Total YES shares issued
        uint128 totalNoShares;   // Total NO shares issued
        uint64 endTimestamp;
        bool eventCompleted;
        bool outcome;
        string question;
        string description;
        string resolverUrl;
    }

    mapping(uint256 => Question) public questions;
    mapping(uint256 => mapping(address => uint128)) public userYesShares;
    mapping(uint256 => mapping(address => uint128)) public userNoShares;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // ============ Events ============
    event QuestionCreated(
        uint256 indexed id, 
        string question, 
        uint64 endTimestamp
    );
    event SharesBought(
        uint256 indexed id, 
        address indexed user, 
        bool indexed isYes, 
        uint128 cost, 
        uint128 shares
    );
    event SharesSold(
        uint256 indexed id, 
        address indexed user, 
        bool indexed isYes, 
        uint128 received, 
        uint128 shares
    );
    event MarketResolved(uint256 indexed id, bool outcome);
    event WinningsClaimed(
        uint256 indexed id, 
        address indexed user, 
        uint256 payout
    );

    // ============ Constructor ============
    /**
     * @param _usdcAddress USDC token address
     * @dev BSC USDC: 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
     */
    constructor(address _usdcAddress) {
        if (_usdcAddress == address(0)) revert InvalidAddress();
        usdc = IERC20(_usdcAddress);
        owner = msg.sender;
    }

    // ============ Modifiers ============
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ============ View Functions ============

    /**
     * @notice Get current YES share price based on pool liquidity
     * @dev Price = NoStake / TotalStake
     * 
     * When YES has less liquidity (underdog):
     * - YES price is LOW
     * - You get MORE shares per USDC
     * - Bigger slice of final pool if you win
     */
    function getYesSharePrice(uint256 _questionId) public view returns (uint256 price) {
        Question storage q = questions[_questionId];
        uint256 totalStake = uint256(q.totalYesStake) + uint256(q.totalNoStake);
        
        if (totalStake == 0) {
            return SCALING_FACTOR / 2; // 50% when pool is empty
        }
        
        unchecked {
            price = (uint256(q.totalNoStake) * SCALING_FACTOR) / totalStake;
        }
    }

    /**
     * @notice Get current NO share price based on pool liquidity
     */
    function getNoSharePrice(uint256 _questionId) public view returns (uint256 price) {
        unchecked {
            price = SCALING_FACTOR - getYesSharePrice(_questionId);
        }
    }

    /**
     * @notice Get user's share percentage of a side
     * @return yesPercent User's % of YES shares (scaled by 1e18)
     * @return noPercent User's % of NO shares (scaled by 1e18)
     */
    function getUserSharePercentage(
        uint256 _questionId,
        address _user
    ) external view returns (uint256 yesPercent, uint256 noPercent) {
        Question storage q = questions[_questionId];
        
        if (q.totalYesShares > 0) {
            yesPercent = (uint256(userYesShares[_questionId][_user]) * SCALING_FACTOR) / q.totalYesShares;
        }
        if (q.totalNoShares > 0) {
            noPercent = (uint256(userNoShares[_questionId][_user]) * SCALING_FACTOR) / q.totalNoShares;
        }
    }

    /**
     * @notice Calculate potential payout based on current pool state
     * @dev This is an ESTIMATE - actual payout depends on final pool at resolution
     */
    function estimatePayout(
        uint256 _questionId,
        address _user,
        bool _forYes
    ) external view returns (uint256 potentialPayout) {
        Question storage q = questions[_questionId];
        
        uint256 userShares = _forYes 
            ? userYesShares[_questionId][_user] 
            : userNoShares[_questionId][_user];
        
        uint256 totalWinningShares = _forYes ? q.totalYesShares : q.totalNoShares;
        
        if (totalWinningShares == 0 || userShares == 0) return 0;
        
        uint256 totalPool = uint256(q.totalYesStake) + uint256(q.totalNoStake);
        
        unchecked {
            potentialPayout = (userShares * totalPool) / totalWinningShares;
        }
    }

    /**
     * @notice Preview how many shares you'd get for an amount
     * @return shares Number of shares you'd receive
     * @return shareOfPool Your % of that side's shares after purchase
     */
    function previewBuy(
        uint256 _questionId,
        uint128 _amount,
        bool _isYes
    ) external view returns (uint128 shares, uint256 shareOfPool) {
        Question storage q = questions[_questionId];
        
        uint256 price = _isYes ? getYesSharePrice(_questionId) : getNoSharePrice(_questionId);
        if (price == 0) return (0, 0);
        
        unchecked {
            shares = uint128((uint256(_amount) * SCALING_FACTOR) / price);
        }
        
        uint256 totalShares = _isYes 
            ? uint256(q.totalYesShares) + shares 
            : uint256(q.totalNoShares) + shares;
            
        if (totalShares > 0) {
            shareOfPool = (uint256(shares) * SCALING_FACTOR) / totalShares;
        }
    }

    /**
     * @notice Get user's shares for a market
     */
    function getUserShares(
        uint256 _questionId, 
        address _user
    ) external view returns (uint128 yesShares, uint128 noShares) {
        yesShares = userYesShares[_questionId][_user];
        noShares = userNoShares[_questionId][_user];
    }

    /**
     * @notice Get market info including pool liquidity
     */
    function getMarketInfo(uint256 _questionId) external view returns (
        uint128 totalYesStake,
        uint128 totalNoStake,
        uint128 totalYesShares,
        uint128 totalNoShares,
        uint256 yesPrice,
        uint256 noPrice,
        uint64 endTimestamp,
        bool isResolved,
        bool outcome
    ) {
        Question storage q = questions[_questionId];
        return (
            q.totalYesStake,
            q.totalNoStake,
            q.totalYesShares,
            q.totalNoShares,
            getYesSharePrice(_questionId),
            getNoSharePrice(_questionId),
            q.endTimestamp,
            q.eventCompleted,
            q.outcome
        );
    }

    function isAdmin() external view returns (bool) {
        return msg.sender == owner;
    }

    // ============ Write Functions ============

    /**
     * @notice Create a new prediction market
     */
    function createQuestion(
        string calldata _question,
        string calldata _description,
        string calldata _resolverUrl,
        uint64 _endTimestamp
    ) external onlyOwner returns (uint256 questionId) {
        questionId = totalQuestions;
        
        Question storage q = questions[questionId];
        q.question = _question;
        q.description = _description;
        q.resolverUrl = _resolverUrl;
        q.endTimestamp = _endTimestamp;
        
        unchecked {
            ++totalQuestions;
        }
        
        emit QuestionCreated(questionId, _question, _endTimestamp);
    }

    /**
     * @notice Buy shares for YES or NO outcome
     * 
     * KEY CONCEPT: Lower price = More shares = Bigger slice of pool
     * 
     * When you bet on the underdog (side with less liquidity):
     * - The price is lower
     * - You receive more shares for your USDC
     * - If your side wins, you get a bigger % of the total pool
     * 
     * The return is based entirely on:
     * 1. How many shares you hold
     * 2. Total shares on the winning side
     * 3. Total pool (YES stake + NO stake)
     */
    function buyShares(
        uint256 _questionId, 
        bool _isYes, 
        uint128 _value
    ) external nonReentrant {
        if (_questionId >= totalQuestions) revert InvalidQuestionId();
        if (_value == 0) revert InvalidAmount();
        
        Question storage q = questions[_questionId];
        if (block.timestamp >= q.endTimestamp) revert MarketClosed();
        if (q.eventCompleted) revert MarketResolved();

        // Price based on current liquidity
        uint256 sharePrice = _isYes ? getYesSharePrice(_questionId) : getNoSharePrice(_questionId);
        if (sharePrice == 0) revert InvalidPrice();

        // Lower price = more shares
        uint128 sharesReceived;
        unchecked {
            sharesReceived = uint128((uint256(_value) * SCALING_FACTOR) / sharePrice);
        }

        // Transfer USDC to pool
        usdc.safeTransferFrom(msg.sender, address(this), _value);

        // Update pool state
        if (_isYes) {
            unchecked {
                q.totalYesStake += _value;
                q.totalYesShares += sharesReceived;
                userYesShares[_questionId][msg.sender] += sharesReceived;
            }
        } else {
            unchecked {
                q.totalNoStake += _value;
                q.totalNoShares += sharesReceived;
                userNoShares[_questionId][msg.sender] += sharesReceived;
            }
        }

        emit SharesBought(_questionId, msg.sender, _isYes, _value, sharesReceived);
    }

    /**
     * @notice Sell shares back to the pool at current price
     */
    function sellShares(
        uint256 _questionId, 
        bool _isYes, 
        uint128 _sharesToSell
    ) external nonReentrant {
        if (_questionId >= totalQuestions) revert InvalidQuestionId();
        if (_sharesToSell == 0) revert InvalidAmount();
        
        Question storage q = questions[_questionId];
        if (block.timestamp >= q.endTimestamp) revert MarketClosed();
        if (q.eventCompleted) revert MarketResolved();

        uint128 currentShares = _isYes 
            ? userYesShares[_questionId][msg.sender] 
            : userNoShares[_questionId][msg.sender];
        if (currentShares < _sharesToSell) revert InsufficientShares();

        uint256 sharePrice = _isYes ? getYesSharePrice(_questionId) : getNoSharePrice(_questionId);
        uint128 refundAmount;
        unchecked {
            refundAmount = uint128((uint256(_sharesToSell) * sharePrice) / SCALING_FACTOR);
        }

        uint128 maxRefund = _isYes ? q.totalYesStake : q.totalNoStake;
        if (refundAmount > maxRefund) revert InsufficientLiquidity();

        if (_isYes) {
            unchecked {
                userYesShares[_questionId][msg.sender] = currentShares - _sharesToSell;
                q.totalYesShares -= _sharesToSell;
                q.totalYesStake -= refundAmount;
            }
        } else {
            unchecked {
                userNoShares[_questionId][msg.sender] = currentShares - _sharesToSell;
                q.totalNoShares -= _sharesToSell;
                q.totalNoStake -= refundAmount;
            }
        }

        usdc.safeTransfer(msg.sender, refundAmount);

        emit SharesSold(_questionId, msg.sender, _isYes, refundAmount, _sharesToSell);
    }

    /**
     * @notice Resolve market with final outcome
     */
    function resolveMarket(
        uint256 _questionId, 
        bool _outcomeIsYes
    ) external onlyOwner {
        Question storage q = questions[_questionId];
        if (q.eventCompleted) revert MarketResolved();
        if (block.timestamp < q.endTimestamp) revert MarketNotClosed();

        q.eventCompleted = true;
        q.outcome = _outcomeIsYes;

        emit MarketResolved(_questionId, _outcomeIsYes);
    }

    /**
     * @notice Claim winnings after market resolution
     * 
     * PAYOUT FORMULA:
     * ===============
     * payout = (yourShares / totalWinningShares) * totalPool
     * 
     * Where totalPool = YES stake + NO stake
     * 
     * If you entered when your side was the underdog (low liquidity),
     * you got more shares, so you get a bigger slice of the pool.
     */
    function claimWinnings(uint256 _questionId) external nonReentrant {
        Question storage q = questions[_questionId];
        if (!q.eventCompleted) revert MarketNotResolved();
        if (hasClaimed[_questionId][msg.sender]) revert AlreadyClaimed();

        bool outcomeIsYes = q.outcome;
        
        uint128 userSharesAmount = outcomeIsYes 
            ? userYesShares[_questionId][msg.sender] 
            : userNoShares[_questionId][msg.sender];
        if (userSharesAmount == 0) revert NoWinnings();

        uint128 totalWinningShares = outcomeIsYes ? q.totalYesShares : q.totalNoShares;
        if (totalWinningShares == 0) revert NoWinningShares();

        // Entire pool goes to winners
        uint256 totalPool = uint256(q.totalYesStake) + uint256(q.totalNoStake);
        
        // Your payout = your share of the winning side's shares × total pool
        uint256 payout;
        unchecked {
            payout = (uint256(userSharesAmount) * totalPool) / uint256(totalWinningShares);
        }

        hasClaimed[_questionId][msg.sender] = true;
        usdc.safeTransfer(msg.sender, payout);

        emit WinningsClaimed(_questionId, msg.sender, payout);
    }

    // ============ Emergency Functions ============

    function emergencyWithdraw(
        address _token, 
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).safeTransfer(owner, _amount);
    }
}
