# Liquidity that cannot leave

*D17 blog · 05 · the vault & the trading gate*

The rug pull has a precise anatomy. A token launches, a pool is seeded, price discovery begins — and then the deployer, who holds the LP tokens, withdraws the liquidity. The pool empties, the chart goes vertical in the wrong direction, and everyone else discovers they were providing exit liquidity for one wallet.

D17's response is architectural: **the LP tokens are never in anyone's hands.**

## The vault holds the pool, forever

Every launch deploys with its own **liquidity vault** — a contract whose whole purpose is to create the official trading pool and then hold the resulting LP position permanently. When the launch settles, the LP share of the raise flows through the vault into the pool, and the LP tokens the pool mints land in the vault.

They don't leave. There is no withdraw function, no admin override, no timelock that eventually expires. The vault has no owner to renounce because it never had the power in the first place. The liquidity that backs the token's market is, by construction, locked from the moment it exists.

## The token can't front-run its own pool

Locked liquidity solves the ending of the rug; the **trading gate** solves the beginning. Before the official pool opens, the token itself refuses to move: transfers and burns are blocked for everyone, with the only exceptions being the launch's own seeding paths.

This closes a quieter exploit. Without a gate, anyone holding early tokens — a creator's allocation, a claimed settlement — could seed their *own* pool before the official one, set a fake price, and harvest the confusion. On D17, until **TRADING OPEN**, there is nothing to trade anywhere, for anyone. The official pool is necessarily the first market, and its opening price is the one the five rounds discovered.

## Late arrivals strengthen the pool, at the same terms

One more detail matters. Settlement never closes — a participant can claim months late — and when they do, their share of the raise **tops up the pool at the original launch ratio**. A reserved portion of the D17 token allocation intended for liquidity waits in the launch specifically for late settlers. The actual LP tokens are minted only when liquidity enters the pair, directly to the vault.

So the pool only ever deepens, latecomers can't skew its price, and nobody's procrastination becomes anybody's opportunity.

## Even pool creation trusts no one

Who presses the "create pool" button? Anyone. Once settlement conditions are met, pool creation is **permissionless** — the vault will build the official pool for whoever calls it, because everything that matters (which pair, how much of each asset, where the LP goes) is already determined by the contract. A creator who disappears after finalize can't strand a launch at the last step.

The pattern across all of it: don't ask the deployer to behave — remove the levers. No LP tokens to pull, no early market to fake, no button only insiders can press. The pool isn't protected by promises. It's protected by not having a door.

---

*The mechanics: the vault creates the official pool permissionlessly, holds all LP tokens with no withdrawal path, and mints late liquidity for late settlers at the creation ratio; the token blocks transfers and burns before trading opens, excepting the launch's own seeding paths.*
