import AppIntents
import SwiftUI
import WidgetKit

struct PuppyWidgetEntry: TimelineEntry {
    let date: Date
    let puppyName: String
    let todayCount: Int
}

struct PuppyQuickLogProvider: TimelineProvider {
    func placeholder(in context: Context) -> PuppyWidgetEntry {
        PuppyWidgetEntry(date: Date(), puppyName: "Leo", todayCount: 0)
    }

    func getSnapshot(in context: Context, completion: @escaping (PuppyWidgetEntry) -> Void) {
        completion(entry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PuppyWidgetEntry>) -> Void) {
        completion(Timeline(entries: [entry()], policy: .after(Date().addingTimeInterval(15 * 60))))
    }

    private func entry() -> PuppyWidgetEntry {
        let data = SharedPuppyWidgetStore.load()
        let count = data.records.filter { Calendar.current.isDateInToday($0.date) }.count
        return PuppyWidgetEntry(date: Date(), puppyName: data.profile.puppyName, todayCount: count)
    }
}

struct PuppyQuickLogWidgetView: View {
    let entry: PuppyWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.puppyName)
                    .font(.headline.bold())
                Spacer()
                Text("\(entry.todayCount)")
                    .font(.caption.bold())
                    .padding(6)
                    .background(Color.black.opacity(0.85))
                    .foregroundStyle(.white)
                    .clipShape(Circle())
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
                Button(intent: PuppyQuickLogIntent(action: .pee)) {
                    Text("Pee").frame(maxWidth: .infinity)
                }
                Button(intent: PuppyQuickLogIntent(action: .poop)) {
                    Text("Poop").frame(maxWidth: .infinity)
                }
                Button(intent: PuppyQuickLogIntent(action: .food)) {
                    Text("Food").frame(maxWidth: .infinity)
                }
                Button(intent: PuppyQuickLogIntent(action: .water)) {
                    Text("Water").frame(maxWidth: .infinity)
                }
            }
            .font(.caption.bold())
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.38, green: 0.47, blue: 0.38))
        }
        .containerBackground(Color(red: 0.98, green: 0.97, blue: 0.93), for: .widget)
    }
}

struct PuppyQuickLogWidget: Widget {
    let kind = "PuppyQuickLogWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PuppyQuickLogProvider()) { entry in
            PuppyQuickLogWidgetView(entry: entry)
        }
        .configurationDisplayName("Puppy Quick Log")
        .description("Quickly log Leo's common daily records.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

@main
struct PuppyRecordBookWidgetBundle: WidgetBundle {
    var body: some Widget {
        PuppyQuickLogWidget()
    }
}
