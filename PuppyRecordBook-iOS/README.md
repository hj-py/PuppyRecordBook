# Puppy Record Book Native iOS/watchOS

Native SwiftUI source for an iPhone app, Apple Watch quick-log app, and iPhone widget starter for Puppy Record Book.

## Requirements

- macOS with Xcode installed
- iPhone or iOS Simulator
- Apple Watch paired with the iPhone for watch testing
- Apple ID for running on a real iPhone
- Apple Developer Program membership for TestFlight or App Store distribution

## Open In Xcode

This folder contains Swift source files, not a generated `.xcodeproj`. On a Mac:

1. Open Xcode.
2. Choose `File > New > Project > iOS > App`.
3. Product name: `PuppyRecordBook`.
4. Interface: `SwiftUI`.
5. Language: `Swift`.
6. Copy the files from `PuppyRecordBook/` into the iPhone app target.
7. Copy `Info.plist` into the target or add its `NSPhotoLibraryUsageDescription` value to the Xcode-generated plist.
8. Add a watchOS App target named `PuppyRecordBookWatch`.
9. Copy the files from `PuppyRecordBookWatch/` into the watch target.
10. Also include `PuppyRecordBook/Models.swift` in the watch target, because the watch quick-log app shares the same record types.
11. Add a Widget Extension target named `PuppyRecordBookWidgets`.
12. Copy the files from `PuppyRecordBookWidgets/` into the widget target.
13. Also include `PuppyRecordBook/Models.swift` in the widget target.
14. For an Apple Watch Smart Stack widget, add a watchOS Widget Extension too and reuse the same `PuppyRecordBookWidgets/` files.
15. Add the App Groups capability to the iPhone app and widget targets with this group ID: `group.com.hjpy.PuppyRecordBook`.
16. Add the Watch Connectivity capability/framework to the iPhone app and watch target.
17. Build and run first on the iPhone simulator, then on a real iPhone and paired Apple Watch.

## Included Native Features

- Puppy profile and basic information
- Calendar view
- Daily records for walk, food, water, poop, pee, weight, vaccine, Hundeschule, play, sleep, train, box, shower, brush teeth, and side notes
- Main-page native quick log buttons
- Start/stop timers for walk, play, sleep, train, and box
- Bookmarked days with a star on the calendar
- Profile weight syncs from the latest weight record
- Photo upload using the native photo picker
- Photo album calendar thumbnails
- Food, Hundeschule, and rabies vaccination notification scheduling
- Apple Watch quick-log app source
- WidgetKit quick-log widget source for pee, poop, food, and water. Use it for the iPhone widget target and reuse it for the watchOS Smart Stack widget target.

## Important Xcode Notes

- The App Group ID in the source is `group.com.hjpy.PuppyRecordBook`. If your Apple Developer Team requires a different identifier, update it in `PuppyStore.swift` and `QuickLogIntent.swift`.
- Interactive widgets require recent iOS versions. Use iOS 17 or later as the deployment target for the widget quick-log buttons.
- Test Watch Connectivity on a real paired iPhone and Apple Watch. The simulator is useful, but real device testing is much more reliable for watch sync.

## Important Note

iOS notification alarms require the app to be installed and notification permission granted. Xcode will request signing configuration before running on a physical iPhone.
