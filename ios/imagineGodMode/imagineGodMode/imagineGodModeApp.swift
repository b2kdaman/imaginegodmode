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

    init() {
        // Preload WebKit processes to reduce initial launch time
        // This warms up the Networking, GPU, and WebContent processes
        _ = WKWebView()
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
