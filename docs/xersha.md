# Xersha - Social crypto onboarding / Social finance

### Executive summary
Xersha transforms how friend groups save money by combining social feeds with collective crypto savings, supporting everything from vacation funds to investment clubs to community fundraisers. 

Built for the growing segment of social-first users who prefer exploring new financial tools with their trusted circles. 

By making DeFi social, we're turning financial growth from a solo journey into a shared adventure.

### Problem statement
Current situation: 
- DeFi platforms are built for individual users, creating an isolating experience for beginners
- Traditional group savings methods (like keeping cash with one person or using joint bank accounts) are either risky, inflexible, or offer minimal returns
- People interested in crypto often hesitate because they lack trusted peers to learn alongside

Pain points:
- Beginners feel overwhelmed navigating DeFi alone and fear making costly mistakes
- Friend groups wanting to save together have no good digital options that combine transparency, good yields, and social features
- Community fundraisers and investment clubs rely on outdated tools (spreadsheets, bank transfers) that lack engagement
- The "social proof" that drives adoption in other areas is missing from DeFi

Opportunity:
- Web3 adoption is at a tipping point, but needs social layers to reach mainstream users
- Gen Z and millennials already save and invest in groups (from splitting streaming services to group investing apps)
- Smart contracts can solve the trust issues that plague traditional group savings
- The infrastructure for social DeFi exists - it just needs the right user experience


### Solution overview
Core concept: 

Xersha solves the isolation of DeFi by creating shared savings circles where friends can pool funds, track progress together, and learn as a group. Using familiar social login (via Dynamic.xyz) and group chat interfaces, users join circles that match their goals, from saving for trips to rotating credit associations. Each circle has its own social feed where members celebrate milestones, an automated bot tracks contributions, and smart contracts ensure transparency and security. Users can choose between simple pooling or yield-generating strategies through integrated lending protocols, making DeFi as easy or advanced as the group wants. 

Key features (MVP): 
- Easy onboarding with social/email login - no wallet setup required 
- Three circle types: Goal-based savings, ROSCA/paluwagan, and ongoing DCA 
- Social feed per circle with automated contribution tracking and member comments 
- Smart contract security for ROSCA, Safe integration for flexible savings 
- Optional yield generation through lending protocols 
- Public circles for fundraising and community causes 

Nice-to-haves (if time permits): 
- Fiat onramp integration for direct bank transfers 
- Achievement badges for consistent savers 
- Templates for common goals (wedding, vacation, emergency fund) 
- Contribution reminders and nudges 
- Savings calculator showing potential yields 
- Export functionality for tax/record keeping
Technical architecture

### Tech stack:
- Frontend: React with React Router 7 (Progressive Web App)
- Social Layer: Lens Protocol for feeds, posts, and social graph
- Smart Contracts: Deployed on Citrea testnet
- Wallet Infrastructure: Safe for multisig functionality
- Authentication: Dynamic.xyz for social/email login
- Yield Generation: Nectra lending protocol
- Data Querying: Direct RPC calls (no indexer needed for MVP)
- Nice to have: EAS (Ethereum Attestation Service) for contribution attestations

System diagram:
[User] → [React PWA] → [Dynamic.xyz Auth]
                     ↓
              [Lens Protocol] ← Social features (Grove for content)
                     ↓
              [Smart Contracts on Citrea]
                     ↓
              [Safe Multisig] ← Savings/DCA circles
                     ↓
              [Nectra Protocol] ← Yield generation

External dependencies:
- Lens Protocol API + Grove for social features and content storage
- Dynamic.xyz for authentication
- Safe SDK for wallet creation and management
- Citrea testnet RPC endpoints
- Nectra protocol interfaces
- Web3 libraries (ethers.js/viem for direct contract calls)

