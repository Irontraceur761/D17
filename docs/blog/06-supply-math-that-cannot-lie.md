# Supply math that cannot lie

*D17 blog · 06 · tokenomics enforcement*

Read enough token launch pages and you develop a reflex: find the pie chart, then find the footnote that contradicts it. "Team: 5%*" — asterisk — "*additional advisor allocation TBD." Tokenomics, as usually practiced, is a genre of creative writing.

D17 makes it arithmetic, checked by a machine that refuses bad answers.

## The split must be exact

A D17 launch declares its supply split at deploy: how many tokens are for **sale** to committers, how many seed the **liquidity pool**, how many the **creator** keeps, and how many are **burned**. The factory then checks one unforgiving equation:

```
sale + LP + creator + burned = total supply
```

Not approximately. Not "at least." Exactly — to the token. A configuration that's off by one unit is rejected before anything deploys. There is no unallocated remainder for anyone to quietly claim later, because the launch literally cannot exist unless every token has a declared destination.

The terminal mirrors this at the design level: on the deploy page, **BURNED is computed, never typed**. You enter sale, LP, and creator; whatever's left burns. The interface makes the honest structure the only structure you can express.

## The caps nobody can negotiate

Beyond the split, the factory enforces hard ceilings on the numbers that most tempt abuse:

| Parameter | Cap | What it prevents |
|---|---|---|
| Creator's own allocation | **10%** of supply | The launch that's mostly a gift to its deployer |
| Treasury cut of the raise | **20%** of ETH | The "sale" that's mostly a fee |
| Refund deflection | **50%** | The exit fee that's really a wall |

These aren't policies or community guidelines. They're `require` statements. A launch violating any of them doesn't get flagged or reviewed — it simply never deploys, no matter who submits it or why.

## Immutable means immutable

Every one of these numbers is fixed in the launch's constructor. After deploy there is no function — for the creator, the platform, or anyone — that adjusts an allocation, raises the treasury cut, or revises the refund fee. The one-time mint happens at deploy, minting **closes**, and the token's ownership is **renounced** in the same transaction. There is no "mint more later." There is no later.

## Why burned tokens matter here

Burning the remainder isn't ceremony. Unsold supply concentrated in a treasury is an overhang — a silent promise that someone can dilute the market whenever it suits them. Sending the remainder to the dead address converts that overhang into arithmetic everyone can price. Even mid-launch, if sale rounds don't fully place, the unsold portion follows the launch's declared policy — burn, or a visible transfer to the published treasury — rather than lingering ambiguously.

The theme, once you see it, is everywhere in the suite: **replace disclosure with impossibility.** Don't ask participants to read the footnotes. Build a factory where the footnotes can't compile.

---

*The mechanics: the factory validates `saleTokens + lpTokens + creatorAllocation + burnedTokens == totalSupply` exactly, caps creator allocation at 10%, treasury at 20%, and refund penalty at 50%; all are immutable post-deploy; minting closes and token ownership is renounced in the deploy transaction.*
