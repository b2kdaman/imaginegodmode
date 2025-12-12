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
