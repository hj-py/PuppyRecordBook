import PhotosUI
import SwiftUI

struct RootView: View {
    @EnvironmentObject private var store: PuppyStore
    @State private var path = NavigationPath()
    @State private var visibleMonth = Date()
    @State private var selectedCategory: RecordType = .walk
    @State private var showingProfile = false

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(spacing: 14) {
                    header
                    PuppySummaryCard(showingProfile: $showingProfile)
                    NativeQuickLogPanel()
                    MonthControls(visibleMonth: $visibleMonth)
                    CalendarGrid(month: visibleMonth) { date in
                        path.append(DayRoute(date: date))
                    }
                    CategorySummary(month: visibleMonth, selectedType: $selectedCategory)
                    PhotoAlbumCalendar(month: visibleMonth) { date in
                        path.append(DayRoute(date: date))
                    }
                }
                .padding(16)
            }
            .background(AppColors.background.ignoresSafeArea())
            .navigationDestination(for: DayRoute.self) { route in
                DayRecordView(date: route.date)
            }
            .sheet(isPresented: $showingProfile) {
                ProfileView()
            }
        }
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Puppy Record Book")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.secondary)
                Text(visibleMonth.formatted(.dateTime.month(.wide).year()))
                    .font(.title.bold())
            }
            Spacer()
            Button {
                showingProfile = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.headline.bold())
                    .frame(width: 42, height: 42)
                    .background(AppColors.ink)
                    .foregroundStyle(.white)
                    .clipShape(Circle())
            }
            .accessibilityLabel("Default information")
        }
    }
}

struct DayRoute: Hashable {
    let date: Date
}

enum AppColors {
    static let background = Color(red: 0.97, green: 0.95, blue: 0.90)
    static let paper = Color(red: 1.0, green: 0.99, blue: 0.97)
    static let panel = Color(red: 0.98, green: 0.97, blue: 0.93)
    static let ink = Color(red: 0.15, green: 0.14, blue: 0.12)
    static let leaf = Color(red: 0.38, green: 0.47, blue: 0.38)
}

struct NativeQuickLogPanel: View {
    @EnvironmentObject private var store: PuppyStore

    private let quickTypes: [RecordType] = [.pee, .poop, .walk, .play, .sleep, .train, .food, .water, .box]
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 3)

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Quick log").font(.headline.bold())
            LazyVGrid(columns: columns, spacing: 8) {
                ForEach(quickTypes) { type in
                    Button {
                        store.quickLog(type)
                    } label: {
                        VStack(spacing: 4) {
                            Text(title(for: type))
                                .font(.caption.bold())
                                .lineLimit(1)
                            if let duration = store.activeDurationText(for: type) {
                                Text(duration)
                                    .font(.caption2.bold())
                            }
                        }
                        .frame(maxWidth: .infinity, minHeight: 48)
                    }
                    .buttonStyle(.plain)
                    .background(store.data.activeSessions[type] == nil ? AppColors.paper : AppColors.leaf)
                    .foregroundStyle(store.data.activeSessions[type] == nil ? AppColors.ink : .white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .padding(14)
        .background(AppColors.panel)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func title(for type: RecordType) -> String {
        type.isTimed && store.data.activeSessions[type] != nil ? "Stop \(type.title)" : type.title
    }
}
