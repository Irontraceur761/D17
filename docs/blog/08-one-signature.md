# One signature

*D17 blog · 08 · deploying a launch*

Launching a token, as commonly practiced, is a small DevOps project. Deploy the token. Deploy the sale. Wire them together. Set the parameters — carefully, across several transactions, each one a chance to fat-finger something immutable. Then explain to your community why they should believe you did all of it right.

On D17, launching a token is **one page and one signature.**

## What the signature buys

When you sign a D17 deploy, the factory executes the entire birth of a launch atomically:

1. **Validates everything.** The supply split must sum exactly; the treasury cut, creator allocation, and refund fee must sit under their caps; the round schedule must be coherent. A config that fails any check deploys nothing.
2. **Deploys the trio.** Token, launch, and liquidity vault come into existence together, wired to each other and to nothing else.
3. **Mints once, then never again.** Sale and LP tokens go to the launch, the creator's allocation goes to the creator, and the dead-address allocation goes directly to the canonical dead address — then minting **closes** and token ownership is **renounced**, inside the same transaction.
4. **Registers the launch as canonical.** From this moment, lockers can verify it's real.

There is no step two. There's no window between "token exists" and "rules apply" for anything to slip through — the launch is born complete, constrained, and ownerless, or it isn't born at all.

## The form can't express a dishonest launch

The deploy page mirrors the contract's discipline. **DEAD ADDRESS is computed, never entered** — you allocate sale, LP, and your own slice; the remainder goes to the canonical dead address, so the split always sums. That initial allocation is not described as a burn because it does not reduce ERC-20 `totalSupply`. Validation is a ladder, not a dead button: if something's wrong, the page names it — a missing field, an over-cap value, a start time in the past — using the factory's own published limits, before you spend gas discovering them.

And beside the form, the entire time: a **live preview of your launch page**, rendered with the terminal's real components. The deployed metadata can later earn the terminal's consistency mark when the token, launch, factory event, and contract URI agree. The locker performs the separate economic-rules check.

Before your wallet ever opens, the page **simulates the deployment** against a public node. If the factory would reject your config, you find out in seconds, for free — not after signing.

## What you give up, and why it's the point

Deploying on D17 means accepting what you *can't* do afterward. You can't mint more. You can't adjust the split. You can't raise the treasury cut, extend a round, or pull the liquidity. Your own allocation is capped at 10% and visible in the masthead forever.

That list reads like a sacrifice until you realize it's the product. Every lever you surrender is a suspicion your participants no longer need to hold. The one-signature deploy isn't just convenient — it's the moment a creator converts their promises into constraints, publicly, all at once.

You sign once. After that, the rules run the launch — including for you.

---

*The mechanics: `createLaunch` validates the full config, deploys token + launch + vault atomically, performs the one-time mint, closes minting, renounces token ownership, and registers the launch as canonical — one transaction; the deploy page simulates via public RPC before requesting the signature.*
