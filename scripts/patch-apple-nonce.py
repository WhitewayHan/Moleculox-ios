from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SWIFT = ROOT / "node_modules" / "@capacitor-firebase" / "authentication" / "ios" / "Plugin" / "Handlers" / "AppleAuthProviderHandler.swift"

if not SWIFT.exists():
    raise SystemExit("AppleAuthProviderHandler.swift not found. Run npm install before ios:prepare.")

s = SWIFT.read_text()

# Idempotency: a repeated prepare step should leave the already-patched source alone.
if "startSignInWithAppleFlow(rawNonce:" in s and 'call.getString("rawNonce")' in s:
    print("Verified deterministic Apple raw-nonce bridge (already patched).")
    raise SystemExit(0)

old_sign_in = """    func signIn(call: CAPPluginCall) {
        if #available(iOS 13, *) {
            self.isLink = false
            self.startSignInWithAppleFlow()
        } else {
            call.reject(self.pluginImplementation.getPlugin().errorDeviceUnsupported)
        }
    }

    func link(call: CAPPluginCall) {
        if #available(iOS 13, *) {
            self.isLink = true
            self.startSignInWithAppleFlow()
        } else {
            call.reject(self.pluginImplementation.getPlugin().errorDeviceUnsupported)
        }
    }
"""
new_sign_in = """    func signIn(call: CAPPluginCall) {
        if #available(iOS 13, *) {
            self.isLink = false
            self.startSignInWithAppleFlow(rawNonce: call.getString(\"rawNonce\"))
        } else {
            call.reject(self.pluginImplementation.getPlugin().errorDeviceUnsupported)
        }
    }

    func link(call: CAPPluginCall) {
        if #available(iOS 13, *) {
            self.isLink = true
            self.startSignInWithAppleFlow(rawNonce: call.getString(\"rawNonce\"))
        } else {
            call.reject(self.pluginImplementation.getPlugin().errorDeviceUnsupported)
        }
    }
"""

old_start = """    func startSignInWithAppleFlow() {
        let nonce = randomNonceString()
        currentNonce = nonce
"""
new_start = """    func startSignInWithAppleFlow(rawNonce: String? = nil) {
        let suppliedNonce = rawNonce?.trimmingCharacters(in: .whitespacesAndNewlines)
        let nonce = (suppliedNonce?.isEmpty == false) ? suppliedNonce! : randomNonceString()
        currentNonce = nonce
"""

if old_sign_in not in s:
    raise SystemExit("Unsupported AppleAuthProviderHandler.swift: signIn/link baseline not found.")
if old_start not in s:
    raise SystemExit("Unsupported AppleAuthProviderHandler.swift: start flow baseline not found.")

s = s.replace(old_sign_in, new_sign_in, 1)
s = s.replace(old_start, new_start, 1)
SWIFT.write_text(s)

required = [
    'call.getString("rawNonce")',
    'startSignInWithAppleFlow(rawNonce:',
    'request.nonce = sha256(nonce)',
    'rawNonce: nonce',
    'nonce: nonce',
]
missing = [item for item in required if item not in s]
if missing:
    raise SystemExit("Apple nonce patch validation failed: " + ", ".join(missing))

print("Patched native Apple flow to use the exact raw nonce supplied by the Firebase JS bridge.")
