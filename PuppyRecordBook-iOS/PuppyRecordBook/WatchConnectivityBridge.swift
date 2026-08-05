import Foundation
import WatchConnectivity

final class WatchConnectivityBridge: NSObject, ObservableObject {
    private weak var store: PuppyStore?
    private let session = WCSession.default

    init(store: PuppyStore) {
        self.store = store
        super.init()
        if WCSession.isSupported() {
            session.delegate = self
            session.activate()
        }
    }

    func broadcastTimerChange(type: RecordType, start: Date?, end: Date?) {
        guard session.activationState == .activated else { return }
        var payload: [String: Any] = ["type": type.rawValue]
        if let start {
            payload["action"] = end == nil ? "startTimer" : "stopTimer"
            payload["start"] = start.timeIntervalSince1970
        }
        if let end {
            payload["end"] = end.timeIntervalSince1970
        }
        session.transferUserInfo(payload)
    }

    private func apply(_ payload: [String: Any]) {
        guard let action = payload["action"] as? String,
              let rawType = payload["type"] as? String,
              let type = RecordType(rawValue: rawType) else {
            return
        }

        DispatchQueue.main.async {
            switch action {
            case "quickLog":
                self.store?.quickLog(type)
            case "startTimer":
                if let start = payload["start"] as? TimeInterval {
                    self.store?.data.activeSessions[type] = Date(timeIntervalSince1970: start)
                }
            case "stopTimer":
                guard let store = self.store else { return }
                let start = (payload["start"] as? TimeInterval).map { Date(timeIntervalSince1970: $0) } ?? store.data.activeSessions[type] ?? Date()
                let end = (payload["end"] as? TimeInterval).map { Date(timeIntervalSince1970: $0) } ?? Date()
                store.data.activeSessions[type] = start
                store.toggleTimer(type)
                if let lastIndex = store.data.records.lastIndex(where: { $0.type == type && $0.startTime == start }) {
                    store.data.records[lastIndex].endTime = end
                }
            default:
                break
            }
        }
    }
}

extension WatchConnectivityBridge: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        apply(message)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
        apply(userInfo)
    }
}
