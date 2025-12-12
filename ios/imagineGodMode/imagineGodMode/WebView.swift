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

        // Configure persistent data store for localStorage and cookies
        config.websiteDataStore = WKWebsiteDataStore.default()

        // Disable autoplay for videos
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = .all

        // Enable JavaScript (using modern API for iOS 14+)
        config.defaultWebpagePreferences.allowsContentJavaScript = true

        // Configure user content controller
        let userContentController = WKUserContentController()

        // Initialize managers
        let webView = WKWebView(frame: .zero, configuration: config)
        let storageBridge = ChromeStorageBridge(webView: webView)
        let downloadManager = DownloadManager(webView: webView)
        let fileImportHandler = FileImportHandler(webView: webView)

        // Add message handlers
        userContentController.add(storageBridge, name: "chromeStorage")
        userContentController.add(downloadManager, name: "chromeDownloads")
        userContentController.add(fileImportHandler, name: "fileImport")

        // Add console log interceptor
        let consoleLogScript = """
        (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;

            console.log = function(...args) {
                originalLog.apply(console, args);
                try {
                    window.webkit.messageHandlers.consoleLog?.postMessage({
                        level: 'log',
                        message: args.map(String).join(' ')
                    });
                } catch(e) {}
            };

            console.error = function(...args) {
                originalError.apply(console, args);
                try {
                    window.webkit.messageHandlers.consoleLog?.postMessage({
                        level: 'error',
                        message: args.map(String).join(' ')
                    });
                } catch(e) {}
            };

            console.warn = function(...args) {
                originalWarn.apply(console, args);
                try {
                    window.webkit.messageHandlers.consoleLog?.postMessage({
                        level: 'warn',
                        message: args.map(String).join(' ')
                    });
                } catch(e) {}
            };
        })();
        """

        let consoleScript = WKUserScript(
            source: consoleLogScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        userContentController.addUserScript(consoleScript)

        // Create console log handler
        let consoleHandler = ConsoleLogHandler()
        userContentController.add(consoleHandler, name: "consoleLog")
        context.coordinator.consoleHandler = consoleHandler

        config.userContentController = userContentController

        // Store managers in coordinator so they don't get deallocated
        context.coordinator.storageBridge = storageBridge
        context.coordinator.downloadManager = downloadManager
        context.coordinator.fileImportHandler = fileImportHandler

        // Inject scripts
        injectScripts(into: userContentController)

        // Inject CSS
        injectCSS(into: userContentController)

        // Configure webView
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true

        #if os(iOS)
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        // Disable zoom
        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.bouncesZoom = false
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
        // Note: WKUserScript injection doesn't work due to CSP
        // Scripts are now injected via evaluateJavaScript in didFinish navigation
        // Keeping this method for potential future use

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
        // Try loading from root of bundle first (files added directly)
        if let path = Bundle.main.path(forResource: name, ofType: "js"),
           let content = try? String(contentsOfFile: path, encoding: .utf8) {
            print("[WebView] Successfully loaded script from bundle root: \(name).js")
            return content
        }

        // Try loading from extension directory
        if let path = Bundle.main.path(forResource: name, ofType: "js", inDirectory: "extension"),
           let content = try? String(contentsOfFile: path, encoding: .utf8) {
            print("[WebView] Successfully loaded script from extension directory: \(name).js")
            return content
        }

        // DEBUG: List all JS files in bundle
        if let resourcePath = Bundle.main.resourcePath {
            print("[WebView] Bundle resource path: \(resourcePath)")
            do {
                let allFiles = try FileManager.default.contentsOfDirectory(atPath: resourcePath)
                let jsFiles = allFiles.filter { $0.hasSuffix(".js") }
                print("[WebView] JS files in bundle: \(jsFiles)")
            } catch {
                print("[WebView] Error listing bundle: \(error)")
            }
        }

        print("[WebView] Failed to load script: \(name).js")
        return nil
    }

    private func loadCSS(named name: String) -> String? {
        // Try loading from root of bundle first
        if let path = Bundle.main.path(forResource: name, ofType: "css"),
           let content = try? String(contentsOfFile: path, encoding: .utf8) {
            print("[WebView] Successfully loaded CSS from bundle root: \(name).css")
            return content
        }

        // Try loading from extension directory
        if let path = Bundle.main.path(forResource: name, ofType: "css", inDirectory: "extension"),
           let content = try? String(contentsOfFile: path, encoding: .utf8) {
            print("[WebView] Successfully loaded CSS from extension directory: \(name).css")
            return content
        }

        print("[WebView] Failed to load CSS: \(name).css")
        return nil
    }

    // MARK: - Console Log Handler

    class ConsoleLogHandler: NSObject, WKScriptMessageHandler {
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let level = body["level"] as? String,
                  let msg = body["message"] as? String else {
                return
            }

            let prefix: String
            switch level {
            case "error":
                prefix = "❌ [JS Error]"
            case "warn":
                prefix = "⚠️ [JS Warn]"
            default:
                prefix = "📱 [JS Log]"
            }

            print("\(prefix) \(msg)")
        }
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: GrokWebView
        var storageBridge: ChromeStorageBridge?
        var downloadManager: DownloadManager?
        var fileImportHandler: FileImportHandler?
        var consoleHandler: ConsoleLogHandler?

        init(_ parent: GrokWebView) {
            self.parent = parent
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Update navigation state
            DispatchQueue.main.async {
                self.parent.canGoBack = webView.canGoBack
                self.parent.canGoForward = webView.canGoForward
            }

            print("[WebView] ✓ Finished loading: \(webView.url?.absoluteString ?? "unknown")")

            // Test basic JavaScript execution first
            webView.evaluateJavaScript("console.log('[WebView] ✓ JavaScript execution works!'); 'test';") { result, error in
                if let error = error {
                    print("[WebView] ✗ JavaScript test FAILED: \(error)")
                } else {
                    print("[WebView] ✓ JavaScript test passed, result: \(String(describing: result))")
                    // JavaScript works, now inject scripts
                    self.injectScriptsAfterLoad(webView)
                }
            }
        }

        private func injectScriptsAfterLoad(_ webView: WKWebView) {
            // Inject scripts directly without test alert
            self.loadAndInjectScripts(webView)
        }

        private func loadAndInjectScripts(_ webView: WKWebView) {
            // Load script files
            guard let polyfill = self.parent.loadScript(named: "chromeStoragePolyfill"),
                  let helpers = self.parent.loadScript(named: "helpers"),
                  let contentScript = self.parent.loadScript(named: "content-script"),
                  let css = self.parent.loadCSS(named: "content-script") else {
                print("[WebView] Failed to load one or more scripts")
                return
            }

            // Encode scripts as base64 to avoid escaping issues
            let polyfillBase64 = polyfill.data(using: .utf8)?.base64EncodedString() ?? ""
            let helpersBase64 = helpers.data(using: .utf8)?.base64EncodedString() ?? ""
            let contentScriptBase64 = contentScript.data(using: .utf8)?.base64EncodedString() ?? ""
            let cssBase64 = css.data(using: .utf8)?.base64EncodedString() ?? ""

            // Inject using base64 decoded scripts with import map
            let scriptInjection = """
            (function() {
                // Decode base64
                function decodeBase64(base64) {
                    return decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                }

                // Inject viewport meta tag to disable zoom
                var existingViewport = document.querySelector('meta[name="viewport"]');
                if (existingViewport) {
                    existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                } else {
                    var viewport = document.createElement('meta');
                    viewport.name = 'viewport';
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                    document.head.appendChild(viewport);
                }
                console.log('[ImagineGodMode] Viewport meta tag configured');

                // Inject polyfill
                var polyfillCode = decodeBase64('\(polyfillBase64)');
                var polyfillScript = document.createElement('script');
                polyfillScript.textContent = polyfillCode;
                document.head.appendChild(polyfillScript);
                console.log('[ImagineGodMode] Polyfill injected');

                // Inject CSS fixes for WKWebView first
                var wkWebViewFixes = document.createElement('style');
                wkWebViewFixes.type = 'text/css';
                wkWebViewFixes.innerHTML = `
                    /* WKWebView CSS fixes */
                    * {
                        -webkit-tap-highlight-color: transparent;
                        -webkit-touch-callout: none;
                        -webkit-text-size-adjust: 100%;
                    }

                    /* Prevent zoom on input focus by ensuring minimum font size */
                    input, select, textarea {
                        font-size: 16px !important;
                    }

                    button, input, select, textarea {
                        -webkit-appearance: none;
                        appearance: none;
                        outline: none !important;
                    }
                    *:focus {
                        outline: none !important;
                    }
                    /* Remove any default webkit outlines */
                    *::-webkit-input-placeholder {
                        outline: none !important;
                    }
                    /* Fix for group components outline */
                    div, span, button, input, textarea, select {
                        outline: none !important;
                        -webkit-tap-highlight-color: transparent !important;
                    }
                    /* Remove white borders from containers in iOS */
                    #imaginegodmode-root * {
                        border-color: transparent !important;
                    }
                    /* Only keep intentional borders (shadows, focus states) */
                    #imaginegodmode-root .border,
                    #imaginegodmode-root .border-t,
                    #imaginegodmode-root .border-b,
                    #imaginegodmode-root .border-l,
                    #imaginegodmode-root .border-r {
                        border-color: transparent !important;
                    }
                `;
                document.head.appendChild(wkWebViewFixes);
                console.log('[ImagineGodMode] WKWebView CSS fixes injected');

                // Inject main CSS
                var cssCode = decodeBase64('\(cssBase64)');
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = cssCode;
                document.head.appendChild(style);
                console.log('[ImagineGodMode] CSS injected');

                // Create blob URL for helpers first
                var helpersCode = decodeBase64('\(helpersBase64)');
                var helpersBlob = new Blob([helpersCode], { type: 'application/javascript' });
                var helpersURL = URL.createObjectURL(helpersBlob);
                console.log('[ImagineGodMode] Helpers blob URL created:', helpersURL);

                // Replace import statement in content script to use the blob URL
                var contentCode = decodeBase64('\(contentScriptBase64)');
                // Replace the relative import with our blob URL
                contentCode = contentCode.replace(/from"\\.\\/helpers-[^"]+\\.js"/, 'from"' + helpersURL + '"');
                console.log('[ImagineGodMode] Content script import replaced');

                // Inject helpers module
                var helpersScript = document.createElement('script');
                helpersScript.type = 'module';
                helpersScript.src = helpersURL;
                document.head.appendChild(helpersScript);
                console.log('[ImagineGodMode] Helpers module injected');

                // Wait a bit then inject content script
                setTimeout(function() {
                    var contentBlob = new Blob([contentCode], { type: 'application/javascript' });
                    var contentURL = URL.createObjectURL(contentBlob);
                    var contentScriptElement = document.createElement('script');
                    contentScriptElement.type = 'module';
                    contentScriptElement.src = contentURL;
                    contentScriptElement.onload = function() {
                        console.log('[ImagineGodMode] Content script loaded successfully!');
                    };
                    contentScriptElement.onerror = function(e) {
                        console.error('[ImagineGodMode] Content script load error:', e);
                    };
                    document.head.appendChild(contentScriptElement);
                    console.log('[ImagineGodMode] Content script injected');
                }, 200);
            })();
            """

            webView.evaluateJavaScript(scriptInjection) { _, error in
                if let error = error {
                    print("[WebView] Script injection error: \(error)")
                } else {
                    print("[WebView] Scripts injected successfully")
                }
            }
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
    @Binding var fileToImport: URL?
    @State private var canGoBack = false
    @State private var canGoForward = false
    @State private var webView: WKWebView?
    @State private var fileImportHandler: FileImportHandler?

    let grokURL = URL(string: "https://grok.com/imagine/favorites")!

    var body: some View {
        VStack(spacing: 0) {
            // WebView (full screen, no browser controls)
            GrokWebView(
                url: grokURL,
                canGoBack: $canGoBack,
                canGoForward: $canGoForward
            )
            .edgesIgnoringSafeArea(.all)
        }
        #if os(iOS)
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)) { _ in
            // Handle background
        }
        #endif
        .onChange(of: fileToImport) { oldValue, newFileURL in
            if let fileURL = newFileURL, let webView = getWebView() {
                // Initialize file import handler if not already done
                if fileImportHandler == nil {
                    fileImportHandler = FileImportHandler(webView: webView)
                }

                // Import the file
                fileImportHandler?.importFile(from: fileURL)

                // Clear the file URL after importing
                DispatchQueue.main.async {
                    self.fileToImport = nil
                }
            }
        }
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
