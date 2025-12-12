//
//  FileImportHandler.swift
//  imagineGodMode
//
//  Handles importing .pak and .json files into the WebView
//

import Foundation
import WebKit

class FileImportHandler: NSObject, WKScriptMessageHandler {
    weak var webView: WKWebView?

    init(webView: WKWebView) {
        self.webView = webView
        super.init()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle messages from JavaScript if needed
        print("[FileImportHandler] Received message: \(message.name)")
    }

    /// Import a file from a URL and pass it to the WebView
    func importFile(from url: URL) {
        // Ensure we have access to the file
        guard url.startAccessingSecurityScopedResource() else {
            print("[FileImportHandler] Failed to access file: \(url)")
            return
        }

        defer {
            url.stopAccessingSecurityScopedResource()
        }

        do {
            // Read file data
            let data = try Data(contentsOf: url)
            let fileName = url.lastPathComponent
            let fileExtension = url.pathExtension.lowercased()

            // Validate file type
            guard fileExtension == "pak" || fileExtension == "json" else {
                print("[FileImportHandler] Unsupported file type: \(fileExtension)")
                notifyWebView(error: "Unsupported file type. Only .pak and .json files are supported.")
                return
            }

            // Convert to base64 for transfer to JavaScript
            let base64String = data.base64EncodedString()

            // Escape single quotes in base64 string for JavaScript
            let escapedBase64 = base64String.replacingOccurrences(of: "'", with: "\\'")

            // Create JavaScript to simulate file input selection
            let script = """
            (function() {
                try {
                    console.log('[FileImportHandler] Starting file import for: \(fileName)');

                    // Decode base64 to create a Blob
                    const base64 = '\(escapedBase64)';
                    const binaryString = atob(base64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // Create a File object from the bytes
                    const blob = new Blob([bytes], { type: 'application/octet-stream' });
                    const file = new File([blob], '\(fileName)', { type: 'application/octet-stream' });

                    // Find the hidden file input in ImportPackModal
                    const fileInput = document.querySelector('input[type="file"][accept*=".pak"]');

                    if (fileInput) {
                        // Create a DataTransfer to hold the file
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);

                        // Assign files to input and trigger change event
                        fileInput.files = dataTransfer.files;

                        // Dispatch change event to trigger handleFileSelect
                        const event = new Event('change', { bubbles: true });
                        fileInput.dispatchEvent(event);

                        console.log('[FileImportHandler] File injected into input and change event dispatched');
                    } else {
                        console.error('[FileImportHandler] File input not found. Make sure Import modal is open.');
                        alert('Please open the Import dialog first (click Import button in the extension)');
                    }
                } catch (error) {
                    console.error('[FileImportHandler] Error importing file:', error);
                    alert('Error importing file: ' + error.message);
                }
            })();
            """

            webView?.evaluateJavaScript(script) { result, error in
                if let error = error {
                    print("[FileImportHandler] JavaScript error: \(error)")
                } else {
                    print("[FileImportHandler] File \(fileName) successfully injected into file input")
                }
            }

        } catch {
            print("[FileImportHandler] Error reading file: \(error)")
            notifyWebView(error: "Failed to read file: \(error.localizedDescription)")
        }
    }

    /// Show error notification in WebView
    private func notifyWebView(error: String) {
        let script = """
        (function() {
            console.error('[FileImportHandler] \(error)');
            if (window.showToast) {
                window.showToast('\(error)', 'error');
            }
        })();
        """

        webView?.evaluateJavaScript(script, completionHandler: nil)
    }
}
