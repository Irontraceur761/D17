# The exit is part of the design

*D17 blog · 03 · refunds & deflection*

The most telling question you can ask any token sale is: *what happens if I change my mind?*

Most mechanisms answer with silence. Once you're in, you're in; your exit is whatever the secondary market gives you, whenever it exists. D17 answers with a schedule, published before round 1 opens and enforced by the contract:

| When you leave | What it costs |
|---|---|
| Refund window after round 1 or 2 | **Free** |
| Refund window after round 3 or 4 | The launch's published **deflection** fee |
| Round 5 | No refund window |
| The launch **fails** its floor | **Free — everyone, in full** |

## Why windows at all

Because commitment without an exit isn't conviction — it's capture. A refund window after every early round means the sale's momentum is real: everyone still in a launch at round 3 is someone who had two free chances to leave and didn't. That's information. A raise total built from trapped money tells you nothing; one built from people who could walk tells you a lot.

## Why leaving gets more expensive

The deflection fee isn't a punishment; it's a stabilizer, and it solves a specific attack. Without it, a whale could commit heavily in early rounds to inflate the anchor and the apparent momentum, wait for others to pile in on the strength of those numbers, then yank everything out at the last window — leaving real participants holding a distorted price. Charging a published percentage on late exits makes that manipulation cost real money.

Two design choices keep it honest:

- **The fee is fixed at deploy and capped by the factory.** A creator picks the deflection rate (the common preset is 17%), the factory refuses anything above 50%, and the number is immutable from then on. It's on the launch page before you commit your first wei.
- **You see the cost before you sign.** The terminal states the exact charge on the refund button — "free" or the percentage — before your wallet opens. No fine print, no discovering the fee in a transaction trace.

Where does the fee go? To the launch's treasury — the same published address taking the launch's declared ETH cut. Not to the platform, not to a hidden sink.

## The failure case is the cleanest case

If a launch never clears its floor, all of this machinery steps aside. **Failed launch, full refund** — every participant, every round, no deflection, no argument. The contract exposes it as a permanent right: there is no deadline on withdrawing from a failed launch, and no one's approval is needed.

A launch mechanism reveals its values in how it treats the people who leave. D17's answer: early doubt is free, late churn pays a posted price, and a failed launch pays everyone back to the wei.

---

*The mechanics: rounds 1–2 refund penalty-free; rounds 3–4 charge the launch's immutable `refundPenaltyBps` (preset 17%, factory cap 50%), forwarded to the treasury; round 5 has no window; failed launches refund in full via a permanent, penalty-free path.*
