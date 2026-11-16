# 10MCord — branding notes

This is a community rebrand of the 10MCord Mobile source tree, not an official 10MCord release.

## Changes made
- Android installer display name: **10MCord Installer**
- Installer application ID: `com.tenmcord.installer`
- Gradle output base name: `10MCord`
- Installer's displayed mod name: `10MCord`
- Visible installer strings updated in the bundled locale resource files.

## Important build/runtime note
The installer still downloads the upstream 10MCord loader and bundle from the original
10MCord Mobile release URLs, and its repository/about links still point to the upstream
project. This branding-only source change does **not** create a separately maintained
10MCord loader or backend. Do not publish it as an official 10MCord build.

## Build
Open `android/installer/` in Android Studio and build the `app` release variant.
The APK output is named `10MCord-1.0.3.apk` (version may change with `gradle.properties`).
The project uses the original source licenses and notices; retain them when redistributing.

## Upstream
https://github.com/matosdevel0per/10mcord-mobile
