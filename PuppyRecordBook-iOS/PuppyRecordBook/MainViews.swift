import SwiftUI
import UIKit

struct PuppySummaryCard: View {
    @EnvironmentObject private var store: PuppyStore
    @Binding var showingProfile: Bool

    var body: some View {
        HStack(spacing: 12) {
            Group {
                if let image = store.latestPhotoImage() {
                    Image(uiImage: image).resizable().scaledToFill()
                } else {
                    Image(systemName: "pawprint.fill").resizable().scaledToFit().padding(28)
                }
            }
            .frame(width: 104, height: 104)
            .background(Color(red: 0.91, green: 0.87, blue: 0.80))
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 8) {
                Text(store.data.profile.puppyName)
                    .font(.headline.bold())
                Text("\(ageText) old")
                    .font(.subheadline.weight(.semibold))
                Text("Weight \(store.data.profile.weightKg, specifier: "%.1f") kg")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppColors.leaf)
                Text(growthInsight)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(12)
        .background(AppColors.panel)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .onTapGesture { showingProfile = true }
    }

    private var ageText: String {
        let components = Calendar.current.dateComponents([.year, .month, .day], from: store.data.profile.birthday, to: Date())
        if let years = components.year, years > 0 { return "\(years) yr \(components.month ?? 0) mo" }
        if let months = components.month, months > 0 { return "\(months) mo" }
        return "\(components.day ?? 0) days"
    }

    private var growthInsight: String {
        let weights = store.data.records.filter { $0.type == .weight }.sorted { $0.date < $1.date }
        guard let latest = weights.last else { return "Add weight records to see growth trend." }
        guard weights.count > 1 else { return "\(latest.amount) is the latest recorded weight." }
        return "Recent weight trend is being tracked."
    }
}

struct MonthControls: View {
    @Binding var visibleMonth: Date

    var body: some View {
        HStack {
            Spacer()
            Button("<") { shift(-1) }
            Button(">") { shift(1) }
        }
        .buttonStyle(.bordered)
        .font(.headline.bold())
    }

    private func shift(_ value: Int) {
        visibleMonth = Calendar.current.date(byAdding: .month, value: value, to: visibleMonth) ?? visibleMonth
    }
}

struct CalendarGrid: View {
    @EnvironmentObject private var store: PuppyStore
    let month: Date
    let onSelect: (Date) -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 5), count: 7)

    var body: some View {
        VStack(spacing: 8) {
            weekdayHeader
            LazyVGrid(columns: columns, spacing: 5) {
                ForEach(calendarDates, id: \.self) { date in
                    Button {
                        onSelect(date)
                    } label: {
                        VStack(spacing: 4) {
                            Text("\(Calendar.current.component(.day, from: date))")
                                .font(.caption.bold())
                            HStack(spacing: 2) {
                                ForEach(store.records(on: date).prefix(3)) { _ in
                                    Circle().frame(width: 5, height: 5)
                                }
                                if !store.photos(on: date).isEmpty {
                                    Circle().fill(Color.blue.opacity(0.75)).frame(width: 5, height: 5)
                                }
                            }
                            .frame(height: 8)
                        }
                        .frame(maxWidth: .infinity, minHeight: 45)
                        .background(Calendar.current.isDateInToday(date) ? AppColors.leaf.opacity(0.18) : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .foregroundStyle(Calendar.current.isDate(date, equalTo: month, toGranularity: .month) ? AppColors.ink : .secondary)
                    }
                }
            }
        }
        .padding(10)
        .background(AppColors.paper)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private var weekdayHeader: some View {
        HStack {
            ForEach(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], id: \.self) { day in
                Text(day).font(.caption2.bold()).frame(maxWidth: .infinity)
            }
        }
        .foregroundStyle(.secondary)
    }

    private var calendarDates: [Date] {
        let calendar = Calendar.current
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: month)) ?? month
        let weekday = calendar.component(.weekday, from: startOfMonth)
        let offset = (weekday + 5) % 7
        let start = calendar.date(byAdding: .day, value: -offset, to: startOfMonth) ?? startOfMonth
        return (0..<42).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }
}

struct CategorySummary: View {
    @EnvironmentObject private var store: PuppyStore
    let month: Date
    @Binding var selectedType: RecordType

    private let types: [RecordType] = [.walk, .food, .weight, .vaccine, .school]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("\(selectedType.title) Records").font(.headline.bold())
                Spacer()
                Text("\(store.records(type: selectedType, in: month).count)")
                    .font(.caption.bold())
                    .padding(7)
                    .background(AppColors.ink)
                    .foregroundStyle(.white)
                    .clipShape(Circle())
            }
            Picker("Category", selection: $selectedType) {
                ForEach(types) { type in Text(type.title).tag(type) }
            }
            .pickerStyle(.segmented)

            ForEach(store.records(type: selectedType, in: month)) { record in
                HStack {
                    Text(record.date.formatted(.dateTime.month(.twoDigits).day(.twoDigits)))
                        .font(.caption.bold())
                        .foregroundStyle(AppColors.leaf)
                    VStack(alignment: .leading) {
                        Text([record.amount, record.note].filter { !$0.isEmpty }.joined(separator: " - "))
                            .font(.subheadline.bold())
                        Text(record.time.formatted(.dateTime.hour().minute()))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding(10)
                .background(AppColors.paper)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(14)
        .background(AppColors.panel)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct PhotoAlbumCalendar: View {
    @EnvironmentObject private var store: PuppyStore
    let month: Date
    let onSelect: (Date) -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 5), count: 7)

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Photo Album").font(.headline.bold())
                Spacer()
                Text("\(store.data.photos.count)")
                    .font(.caption.bold())
                    .padding(7)
                    .background(AppColors.ink)
                    .foregroundStyle(.white)
                    .clipShape(Circle())
            }
            LazyVGrid(columns: columns, spacing: 5) {
                ForEach(calendarDates, id: \.self) { date in
                    let photos = store.photos(on: date)
                    Button {
                        onSelect(date)
                    } label: {
                        VStack(spacing: 3) {
                            Text("\(Calendar.current.component(.day, from: date))")
                                .font(.caption2.bold())
                            photoThumbs(photos)
                        }
                        .frame(maxWidth: .infinity, minHeight: 64)
                        .background(AppColors.panel)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    .foregroundStyle(AppColors.ink)
                }
            }
        }
        .padding(14)
        .background(AppColors.paper)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func photoThumbs(_ photos: [PuppyPhoto]) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 2) {
            ForEach(photos.prefix(4)) { photo in
                if let image = UIImage(data: photo.imageData) {
                    Image(uiImage: image).resizable().scaledToFill().frame(height: 18).clipped().clipShape(RoundedRectangle(cornerRadius: 4))
                }
            }
        }
    }

    private var calendarDates: [Date] {
        let calendar = Calendar.current
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: month)) ?? month
        let weekday = calendar.component(.weekday, from: startOfMonth)
        let offset = (weekday + 5) % 7
        let start = calendar.date(byAdding: .day, value: -offset, to: startOfMonth) ?? startOfMonth
        return (0..<42).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }
}
