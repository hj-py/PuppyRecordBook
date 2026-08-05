import SwiftUI

struct WatchQuickLogView: View {
    @EnvironmentObject private var store: WatchPuppyStore
    @State private var ticker = Date()

    private let types: [RecordType] = [.pee, .poop, .food, .water, .walk, .sleep, .play, .train, .box]
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                Text("Leo")
                    .font(.headline.bold())
                Text(store.statusText)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)

                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(types) { type in
                        Button {
                            store.log(type)
                        } label: {
                            VStack(spacing: 3) {
                                Text(store.title(for: type))
                                    .font(.caption.bold())
                                    .lineLimit(1)
                                if let duration = store.durationText(for: type) {
                                    Text(duration)
                                        .font(.caption2.bold())
                                }
                            }
                            .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .tint(store.durationText(for: type) == nil ? .brown.opacity(0.65) : .green)
                    }
                }
            }
            .padding(.vertical, 6)
        }
        .onReceive(timer) { value in
            ticker = value
        }
    }
}
