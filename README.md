# Beacon Wallet List

Centralized wallet registry for the [Beacon SDK](https://github.com/airgap-it/beacon-sdk). This repository maintains a curated list of Tezos and Substrate wallets with their metadata, logos, and platform support information.

## Overview

The Beacon Wallet List enables dynamic wallet updates without requiring SDK releases. Wallet data is served via jsDelivr CDN with automatic fallback to bundled data in the SDK.

## How to Add or Update a Wallet

### 1. Add/Update Wallet Definition

Edit the appropriate JSON file in `src/`:

**For Tezos wallets:** `src/tezos.json`
**For Substrate wallets:** `src/substrate.json`
**For Tezos Sapling wallets:** `src/tezos-sapling.json`

**Example wallet entry:**

```json
{
  "key": "my_wallet_ios",
  "name": "My Wallet",
  "shortName": "MyWallet",
  "color": "#FF5733",
  "logo": "tezos_my-wallet.png",
  "universalLink": "https://mywallet.com",
  "deepLink": "mywallet://",
  "supportedInteractionStandards": ["wallet_connect", "beacon"]
}
```

**Wallet Types:**

- **Extension**: Browser extension (Chrome/Firefox)
- **Desktop**: Desktop application
- **iOS/Mobile**: Mobile app
- **Web**: Web-based wallet

**Required Fields:**
- `key`: Unique identifier (e.g., `temple_chrome`, `kukai_ios`)
- `name`: Full wallet name
- `shortName`: Display name
- `logo`: Filename in logos/ folder (with blockchain prefix: `tezos_`, `substrate_`)

**Optional Fields:**
- `deprecated`: Set to `true` for wallets no longer maintained
- `color`: Brand color (hex code)
- `supportedInteractionStandards`: `["wallet_connect"]`, `["beacon"]`, or both

### 2. Add Wallet Logo

Add the logo file to the `logos/` directory with the naming convention:

**Format:** `{blockchain}_{wallet-identifier}.{png|svg}`

**Examples:**
- `tezos_temple.png`
- `substrate_nova.png`
- `tezos_exodus.svg`

**Requirements:**
- PNG: 256x256px (will be auto-resized if larger)
- SVG: Any size
- Keep file size reasonable (<100KB recommended)

### 3. Test Locally

```bash
npm run build
```

This generates `dist/` files with embedded base64 logos. Verify the output looks correct.

### 4. Submit Pull Request

**Commit only src/ and logos/ changes:**

```bash
git add src/ logos/
git commit -m "feat: add MyWallet support"
git push origin your-branch-name
```

**Note:** Do NOT commit `dist/` files - CI will generate them automatically!

**PR Description should include:**
- Wallet name and type
- Supported platforms
- Links to wallet website/documentation
- Any special notes

### 5. Automated Process

Once your PR is merged:
1. ✅ CI builds `dist/` with base64 logos
2. ✅ CI commits `dist/` to main branch
3. ✅ CI creates GitHub release
4. ✅ CI purges jsDelivr CDN cache
5. ✅ Beacon SDK users get updates automatically (no SDK update needed!)

## Deprecating a Wallet

To mark a wallet as no longer maintained:

1. Edit `src/{blockchain}.json`
2. Add `"deprecated": true` to the wallet entry
3. Submit PR

Deprecated wallets:
- **Extensions**: Hidden if not installed, shown only if user already has it
- **Desktop/Mobile/Web**: Shown with warning message, download buttons removed

## Build Process

```bash
npm run build
```

This script:
1. Reads JSON from `src/`
2. Reads images from `logos/`
3. Resizes PNGs to 256x256
4. Converts all logos to base64
5. Outputs to `dist/` with embedded logos

## CI/CD Workflow

**On push to main:**
1. Build dist/ files
2. Auto-commit dist/ to git (for jsDelivr)
3. Create GitHub releases (versioned + latest)
4. Purge jsDelivr CDN cache

## Distribution

**jsDelivr CDN (for runtime):**
```
https://cdn.jsdelivr.net/gh/airgap-it/beacon-wallet-list@v1.0.0-latest/dist/tezos.json
```

**GitHub Releases (for SDK bundling):**
```
https://github.com/airgap-it/beacon-wallet-list/releases/latest/download/tezos.json
```

## Pre-commit Hook

A pre-commit hook prevents manual commits to `dist/`. If you accidentally stage dist/ files:

```bash
git reset dist/
```

Only edit `src/` and `logos/` - CI handles the rest!

## License

ISC License - see [LICENSE](LICENSE) file for details.
