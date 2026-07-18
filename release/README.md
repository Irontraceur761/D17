# Build and deployment evidence

This directory contains machine-readable evidence for the public contract
suite included in D17 release 1.0.0.

- `protocol-build.json` records compiler settings, source and ABI hashes,
  creation/deployed bytecode hashes, byte sizes and immutable references.
- `solc-input.json` is the Solidity standard JSON compiler input.
- `deployments/sepolia.json` and `deployments/mainnet.json` record the public
  deployment addresses, transactions, one-time factory wiring, ownership
  renunciation and runtime-code checks.

Regenerate the protocol manifest after compiling:

```bash
npm run compile -w @d17/contracts
npm run release:protocol
```

The generator rejects ABI or creation-bytecode drift from the published
artifacts. Identity literals containing `V14_1` remain because they are part of
the deployed contracts' immutable identity checks.
