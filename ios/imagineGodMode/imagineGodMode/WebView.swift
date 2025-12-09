//
//  WebView.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//  WKWebView container with extension injection
//

import SwiftUI
import WebKit

#if os(iOS)
import UIKit
typealias PlatformViewRepresentable = UIViewRepresentable
#elseif os(macOS)
import AppKit
typealias PlatformViewRepresentable = NSViewRepresentable
#endif

struct GrokWebView: PlatformViewRepresentable {
    let url: URL
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    #if os(iOS)
    func makeUIView(context: Context) -> WKWebView {
        return makeWebView(context: context)
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        updateWebView(webView)
    }
    #elseif os(macOS)
    func makeNSView(context: Context) -> WKWebView {
        return makeWebView(context: context)
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        updateWebView(webView)
    }
    #endif

    private func makeWebView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()

        // Configure user content controller
        let userContentController = WKUserContentController()

        // Initialize managers
        let webView = WKWebView(frame: .zero, configuration: config)
        let storageBridge = ChromeStorageBridge(webView: webView)
        let downloadManager = DownloadManager(webView: webView)

        // Add message handlers
        userContentController.add(storageBridge, name: "chromeStorage")
        userContentController.add(downloadManager, name: "chromeDownloads")
        config.userContentController = userContentController

        // Store managers in coordinator so they don't get deallocated
        context.coordinator.storageBridge = storageBridge
        context.coordinator.downloadManager = downloadManager

        // Inject scripts
        injectScripts(into: userContentController)

        // Inject CSS
        injectCSS(into: userContentController)

        // Configure webView
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        #if os(iOS)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        #endif

        // Set custom user agent
        webView.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ImagineGodMode/2.11.0"

        // Load URL
        webView.load(URLRequest(url: url))

        return webView
    }

    private func updateWebView(_ webView: WKWebView) {
        // Update navigation state
        DispatchQueue.main.async {
            canGoBack = webView.canGoBack
            canGoForward = webView.canGoForward
        }
    }

    // MARK: - Script Injection

    private func injectScripts(into userContentController: WKUserContentController) {
        // 1. Inject Chrome Storage Polyfill first
        if let polyfillScript = loadScript(named: "chromeStoragePolyfill") {
            let script = WKUserScript(
                source: polyfillScript,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: false
            )
            userContentController.addUserScript(script)
            print("[WebView] Injected chrome storage polyfill")
        }

        // 2. Inject helpers
        if let helpersScript = loadScript(named: "helpers") {
            let script = WKUserScript(
                source: helpersScript,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: false
            )
            userContentController.addUserScript(script)
            print("[WebView] Injected helpers")
        }

        // 3. Inject main content script
        if let contentScript = loadScript(named: "content-script") {
            let script = WKUserScript(
                source: contentScript,
                injectionTime: .atDocumentEnd,
                forMainFrameOnly: false
            )
            userContentController.addUserScript(script)
            print("[WebView] Injected content script")
        }
    }

    private func injectCSS(into userContentController: WKUserContentController) {
        if let cssString = loadCSS(named: "content-script") {
            // Wrap CSS in JavaScript that injects it into the page
            let jsString = """
            (function() {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = `\(cssString.replacingOccurrences(of: "`", with: "\\`"))`;
                document.head.appendChild(style);
                console.log('[ImagineGodMode] CSS injected');
            })();
            """

            let script = WKUserScript(
                source: jsString,
                injectionTime: .atDocumentEnd,
                forMainFrameOnly: false
            )
            userContentController.addUserScript(script)
            print("[WebView] Injected CSS")
        }
    }

    // MARK: - Resource Loading

    private func loadScript(named name: String) -> String? {
        guard let path = Bundle.main.path(forResource: name, ofType: "js", inDirectory: "extension"),
              let content = try? String(contentsOfFile: path, encoding: .utf8) else {
            print("[WebView] Failed to load script: \(name).js")
            return nil
        }
        return content
    }

    private func loadCSS(named name: String) -> String? {
        guard let path = Bundle.main.path(forResource: name, ofType: "css", inDirectory: "extension"),
              let content = try? String(contentsOfFile: path, encoding: .utf8) else {
            print("[WebView] Failed to load CSS: \(name).css")
            return nil
        }
        return content
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: GrokWebView
        var storageBridge: ChromeStorageBridge?
        var downloadManager: DownloadManager?

        init(_ parent: GrokWebView) {
            self.parent = parent
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Update navigation state
            DispatchQueue.main.async {
                self.parent.canGoBack = webView.canGoBack
                self.parent.canGoForward = webView.canGoForward
            }

            print("[WebView] Finished loading: \(webView.url?.absoluteString ?? "unknown")")
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("[WebView] Navigation failed: \(error.localizedDescription)")
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            // Allow all navigation
            decisionHandler(.allow)
        }
    }
}

// MARK: - WebView Container with Controls

struct WebViewContainer: View {
    @State private var canGoBack = false
    @State private var canGoForward = false
    @State private var webView: WKWebView?

    let grokURL = URL(string: "https://grok.com/imagine")!

    var body: some View {
        VStack(spacing: 0) {
            // WebView
            GrokWebView(
                url: grokURL,
                canGoBack: $canGoBack,
                canGoForward: $canGoForward
            )
            .edgesIgnoringSafeArea(.all)

            // Toolbar
            HStack(spacing: 20) {
                Button(action: goBack) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(canGoBack ? .blue : .gray)
                }
                .disabled(!canGoBack)

                Button(action: goForward) {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(canGoForward ? .blue : .gray)
                }
                .disabled(!canGoForward)

                Spacer()

                Button(action: reload) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.blue)
                }
            }
            .padding()
            #if os(iOS)
            .background(Color(UIColor.systemBackground))
            .overlay(
                Rectangle()
                    .frame(height: 0.5)
                    .foregroundColor(Color(UIColor.separator)),
                alignment: .top
            )
            #elseif os(macOS)
            .background(Color(NSColor.windowBackgroundColor))
            .overlay(
                Rectangle()
                    .frame(height: 0.5)
                    .foregroundColor(Color(NSColor.separatorColor)),
                alignment: .top
            )
            #endif
        }
        #if os(iOS)
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)) { _ in
            // Handle background
        }
        #endif
    }

    private func goBack() {
        if let webView = getWebView() {
            webView.goBack()
        }
    }

    private func goForward() {
        if let webView = getWebView() {
            webView.goForward()
        }
    }

    private func reload() {
        if let webView = getWebView() {
            webView.reload()
        }
    }

    private func getWebView() -> WKWebView? {
        #if os(iOS)
        // Helper to get the actual WKWebView instance
        // This is a workaround since we can't directly access it from UIViewRepresentable
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootView = window.rootViewController?.view else {
            return nil
        }

        return findWKWebView(in: rootView)
        #elseif os(macOS)
        // For macOS, we need a different approach
        guard let window = NSApplication.shared.windows.first,
              let contentView = window.contentView else {
            return nil
        }

        return findWKWebView(in: contentView)
        #else
        return nil
        #endif
    }

    #if os(iOS)
    private func findWKWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView {
            return webView
        }

        for subview in view.subviews {
            if let found = findWKWebView(in: subview) {
                return found
            }
        }

        return nil
    }
    #elseif os(macOS)
    private func findWKWebView(in view: NSView) -> WKWebView? {
        if let webView = view as? WKWebView {
            return webView
        }

        for subview in view.subviews {
            if let found = findWKWebView(in: subview) {
                return found
            }
        }

        return nil
    }
    #endif
}
