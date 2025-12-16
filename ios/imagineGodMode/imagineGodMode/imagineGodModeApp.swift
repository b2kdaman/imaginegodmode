//
//  imagineGodModeApp.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//

import SwiftUI
import WebKit

@main
struct imagineGodModeApp: App {
    @State private var fileToImport: URL?

    #if os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    #endif

    // Keep a reference to prevent processes from shutting down
    private static let webKitPreloader: WKWebView = {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        return WKWebView(frame: .zero, configuration: config)
    }()

    init() {
        // Trigger WebKit process initialization
        // The static property keeps processes alive
        _ = Self.webKitPreloader
    }

    var body: some Scene {
        WindowGroup {
            ContentView(fileToImport: $fileToImport)
                .onOpenURL { url in
                    handleFileImport(url: url)
                }
        }
    }

    private func handleFileImport(url: URL) {
        print("[App] Received file to import: \(url)")
        fileToImport = url
    }
}

#if os(iOS)
import UIKit

class AppDelegate: NSObject, UIApplicationDelegate {
    // Prevent universal links from opening externally
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Block universal links - don't let them open external apps/Safari
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            print("[AppDelegate] Blocked universal link: \(url.absoluteString)")
            // Return false to prevent the system from opening it externally
            return false
        }
        return true
    }
}
#endif
