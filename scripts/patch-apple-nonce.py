from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SWIFT = ROOT / "node_modules" / "@capacitor-firebase" / "authentication" / "ios" / "Plugin" / "Handlers" / "AppleAuthProviderHandler.swift"

if not SWIFT.exists():
    raise SystemExit("AppleAuthProviderHandler.swift not found. Run npm install before ios:prepare.")

source = SWIFT.read_text()
# R7 deliberately keeps the plugin's official single-source nonce flow:
# native creates raw nonce -> sends SHA-256 to Apple -> returns raw nonce to JS.
required = [
    "let nonce = randomNonceString()",
    "currentNonce = nonce",
    "request.nonce = sha256(nonce)",
    "rawNonce: nonce",
    "nonce: nonce",
]
missing = [item for item in required if item not in source]
if missing:
    raise SystemExit("Unsupported Apple native nonce implementation: " + ", ".join(missing))

# Fail if an older Moleculox build has already inserted the cross-layer rawNonce patch.
forbidden = ['call.getString("rawNonce")', "startSignInWithAppleFlow(rawNonce:"]
found = [item for item in forbidden if item in source]
if found:
    raise SystemExit("Unexpected legacy Apple nonce patch remains: " + ", ".join(found))

print("Verified official native Apple nonce flow; no source modification required.")
