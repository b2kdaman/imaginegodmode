//
//  ChromeStorageBridge.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//  Chrome Storage API bridge for WKWebView
//

import Foundation
import WebKit

/// Bridges chrome.storage.local API calls from JavaScript to iOS UserDefaults
class ChromeStorageBridge: NSObject, WKScriptMessageHandler {
    private let userDefaults = UserDefaults.standard
    private let storagePrefix = "chrome_storage_"
    weak var webView: WKWebView?

    init(webView: WKWebView?) {
        self.webView = webView
        super.init()
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("[ChromeStorageBridge] Received message from JS")

        guard let body = message.body as? [String: Any],
              let type = body["type"] as? String,
              let id = body["id"] as? String else {
            print("[ChromeStorageBridge] ❌ Invalid message format")
            return
        }

        print("[ChromeStorageBridge] Message type: \(type), id: \(id)")

        switch type {
        case "storage.get":
            handleGet(id: id, keys: body["keys"] as? [String])
        case "storage.set":
            handleSet(id: id, data: body["data"] as? [String: Any])
        case "storage.remove":
            handleRemove(id: id, keys: body["keys"] as? [String])
        case "storage.clear":
            handleClear(id: id)
        default:
            print("[ChromeStorageBridge] ❌ Unknown message type: \(type)")
            sendResponse(id: id, success: false, error: "Unknown message type")
        }
    }

    // MARK: - Storage Operations

    private func handleGet(id: String, keys: [String]?) {
        var result: [String: Any] = [:]

        if let keys = keys {
            // Get specific keys
            for key in keys {
                if let value = getData(forKey: key) {
                    result[key] = value
                }
            }
        } else {
            // Get all keys with our prefix
            let allKeys = userDefaults.dictionaryRepresentation().keys
            let storageKeys = allKeys.filter { $0.hasPrefix(storagePrefix) }
            for key in storageKeys {
                let cleanKey = String(key.dropFirst(storagePrefix.count))
                if let value = getData(forKey: cleanKey) {
                    result[cleanKey] = value
                }
            }
        }

        sendResponse(id: id, success: true, data: result)
    }

    private func handleSet(id: String, data: [String: Any]?) {
        guard let data = data else {
            sendResponse(id: id, success: false, error: "No data provided")
            return
        }

        for (key, value) in data {
            setData(value, forKey: key)
        }

        userDefaults.synchronize()
        sendResponse(id: id, success: true)
    }

    private func handleRemove(id: String, keys: [String]?) {
        guard let keys = keys else {
            sendResponse(id: id, success: false, error: "No keys provided")
            return
        }

        for key in keys {
            removeData(forKey: key)
        }

        userDefaults.synchronize()
        sendResponse(id: id, success: true)
    }

    private func handleClear(id: String) {
        // Remove all keys with our prefix
        let allKeys = userDefaults.dictionaryRepresentation().keys
        for key in allKeys where key.hasPrefix(storagePrefix) {
            userDefaults.removeObject(forKey: key)
        }

        userDefaults.synchronize()
        sendResponse(id: id, success: true)
    }

    // MARK: - UserDefaults Helpers

    private func prefixedKey(_ key: String) -> String {
        return storagePrefix + key
    }

    private func getData(forKey key: String) -> Any? {
        let prefixed = prefixedKey(key)

        // Try to get as JSON string first (for complex objects)
        if let jsonString = userDefaults.string(forKey: prefixed),
           let jsonData = jsonString.data(using: .utf8) {
            do {
                return try JSONSerialization.jsonObject(with: jsonData, options: [])
            } catch {
                print("[ChromeStorageBridge] Failed to deserialize JSON for key '\(key)': \(error)")
            }
        }

        // Fallback to direct value
        return userDefaults.object(forKey: prefixed)
    }

    private func setData(_ value: Any, forKey key: String) {
        let prefixed = prefixedKey(key)

        // For complex objects, serialize to JSON string
        if let dict = value as? [String: Any] {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    userDefaults.set(jsonString, forKey: prefixed)
                    return
                }
            } catch {
                print("[ChromeStorageBridge] Failed to serialize dict for key '\(key)': \(error)")
            }
        } else if let array = value as? [Any] {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: array, options: [])
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    userDefaults.set(jsonString, forKey: prefixed)
                    return
                }
            } catch {
                print("[ChromeStorageBridge] Failed to serialize array for key '\(key)': \(error)")
            }
        }

        // For simple types, store directly
        userDefaults.set(value, forKey: prefixed)
    }

    private func removeData(forKey key: String) {
        let prefixed = prefixedKey(key)
        userDefaults.removeObject(forKey: prefixed)
    }

    // MARK: - Response Helpers

    private func sendResponse(id: String, success: Bool, data: [String: Any]? = nil, error: String? = nil) {
        var response: [String: Any] = [
            "id": id,
            "success": success
        ]

        if let data = data {
            response["data"] = data
        }

        if let error = error {
            response["error"] = error
        }

        // Convert response to JSON
        guard let jsonData = try? JSONSerialization.data(withJSONObject: response, options: []),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            print("[ChromeStorageBridge] ❌ Failed to serialize response")
            return
        }

        print("[ChromeStorageBridge] ✓ Sending response to JS: success=\(success), hasData=\(data != nil)")

        // Call JavaScript callback
        let js = "__chromeStorageResponse(\(jsonString));"

        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js) { _, error in
                if let error = error {
                    print("[ChromeStorageBridge] ❌ JavaScript execution error: \(error)")
                } else {
                    print("[ChromeStorageBridge] ✓ Response delivered to JS")
                }
            }
        }
    }
}
