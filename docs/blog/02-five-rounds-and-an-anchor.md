# Five rounds and an anchor: how the price finds itself

*D17 blog · 02 · price discovery*

Most token sales pick a price and hope. The creator guesses what the market will bear; the market punishes the guess in one direction or the other. Price too low and insiders scoop the discount; too high and the sale dies quietly.

A D17 launch does not hard-code one final sale price. It **discovers** the sale outcome, in public, over five timed rounds. The creator still chooses the token allocation, minimum anchor requirements, and schedule before deployment.

## Round one is the vote

Round 1 is the anchor round. Committers put WETH in against a fixed slice of the sale allocation, and when the round closes, the ratio of *money committed* to *tokens allocated* becomes the launch's **anchor price**. The creator chose the allocation and minimums; the resulting ratio comes from actual commitments.

That single number then disciplines everything that follows.

## Rounds two through four build on the anchor

Each subsequent round offers its own allocation of tokens at targets derived from the anchor. The effect is that the sale's economics are set by its earliest, most-committed participants — not by the creator's optimism and not by whoever shows up last with the biggest bag.

Because the schedule is fixed and published before round 1 opens — allocations per round, lengths, refund windows — there's no lever for anyone to pull once price discovery begins. The creator watches like everyone else.

## Round five absorbs the remainder

Real sales are lumpy. Some rounds oversubscribe, some fall short. Rather than pretending otherwise, the final round is built to **absorb rollover**: allocation that earlier rounds didn't place flows into round 5. It's the launch's shock absorber — the mechanism that lets a launch wobble in the middle and still land cleanly, at a price the whole run of rounds justified.

## Why this beats a fixed price

- **No hidden presale price inside the round mechanism.** Any creator allocation is a separate, capped, visible part of the supply split.
- **No stale guess.** A price set weeks before launch can't respond to the market. An anchor set by round 1 is, by construction, current.
- **The anchor requirements are explicit.** If round 1 does not meet the published minimum raise and minimum anchor price, the launch **fails** and remaining commitments can be reclaimed in full, without penalty. Participants still pay their own transaction gas.

The quiet radical idea here is that a launch's price is a *finding*, not a *setting*. Five rounds is how long D17 gives the market to speak — and the contract writes down exactly what it heard.

---

*The mechanics: 5 fixed rounds; round 1 sets the anchor price, rounds 2–4 run anchor-derived targets, round 5 absorbs rollover; per-round shares are set at deploy and sum to 100% of the sale allocation. A launch that misses its round-1 anchor requirements provides a permanent penalty-free refund path.*
