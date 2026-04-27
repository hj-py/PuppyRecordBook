import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var store: PuppyStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Owner") {
                    TextField("My name", text: $store.data.profile.ownerName)
                }

                Section("Puppy") {
                    TextField("Puppy name", text: $store.data.profile.puppyName)
                    DatePicker("Birthday", selection: $store.data.profile.birthday, displayedComponents: .date)
                    TextField("Breed", text: $store.data.profile.breed)
                    HStack {
                        Text("Weight")
                        Spacer()
                        TextField("kg", value: $store.data.profile.weightKg, format: .number.precision(.fractionLength(1)))
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    TextField("Basic notes", text: $store.data.profile.notes)
                }

                Section("Hundeschule") {
                    TextField("School name", text: $store.data.school.name)
                    TextField("Trainer", text: $store.data.school.trainer)
                    TextField("Contact", text: $store.data.school.contact)
                    TextField("Notes", text: $store.data.school.notes)
                    Toggle("Alarm", isOn: $store.data.school.alarmEnabled)
                    Picker("Repeats on", selection: $store.data.school.weekday) {
                        Text("Sunday").tag(1)
                        Text("Monday").tag(2)
                        Text("Tuesday").tag(3)
                        Text("Wednesday").tag(4)
                        Text("Thursday").tag(5)
                        Text("Friday").tag(6)
                        Text("Saturday").tag(7)
                    }
                    TimeComponentsPicker(title: "Time", components: $store.data.school.time)
                    DatePicker("Starts", selection: $store.data.school.startDate, displayedComponents: .date)
                }

                Section("Food Alarm") {
                    Toggle("Alarm", isOn: $store.data.foodAlarm.enabled)
                    TimeComponentsPicker(title: "Morning", components: $store.data.foodAlarm.morning)
                    OptionalTimeComponentsPicker(title: "Afternoon", components: $store.data.foodAlarm.afternoon)
                    TimeComponentsPicker(title: "Evening", components: $store.data.foodAlarm.evening)
                }

                Section("Vaccination Alarm") {
                    Toggle("Alarm", isOn: $store.data.vaccine.alarmEnabled)
                    OptionalDatePicker(title: "Last rabies vaccine", date: $store.data.vaccine.rabiesDate)
                    OptionalDatePicker(title: "Valid until", date: $store.data.vaccine.rabiesValidUntil)
                    Text("Germany/EU travel rules require valid rabies vaccination for cross-border pet travel. Rabies can be given from 12 weeks, and primary protection starts 21 days later.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Button("Update notification alarms") {
                    store.scheduleNotifications()
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        store.scheduleNotifications()
                        dismiss()
                    }
                }
            }
        }
    }
}

struct TimeComponentsPicker: View {
    let title: String
    @Binding var components: DateComponents

    var body: some View {
        DatePicker(title, selection: Binding(
            get: { Calendar.current.date(from: components) ?? Date() },
            set: { components = Calendar.current.dateComponents([.hour, .minute], from: $0) }
        ), displayedComponents: .hourAndMinute)
    }
}

struct OptionalTimeComponentsPicker: View {
    let title: String
    @Binding var components: DateComponents?

    var body: some View {
        Toggle(isOn: Binding(get: { components != nil }, set: { enabled in components = enabled ? DateComponents(hour: 12, minute: 0) : nil })) {
            Text(title)
        }
        if components != nil {
            TimeComponentsPicker(title: "\(title) time", components: Binding(
                get: { components ?? DateComponents(hour: 12, minute: 0) },
                set: { components = $0 }
            ))
        }
    }
}

struct OptionalDatePicker: View {
    let title: String
    @Binding var date: Date?

    var body: some View {
        Toggle(isOn: Binding(get: { date != nil }, set: { enabled in date = enabled ? Date() : nil })) {
            Text(title)
        }
        if date != nil {
            DatePicker(title, selection: Binding(get: { date ?? Date() }, set: { date = $0 }), displayedComponents: .date)
        }
    }
}
