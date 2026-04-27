import PhotosUI
import SwiftUI
import UIKit

struct DayRecordView: View {
    @EnvironmentObject private var store: PuppyStore
    @State private var date: Date
    @State private var time = Date()
    @State private var type: RecordType = .walk
    @State private var amount = ""
    @State private var note = ""
    @State private var selectedPhoto: PhotosPickerItem?

    init(date: Date) {
        _date = State(initialValue: date)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                addData
                records
                photos
            }
            .padding(16)
        }
        .background(AppColors.background.ignoresSafeArea())
        .navigationTitle(date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day()))
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: selectedPhoto) { _, item in
            Task { await importPhoto(item) }
        }
    }

    private var addData: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Add data").font(.headline.bold())
                Spacer()
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    Text("Photo").font(.caption.bold())
                }
                .buttonStyle(.borderedProminent)
            }
            DatePicker("Date", selection: $date, displayedComponents: .date)
            Picker("Type", selection: $type) {
                ForEach(RecordType.allCases) { Text($0.title).tag($0) }
            }
            .pickerStyle(.segmented)
            DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute)
            TextField(type.amountLabel, text: $amount)
                .textFieldStyle(.roundedBorder)
            TextField("Place or note", text: $note)
                .textFieldStyle(.roundedBorder)
            Button("Save") {
                store.addRecord(date: date, time: time, type: type, amount: amount, note: note)
                amount = ""
                note = ""
            }
            .buttonStyle(.borderedProminent)
            .tint(AppColors.leaf)
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(14)
        .background(AppColors.panel)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private var records: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Records").font(.headline.bold())
                Spacer()
                Text("\(store.records(on: date).count)").font(.caption.bold())
            }
            ForEach(store.records(on: date)) { record in
                HStack(spacing: 10) {
                    Text(record.type.title.prefix(1))
                        .font(.headline.bold())
                        .frame(width: 32, height: 32)
                        .background(record.type.color)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    VStack(alignment: .leading) {
                        Text("\(record.type.title) - \(record.time.formatted(.dateTime.hour().minute()))")
                            .font(.subheadline.bold())
                        Text([record.amount, record.note].filter { !$0.isEmpty }.joined(separator: " - "))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button(role: .destructive) {
                        store.deleteRecord(record)
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                    }
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

    private var photos: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Photos").font(.headline.bold())
            ScrollView(.horizontal) {
                HStack {
                    ForEach(store.photos(on: date)) { photo in
                        if let image = UIImage(data: photo.imageData) {
                            Image(uiImage: image)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 92, height: 92)
                                .clipped()
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                }
            }
        }
        .padding(14)
        .background(AppColors.panel)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func importPhoto(_ item: PhotosPickerItem?) async {
        guard let item,
              let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else {
            return
        }
        await MainActor.run {
            store.addPhoto(image, date: date)
            selectedPhoto = nil
        }
    }
}
