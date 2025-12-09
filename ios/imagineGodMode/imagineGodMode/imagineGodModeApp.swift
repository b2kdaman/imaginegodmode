//
//  imagineGodModeApp.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//

import SwiftUI

@main
struct imagineGodModeApp: App {
    @State private var fileToImport: URL?

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
