import Foundation
import SwiftUI

enum RecordType: String, Codable, CaseIterable, Identifiable {
    case walk
    case food
    case water
    case poop
    case pee
    case weight
    case vaccine
    case school
    case play
    case sleep
    case train
    case box
    case shower
    case tooth
    case note

    var id: String { rawValue }

    var title: String {
        switch self {
        case .walk: return "Walk"
        case .food: return "Food"
        case .water: return "Water"
        case .poop: return "Poop"
        case .pee: return "Pee"
        case .weight: return "Weight"
        case .vaccine: return "Vaccine"
        case .school: return "Hundeschule"
        case .play: return "Play"
        case .sleep: return "Sleep"
        case .train: return "Train"
        case .box: return "Box"
        case .shower: return "Shower"
        case .tooth: return "Brush teeth"
        case .note: return "Note"
        }
    }

    var color: Color {
        switch self {
        case .walk: return Color(red: 0.38, green: 0.47, blue: 0.38)
        case .food: return Color(red: 0.84, green: 0.61, blue: 0.25)
        case .water: return Color(red: 0.34, green: 0.60, blue: 0.68)
        case .poop: return Color(red: 0.48, green: 0.37, blue: 0.27)
        case .pee: return Color(red: 0.50, green: 0.65, blue: 0.72)
        case .weight: return Color(red: 0.78, green: 0.44, blue: 0.36)
        case .vaccine: return Color(red: 0.31, green: 0.44, blue: 0.58)
        case .school: return Color(red: 0.50, green: 0.42, blue: 0.64)
        case .play: return Color(red: 0.84, green: 0.54, blue: 0.42)
        case .sleep: return Color(red: 0.44, green: 0.47, blue: 0.59)
        case .train: return Color(red: 0.51, green: 0.44, blue: 0.27)
        case .box: return Color(red: 0.54, green: 0.47, blue: 0.41)
        case .shower: return Color(red: 0.31, green: 0.56, blue: 0.54)
        case .tooth: return Color(red: 0.44, green: 0.56, blue: 0.71)
        case .note: return Color(red: 0.43, green: 0.42, blue: 0.37)
        }
    }

    var amountLabel: String {
        switch self {
        case .walk: return "Minutes"
        case .food: return "Amount"
        case .water: return "Amount"
        case .poop, .pee: return "Result"
        case .weight: return "Weight"
        case .vaccine: return "Dose"
        case .school: return "Topic"
        case .play, .sleep, .train, .box: return "Duration"
        case .shower, .tooth: return "Detail"
        case .note: return "Topic"
        }
    }

    var isTimed: Bool {
        [.walk, .play, .sleep, .train, .box].contains(self)
    }
}

struct PuppyProfile: Codable {
    var ownerName = ""
    var puppyName = "Leo"
    var birthday = Calendar.current.date(from: DateComponents(year: 2026, month: 3, day: 14)) ?? Date()
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
    var startTime: Date?
    var endTime: Date?
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
    var activeSessions: [RecordType: Date] = [:]
    var bookmarkedDays: [Date] = []
}
