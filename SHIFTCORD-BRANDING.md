# ShiftCord — branding notes

This source tree has been rebranded as ShiftCord by the community; it is not an upstream release.

## Changes made
- Android installer display name: **ShiftCord | Installer**
- Installer application ID: `com.tenmcord.installer` (preserved)
- Gradle root project name: `ShiftCord`
- Installer's displayed mod name: `ShiftCord`
- Visible installer strings updated in the bundled locale resource files.
- Bundle, loader and installer artwork updated for ShiftCord.

## Important build/runtime note
The installer still downloads the loader and bundle from the configured upstream release URLs. This branding-only source change does not rename package IDs, signed-release protocols or technical artifact names, and it does not create an independently maintained update backend. Preserve those values unless the release/update system is migrated deliberately.

## Build
Open `android/installer/` in Android Studio and build the `app` release variant. The APK output follows the configured `ShiftCord-<version>.apk` naming pattern. The project uses the original source licenses and notices; retain them when redistributing.

## Upstream repository
https://github.com/matosdevel0per/10mcord-mobile
