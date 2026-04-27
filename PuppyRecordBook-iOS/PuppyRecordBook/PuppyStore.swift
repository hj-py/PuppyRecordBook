import Foundation
import SwiftUI
import UIKit
import UserNotifications

final class PuppyStore: ObservableObject {
    @Published var data: PuppyData {
        didSet {
            save()
        }
    }

    private let saveURL: URL
    private let calendar = Calendar.current

    init() {
        let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        saveURL = directory.appendingPathComponent("puppy-record-book.json")

        if let loaded = try? Data(contentsOf: saveURL),
           let decoded = try? JSONDecoder.puppyDecoder.decode(PuppyData.self, from: loaded) {
            data = decoded
        } else {
            data = PuppyData()
            seedSampleData()
        }
    }

    func records(on date: Date) -> [PuppyRecord] {
        data.records
            .filter { calendar.isDate($0.date, inSameDayAs: date) }
            .sorted { $0.time < $1.time }
    }

    func records(type: RecordType, in month: Date) -> [PuppyRecord] {
        data.records
            .filter { record in
                record.type == type &&
                (type == .vaccine || calendar.isDate(record.date, equalTo: month, toGranularity: .month))
            }
            .sorted { $0.date == $1.date ? $0.time < $1.time : $0.date < $1.date }
    }

    func photos(on date: Date) -> [PuppyPhoto] {
        data.photos.filter { calendar.isDate($0.date, inSameDayAs: date) }
    }

    func latestPhotoImage() -> UIImage? {
        data.photos.first.flatMap { UIImage(data: $0.imageData) }
    }

    func addRecord(date: Date, time: Date, type: RecordType, amount: String, note: String) {
        let record = PuppyRecord(date: date, time: time, type: type, amount: amount, note: note)
        data.records.append(record)
        if type == .weight, let weight = Double(amount.replacingOccurrences(of: ",", with: ".").filter { $0.isNumber || $0 == "." }) {
            data.profile.weightKg = weight
        }
    }

    func deleteRecord(_ record: PuppyRecord) {
        data.records.removeAll { $0.id == record.id }
        syncWeightFromLatestRecord()
    }

    func addPhoto(_ image: UIImage, date: Date) {
        guard let data = image.jpegData(compressionQuality: 0.82) else { return }
        self.data.photos.insert(PuppyPhoto(date: date, imageData: data), at: 0)
    }

    func syncWeightFromLatestRecord() {
        let weights = data.records
            .filter { $0.type == .weight }
            .sorted { $0.date < $1.date }

        guard let latest = weights.last,
              let value = Double(latest.amount.replacingOccurrences(of: ",", with: ".").filter({ $0.isNumber || $0 == "." })) else {
            return
        }
        data.profile.weightKg = value
    }

    func scheduleNotifications() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            guard granted else { return }
            UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
            self.scheduleFoodNotifications()
            self.scheduleSchoolNotification()
            self.scheduleVaccineNotifications()
        }
    }

    private func scheduleFoodNotifications() {
        guard data.foodAlarm.enabled else { return }
        let meals: [(String, DateComponents?)] = [
            ("Morning food", data.foodAlarm.morning),
            ("Afternoon food", data.foodAlarm.afternoon),
            ("Evening food", data.foodAlarm.evening)
        ]

        for (title, time) in meals {
            guard var components = time else { continue }
            let content = UNMutableNotificationContent()
            content.title = "Puppy Record Book"
            content.body = title
            content.sound = .default
            components.second = 0
            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
            let request = UNNotificationRequest(identifier: "food-\(title)", content: content, trigger: trigger)
            UNUserNotificationCenter.current().add(request)
        }
    }

    private func scheduleSchoolNotification() {
        guard data.school.alarmEnabled else { return }
        var components = data.school.time
        components.weekday = data.school.weekday
        components.second = 0

        let content = UNMutableNotificationContent()
        content.title = "Hundeschule"
        content.body = data.school.name.isEmpty ? "Training class today" : "\(data.school.name) today"
        content.sound = .default

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: "hundeschule-weekly", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    private func scheduleVaccineNotifications() {
        guard data.vaccine.alarmEnabled else { return }
        var dates: [(String, Date)] = []
        let earliestRabies = calendar.date(byAdding: .day, value: 84, to: data.profile.birthday)
        let travelValid = earliestRabies.flatMap { calendar.date(byAdding: .day, value: 21, to: $0) }
        if let earliestRabies { dates.append(("Rabies can be given from today", earliestRabies)) }
        if let travelValid { dates.append(("Rabies travel protection can start today", travelValid)) }
        if let validUntil = data.vaccine.rabiesValidUntil {
            let reminder = calendar.date(byAdding: .day, value: -30, to: validUntil) ?? validUntil
            dates.append(("Rabies booster due soon", reminder))
        }

        for (index, item) in dates.enumerated() {
            let content = UNMutableNotificationContent()
            content.title = "Vaccination reminder"
            content.body = item.0
            content.sound = .default
            let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: item.1)
            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            let request = UNNotificationRequest(identifier: "vaccine-\(index)", content: content, trigger: trigger)
            UNUserNotificationCenter.current().add(request)
        }
    }

    private func save() {
        if let encoded = try? JSONEncoder.puppyEncoder.encode(data) {
            try? encoded.write(to: saveURL, options: [.atomic])
        }
    }

    private func seedSampleData() {
        let now = Date()
        data.records = [
            PuppyRecord(date: now, time: now, type: .food, amount: "110g", note: "Breakfast"),
            PuppyRecord(date: now, time: now, type: .walk, amount: "22 min", note: "Maple park loop"),
            PuppyRecord(date: now, time: now, type: .weight, amount: "5.1kg", note: "Weekly weigh-in"),
            PuppyRecord(date: now, time: now, type: .school, amount: "Recall", note: "Loose leash and attention")
        ]
    }
}

extension JSONEncoder {
    static var puppyEncoder: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}

extension JSONDecoder {
    static var puppyDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}
