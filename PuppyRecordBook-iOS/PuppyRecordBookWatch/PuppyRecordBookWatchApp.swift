import SwiftUI

@main
struct PuppyRecordBookWatchApp: App {
    @StateObject private var store = WatchPuppyStore()

    var body: some Scene {
        WindowGroup {
            WatchQuickLogView()
                .environmentObject(store)
        }
    }
}
