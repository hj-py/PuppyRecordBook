# Puppy Record Book iOS

Native SwiftUI iPhone app source for Puppy Record Book.

## Requirements

- macOS with Xcode installed
- iPhone or iOS Simulator
- Apple ID for running on a real iPhone

## Open In Xcode

This folder contains the Swift source files for the native app. On a Mac:

1. Open Xcode.
2. Choose `File > New > Project > iOS > App`.
3. Product name: `PuppyRecordBook`.
4. Interface: `SwiftUI`.
5. Language: `Swift`.
6. Copy the files from `PuppyRecordBook/` in this folder into the Xcode app target.
7. Copy `Info.plist` into the target or add its `NSPhotoLibraryUsageDescription` value to the Xcode-generated plist.
8. Build and run on an iPhone or simulator.

## Included Native Features

- Puppy profile and basic information
- Calendar view
- Daily records for walk, food, poop, pee, weight, vaccine, Hundeschule
- Profile weight syncs from the latest weight record
- Photo upload using the native photo picker
- Photo album calendar thumbnails
- Food, Hundeschule, and rabies vaccination notification scheduling

## Important Note

iOS notification alarms require the app to be installed and notification permission granted. Xcode will request signing configuration before running on a physical iPhone.
