import Foundation
import WatchConnectivity

final class WatchPuppyStore: NSObject, ObservableObject {
    @Published private(set) var activeSessions: [RecordType: Date] = [:]
    @Published var statusText = "Ready"

    private let session = WCSession.default
    private let quickTypes: Set<RecordType> = [.pee, .poop, .food, .water]
    private let timedTypes: Set<RecordType> = [.walk, .play, .sleep, .train, .box]

    override init() {
        super.init()
        if WCSession.isSupported() {
            session.delegate = self
            session.activate()
        }
    }

    func log(_ type: RecordType) {
        if quickTypes.contains(type) {
            send(["action": "quickLog", "type": type.rawValue, "date": Date().timeIntervalSince1970])
            statusText = "\(type.title) saved"
            return
        }

        if timedTypes.contains(type) {
            toggleTimer(type)
        }
    }

    func title(for type: RecordType) -> String {
        if activeSessions[type] != nil {
            return "Stop \(type.title)"
        }
        return type.title
    }

    func durationText(for type: RecordType) -> String? {
        guard let start = activeSessions[type] else { return nil }
        let minutes = max(0, Int(Date().timeIntervalSince(start) / 60))
        return minutes >= 60 ? "\(minutes / 60)h \(minutes % 60)m" : "\(minutes)m"
    }

    private func toggleTimer(_ type: RecordType) {
        let now = Date()
        if let start = activeSessions[type] {
            activeSessions[type] = nil
            send([
                "action": "stopTimer",
                "type": type.rawValue,
                "start": start.timeIntervalSince1970,
                "end": now.timeIntervalSince1970
            ])
            statusText = "\(type.title) stopped"
        } else {
            activeSessions[type] = now
            send(["action": "startTimer", "type": type.rawValue, "start": now.timeIntervalSince1970])
            statusText = "\(type.title) started"
        }
    }

    private func send(_ payload: [String: Any]) {
        if session.activationState == .activated && session.isReachable {
            session.sendMessage(payload, replyHandler: nil) { [weak self] _ in
                self?.session.transferUserInfo(payload)
            }
        } else if session.activationState == .activated {
            session.transferUserInfo(payload)
        }
    }
}

extension WatchPuppyStore: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        apply(message)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
        apply(userInfo)
    }

    private func apply(_ payload: [String: Any]) {
        guard let action = payload["action"] as? String,
              let rawType = payload["type"] as? String,
              let type = RecordType(rawValue: rawType) else {
            return
        }

        DispatchQueue.main.async {
            if action == "startTimer", let start = payload["start"] as? TimeInterval {
                self.activeSessions[type] = Date(timeIntervalSince1970: start)
            }
            if action == "stopTimer" {
                self.activeSessions[type] = nil
            }
        }
    }
}
