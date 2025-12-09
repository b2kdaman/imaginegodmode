//
//  DownloadManager.swift
//  imagineGodMode
//
//  Created by Valentine on 09/12/2025.
//  Handles media downloads from Grok
//

import Foundation
import Photos
import WebKit
import UIKit

/// Manages file downloads and saves them to the Photos library
class DownloadManager: NSObject {
    weak var webView: WKWebView?
    private var downloadTasks: [String: URLSessionDownloadTask] = [:]
    private var downloadCallbacks: [String: (Bool, Int, String?) -> Void] = [:]

    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 60
        config.timeoutIntervalForResource = 300
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    init(webView: WKWebView?) {
        self.webView = webView
        super.init()
    }

    // MARK: - Download Handling

    func handleDownloadMessage(_ body: [String: Any]) {
        guard let type = body["type"] as? String,
              let id = body["id"] as? String else {
            print("[DownloadManager] Invalid download message format")
            return
        }

        switch type {
        case "download.start":
            if let url = body["url"] as? String {
                let filename = body["filename"] as? String
                startDownload(id: id, url: url, filename: filename)
            } else {
                sendDownloadResponse(id: id, success: false, error: "No URL provided")
            }
        default:
            print("[DownloadManager] Unknown download message type: \(type)")
        }
    }

    private func startDownload(id: String, url: String, filename: String?) {
        guard let downloadURL = URL(string: url) else {
            sendDownloadResponse(id: id, success: false, error: "Invalid URL")
            return
        }

        // Check photo library permission
        checkPhotoLibraryPermission { [weak self] granted in
            guard granted else {
                self?.sendDownloadResponse(id: id, success: false, error: "Photo library access denied")
                return
            }

            // Start download
            let task = self?.session.downloadTask(with: downloadURL)
            self?.downloadTasks[id] = task
            self?.downloadCallbacks[id] = { success, downloadId, error in
                self?.sendDownloadResponse(id: id, success: success, downloadId: downloadId, error: error)
            }
            task?.resume()

            print("[DownloadManager] Started download: \(url)")
        }
    }

    // MARK: - Photo Library

    private func checkPhotoLibraryPermission(completion: @escaping (Bool) -> Void) {
        let status = PHPhotoLibrary.authorizationStatus(for: .addOnly)

        switch status {
        case .authorized, .limited:
            completion(true)
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization(for: .addOnly) { newStatus in
                DispatchQueue.main.async {
                    completion(newStatus == .authorized || newStatus == .limited)
                }
            }
        case .denied, .restricted:
            completion(false)
        @unknown default:
            completion(false)
        }
    }

    private func saveToPhotoLibrary(fileURL: URL, completion: @escaping (Bool, String?) -> Void) {
        // Determine media type
        let isVideo = fileURL.pathExtension.lowercased() == "mp4" ||
                      fileURL.pathExtension.lowercased() == "mov" ||
                      fileURL.pathExtension.lowercased() == "m4v"

        PHPhotoLibrary.shared().performChanges({
            if isVideo {
                PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: fileURL)
            } else {
                PHAssetChangeRequest.creationRequestForAssetFromImage(atFileURL: fileURL)
            }
        }) { success, error in
            DispatchQueue.main.async {
                if success {
                    print("[DownloadManager] Saved to Photos: \(fileURL.lastPathComponent)")
                    completion(true, nil)
                } else {
                    let errorMsg = error?.localizedDescription ?? "Unknown error"
                    print("[DownloadManager] Failed to save to Photos: \(errorMsg)")
                    completion(false, errorMsg)
                }

                // Clean up temp file
                try? FileManager.default.removeItem(at: fileURL)
            }
        }
    }

    // MARK: - Response Helpers

    private func sendDownloadResponse(id: String, success: Bool, downloadId: Int = -1, error: String? = nil) {
        var response: [String: Any] = [
            "id": id,
            "success": success,
            "downloadId": downloadId
        ]

        if let error = error {
            response["error"] = error
        }

        // Convert response to JSON
        guard let jsonData = try? JSONSerialization.data(withJSONObject: response, options: []),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            print("[DownloadManager] Failed to serialize response")
            return
        }

        // Call JavaScript callback
        let js = "__chromeDownloadResponse(\(jsonString));"

        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js) { _, error in
                if let error = error {
                    print("[DownloadManager] JavaScript execution error: \(error)")
                }
            }
        }

        // Clean up
        downloadTasks.removeValue(forKey: id)
        downloadCallbacks.removeValue(forKey: id)
    }
}

// MARK: - URLSessionDownloadDelegate

extension DownloadManager: URLSessionDownloadDelegate {
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        // Find the download ID
        guard let taskId = downloadTasks.first(where: { $0.value == downloadTask })?.key else {
            print("[DownloadManager] Could not find task ID for completed download")
            return
        }

        // Move to temp location with proper extension
        let tempDir = FileManager.default.temporaryDirectory
        let originalURL = downloadTask.originalRequest?.url
        let filename = originalURL?.lastPathComponent ?? "download"
        let destinationURL = tempDir.appendingPathComponent(filename)

        do {
            // Remove existing file if it exists
            if FileManager.default.fileExists(atPath: destinationURL.path) {
                try FileManager.default.removeItem(at: destinationURL)
            }

            // Move downloaded file
            try FileManager.default.moveItem(at: location, to: destinationURL)

            // Save to photo library
            saveToPhotoLibrary(fileURL: destinationURL) { [weak self] success, error in
                let downloadId = success ? abs(taskId.hashValue) : -1
                self?.downloadCallbacks[taskId]?(success, downloadId, error)
            }
        } catch {
            print("[DownloadManager] Failed to move downloaded file: \(error)")
            downloadCallbacks[taskId]?(false, -1, error.localizedDescription)
        }
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error {
            // Find the download ID
            if let taskId = downloadTasks.first(where: { $0.value == task })?.key {
                print("[DownloadManager] Download failed: \(error.localizedDescription)")
                downloadCallbacks[taskId]?(false, -1, error.localizedDescription)
            }
        }
    }
}

// MARK: - WKScriptMessageHandler for Downloads

extension DownloadManager: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any] else {
            print("[DownloadManager] Invalid message format")
            return
        }

        handleDownloadMessage(body)
    }
}
