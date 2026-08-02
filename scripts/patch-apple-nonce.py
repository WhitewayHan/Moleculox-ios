from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HANDLER = ROOT / "node_modules" / "@capacitor-firebase" / "authentication" / "ios" / "Plugin" / "Handlers" / "AppleAuthProviderHandler.swift"
HELPER = ROOT / "node_modules" / "@capacitor-firebase" / "authentication" / "ios" / "Plugin" / "FirebaseAuthenticationHelper.swift"

for path in (HANDLER, HELPER):
    if not path.exists():
        raise SystemExit(f"{path.name} not found. Run npm install before ios:prepare.")

handler = HANDLER.read_text()
helper = HELPER.read_text()

handler_done = "MX_R8_DETERMINISTIC_RAW_NONCE" in handler
helper_done = "MX_R8_EXPLICIT_APPLE_FIELDS" in helper

if not handler_done:
    old_methods = '''    func signIn(call: CAPPluginCall) {
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
'''
    new_methods = '''    func signIn(call: CAPPluginCall) {
        if #available(iOS 13, *) {
            self.isLink = false
            // MX_R8_DETERMINISTIC_RAW_NONCE: the JS Firebase bridge supplies one
            // raw nonce. Native hashes this exact value for Apple's request.
            self.startSignInWithAppleFlow(rawNonce: call.getString("rawNonce"))
        } else {
            call.reject(self.pluginImplementation.getPlugin().errorDeviceUnsupported)
        }
    }

    func link(call: CAPPluginCall) {
        if #available(iOS 13, *) {
            self.isLink = true
            self.startSignInWithAppleFlow(rawNonce: call.getString("rawNonce"))
        } else {
            call.reject(self.pluginImplementation.getPlugin().errorDeviceUnsupported)
        }
    }
'''
    old_start = '''    func startSignInWithAppleFlow() {
        let nonce = randomNonceString()
        currentNonce = nonce
'''
    new_start = '''    func startSignInWithAppleFlow(rawNonce: String? = nil) {
        let suppliedNonce = rawNonce?.trimmingCharacters(in: .whitespacesAndNewlines)
        let nonce = (suppliedNonce?.isEmpty == false) ? suppliedNonce! : randomNonceString()
        currentNonce = nonce
'''
    if old_methods not in handler:
        raise SystemExit("Unsupported AppleAuthProviderHandler.swift: signIn/link baseline not found.")
    if old_start not in handler:
        raise SystemExit("Unsupported AppleAuthProviderHandler.swift: start flow baseline not found.")
    handler = handler.replace(old_methods, new_methods, 1).replace(old_start, new_start, 1)
    HANDLER.write_text(handler)

if not helper_done:
    old_result = '''        var result = JSObject()
        result["user"] = userResult ?? NSNull()
        result["credential"] = credentialResult ?? NSNull()
        result["additionalUserInfo"] = additionalUserInfoResult ?? NSNull()
        return result
'''
    new_result = '''        var result = JSObject()
        result["user"] = userResult ?? NSNull()
        result["credential"] = credentialResult ?? NSNull()
        result["additionalUserInfo"] = additionalUserInfoResult ?? NSNull()
        // MX_R8_EXPLICIT_APPLE_FIELDS: bridge-safe top-level copies.
        // Only Apple supplies a nonce here, so other providers are unchanged.
        if let nonce = nonce {
            result["rawNonce"] = nonce
            if let idToken = idToken {
                result["appleIdToken"] = idToken
            }
            if let authorizationCode = authorizationCode {
                result["appleAuthorizationCode"] = authorizationCode
            }
        }
        return result
'''
    if old_result not in helper:
        raise SystemExit("Unsupported FirebaseAuthenticationHelper.swift: result baseline not found.")
    helper = helper.replace(old_result, new_result, 1)
    HELPER.write_text(helper)

handler = HANDLER.read_text()
helper = HELPER.read_text()
required_handler = [
    "MX_R8_DETERMINISTIC_RAW_NONCE",
    'call.getString("rawNonce")',
    "startSignInWithAppleFlow(rawNonce:",
    "request.nonce = sha256(nonce)",
    "rawNonce: nonce",
    "nonce: nonce",
]
required_helper = [
    "MX_R8_EXPLICIT_APPLE_FIELDS",
    'result["rawNonce"] = nonce',
    'result["appleIdToken"] = idToken',
    'result["appleAuthorizationCode"] = authorizationCode',
]
missing = [x for x in required_handler if x not in handler] + [x for x in required_helper if x not in helper]
if missing:
    raise SystemExit("Apple R8 patch validation failed: " + ", ".join(missing))

print("Patched deterministic Apple raw nonce and explicit bridge fields.")
