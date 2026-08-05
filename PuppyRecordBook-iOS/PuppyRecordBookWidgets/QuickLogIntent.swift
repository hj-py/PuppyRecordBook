import AppIntents
import Foundation
import WidgetKit

enum QuickLogAction: String, AppEnum {
    case pee
    case poop
    case food
    case water

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Quick log action")

    static var caseDisplayRepresentations: [QuickLogAction: DisplayRepresentation] = [
        .pee: "Pee",
        .poop: "Poop",
        .food: "Food",
        .water: "Water"
    ]

    var recordType: RecordType {
        switch self {
        case .pee: return .pee
        case .poop: return .poop
        case .food: return .food
        case .water: return .water
        }
    }
}

struct PuppyQuickLogIntent: AppIntent {
    static var title: LocalizedStringResource = "Log puppy record"
    static var description = IntentDescription("Saves a quick Puppy Record Book entry from a widget.")
    static var openAppWhenRun = false

    @Parameter(title: "Action")
    var action: QuickLogAction

    init() {}

    init(action: QuickLogAction) {
        self.action = action
    }

    func perform() async throws -> some IntentResult {
        SharedPuppyWidgetStore.quickLog(action.recordType)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

enum SharedPuppyWidgetStore {
    private static let appGroupID = "group.com.hjpy.PuppyRecordBook"
    private static let key = "puppy-record-book-data"

    static func load() -> PuppyData {
        guard let data = UserDefaults(suiteName: appGroupID)?.data(forKey: key),
              let decoded = try? JSONDecoder.puppyDecoder.decode(PuppyData.self, from: data) else {
            return PuppyData()
        }
        return decoded
    }

    static func save(_ puppyData: PuppyData) {
        guard let encoded = try? JSONEncoder.puppyEncoder.encode(puppyData) else { return }
        UserDefaults(suiteName: appGroupID)?.set(encoded, forKey: key)
    }

    static func quickLog(_ type: RecordType) {
        var puppyData = load()
        let now = Date()
        let amount: String
        let note: String

        switch type {
        case .food:
            amount = "Food"
            note = "Widget quick log"
        case .water:
            amount = "Water"
            note = "Widget quick log"
        default:
            amount = "Quick log"
            note = ""
        }

        puppyData.records.append(PuppyRecord(date: now, time: now, type: type, amount: amount, note: note))
        save(puppyData)
    }
}
