import Foundation
import SwiftUI

enum RecordType: String, Codable, CaseIterable, Identifiable {
    case walk
    case food
    case poop
    case pee
    case weight
    case vaccine
    case school

    var id: String { rawValue }

    var title: String {
        switch self {
        case .walk: return "Walk"
        case .food: return "Food"
        case .poop: return "Poop"
        case .pee: return "Pee"
        case .weight: return "Weight"
        case .vaccine: return "Vaccine"
        case .school: return "Hundeschule"
        }
    }

    var color: Color {
        switch self {
        case .walk: return Color(red: 0.38, green: 0.47, blue: 0.38)
        case .food: return Color(red: 0.84, green: 0.61, blue: 0.25)
        case .poop: return Color(red: 0.48, green: 0.37, blue: 0.27)
        case .pee: return Color(red: 0.50, green: 0.65, blue: 0.72)
        case .weight: return Color(red: 0.78, green: 0.44, blue: 0.36)
        case .vaccine: return Color(red: 0.31, green: 0.44, blue: 0.58)
        case .school: return Color(red: 0.50, green: 0.42, blue: 0.64)
        }
    }

    var amountLabel: String {
        switch self {
        case .walk: return "Minutes"
        case .food: return "Amount"
        case .poop, .pee: return "Result"
        case .weight: return "Weight"
        case .vaccine: return "Dose"
        case .school: return "Topic"
        }
    }
}

struct PuppyProfile: Codable {
    var ownerName = ""
    var puppyName = "Mochi"
    var birthday = Calendar.current.date(byAdding: .month, value: -4, to: Date()) ?? Date()
    var breed = ""
    var weightKg = 5.1
    var notes = ""
}

struct SchoolInfo: Codable {
    var name = ""
    var trainer = ""
    var contact = ""
    var notes = ""
    var weekday = 7
    var time = DateComponents(hour: 18, minute: 0)
    var startDate = Date()
    var endDate: Date?
    var alarmEnabled = false
}

struct FoodAlarm: Codable {
    var morning = DateComponents(hour: 7, minute: 30)
    var afternoon: DateComponents?
    var evening = DateComponents(hour: 18, minute: 30)
    var enabled = false
}

struct VaccineInfo: Codable {
    var rabiesDate: Date?
    var rabiesValidUntil: Date?
    var alarmEnabled = false
}

struct PuppyRecord: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var time: Date
    var type: RecordType
    var amount: String
    var note: String
}

struct PuppyPhoto: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var imageData: Data
}

struct PuppyData: Codable {
    var profile = PuppyProfile()
    var school = SchoolInfo()
    var foodAlarm = FoodAlarm()
    var vaccine = VaccineInfo()
    var records: [PuppyRecord] = []
    var photos: [PuppyPhoto] = []
}
