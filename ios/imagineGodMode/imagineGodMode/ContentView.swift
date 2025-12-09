//
//  ContentView.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//

import SwiftUI

struct ContentView: View {
    @Binding var fileToImport: URL?

    var body: some View {
        WebViewContainer(fileToImport: $fileToImport)
            .edgesIgnoringSafeArea(.all)
    }
}
