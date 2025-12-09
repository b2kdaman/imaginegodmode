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

            // Convert to base64 for transfer to JavaScript
            let base64String = data.base64EncodedString()
            let fileName = url.lastPathComponent
            let fileExtension = url.pathExtension.lowercased()

            // Validate file type
            guard fileExtension == "pak" || fileExtension == "json" else {
                print("[FileImportHandler] Unsupported file type: \(fileExtension)")
                notifyWebView(error: "Unsupported file type. Only .pak and .json files are supported.")
                return
            }

            // Create JavaScript to handle the import
            let script = """
            (function() {
                try {
                    // Decode base64 to get the file content
                    const base64 = '\(base64String)';
                    const binaryString = atob(base64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const text = new TextDecoder().decode(bytes);

                    // Parse JSON
                    const jsonData = JSON.parse(text);

                    // Trigger the import in the extension
                    // This will call the ImportPackModal's handleFileContent or handleTextChange
                    if (window.triggerPackImport) {
                        window.triggerPackImport(text);
                        console.log('[FileImportHandler] File imported: \(fileName)');
                    } else {
                        // Fallback: dispatch a custom event that the extension can listen to
                        const event = new CustomEvent('ios-file-import', {
                            detail: {
                                fileName: '\(fileName)',
                                content: text,
                                data: jsonData
                            }
                        });
                        document.dispatchEvent(event);
                        console.log('[FileImportHandler] Dispatched ios-file-import event');
                    }
                } catch (error) {
                    console.error('[FileImportHandler] Error importing file:', error);
                }
            })();
            """

            webView?.evaluateJavaScript(script) { result, error in
                if let error = error {
                    print("[FileImportHandler] JavaScript error: \(error)")
                } else {
                    print("[FileImportHandler] File \(fileName) successfully passed to WebView")
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
