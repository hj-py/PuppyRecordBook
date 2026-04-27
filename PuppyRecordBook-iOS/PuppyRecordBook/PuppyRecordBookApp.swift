import SwiftUI

@main
struct PuppyRecordBookApp: App {
    @StateObject private var store = PuppyStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
        }
    }
}
