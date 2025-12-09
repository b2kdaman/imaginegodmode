//
//  StorageManager.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//  Manages persistent storage and app lifecycle
//

import Foundation
import WebKit

/// Manages WKWebView state persistence and app lifecycle handling
class StorageManager {
    private let userDefaults = UserDefaults.standard

    // Keys for persisting state
    private struct Keys {
        static let webViewStatePrefix = "webview_state_"
        static let lastURL = "last_url"
    }

    // MARK: - WebView State

    /// Save the current URL
    func saveCurrentURL(_ url: URL?) {
        if let url = url {
            userDefaults.set(url.absoluteString, forKey: Keys.lastURL)
            userDefaults.synchronize()
        }
    }

    /// Load the last URL
    func loadLastURL() -> URL? {
        guard let urlString = userDefaults.string(forKey: Keys.lastURL),
              let url = URL(string: urlString) else {
            return nil
        }
        return url
    }

    /// Clear saved URL
    func clearLastURL() {
        userDefaults.removeObject(forKey: Keys.lastURL)
        userDefaults.synchronize()
    }

    // MARK: - App Lifecycle

    /// Called when app enters background
    func handleAppDidEnterBackground(webView: WKWebView) {
        // Save current URL
        saveCurrentURL(webView.url)

        // Note: WKWebView state is managed automatically by iOS
        print("[StorageManager] App entered background, saved state")
    }

    /// Called when app enters foreground
    func handleAppWillEnterForeground(webView: WKWebView) {
        // Reload if needed
        if webView.url == nil {
            if let lastURL = loadLastURL() {
                webView.load(URLRequest(url: lastURL))
                print("[StorageManager] App entered foreground, restored URL: \(lastURL)")
            }
        }
    }

    /// Called when app terminates
    func handleAppWillTerminate(webView: WKWebView) {
        saveCurrentURL(webView.url)
        print("[StorageManager] App will terminate, saved state")
    }

    // MARK: - Storage Info

    /// Get storage usage information
    func getStorageInfo() -> [String: Any] {
        let allKeys = userDefaults.dictionaryRepresentation().keys
        let chromeStorageKeys = allKeys.filter { $0.hasPrefix("chrome_storage_") }

        var totalSize = 0
        for key in chromeStorageKeys {
            if let value = userDefaults.object(forKey: key) {
                // Rough estimate of size
                if let string = value as? String {
                    totalSize += string.utf8.count
                } else if let data = value as? Data {
                    totalSize += data.count
                }
            }
        }

        return [
            "keysCount": chromeStorageKeys.count,
            "estimatedSize": totalSize,
            "estimatedSizeMB": Double(totalSize) / 1024.0 / 1024.0
        ]
    }

    /// Clear all chrome storage data
    func clearAllChromeStorage() {
        let allKeys = userDefaults.dictionaryRepresentation().keys
        for key in allKeys where key.hasPrefix("chrome_storage_") {
            userDefaults.removeObject(forKey: key)
        }
        userDefaults.synchronize()
        print("[StorageManager] Cleared all chrome storage data")
    }

    /// Clear all app data (including WKWebView)
    func clearAllAppData(webView: WKWebView, completion: @escaping () -> Void) {
        // Clear UserDefaults storage
        clearAllChromeStorage()
        clearLastURL()

        // Clear WKWebView data
        let dataStore = WKWebsiteDataStore.default()
        let dataTypes = WKWebsiteDataStore.allWebsiteDataTypes()

        dataStore.fetchDataRecords(ofTypes: dataTypes) { records in
            dataStore.removeData(ofTypes: dataTypes, for: records) {
                DispatchQueue.main.async {
                    print("[StorageManager] Cleared all app data including WKWebView cache")
                    completion()
                }
            }
        }
    }
}
