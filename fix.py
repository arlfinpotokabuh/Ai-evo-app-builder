with open(".github/workflows/build_apk.yml", "w") as f:
    f.write("""name: Build APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'zulu'
      - uses: subosito/flutter-action@v2
        with:
          channel: stable
      - name: Setup Android Project
        run: |
          rm -rf android
          flutter create . --platforms android
          
          cat << 'XML' > android/app/src/main/AndroidManifest.xml
          <manifest xmlns:android="http://schemas.android.com/apk/res/android">
              <uses-permission android:name="android.permission.INTERNET" />
              <application
                  android:label="AI Evo App Builder"
                  android:name="\\${applicationName}"
                  android:icon="@mipmap/ic_launcher">
                  <activity
                      android:name=".MainActivity"
                      android:exported="true"
                      android:launchMode="singleTop"
                      android:theme="@style/LaunchTheme"
                      android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
                      android:hardwareAccelerated="true"
                      android:windowSoftInputMode="adjustResize">
                      <intent-filter>
                          <action android:name="android.intent.action.MAIN"/>
                          <category android:name="android.intent.category.LAUNCHER"/>
                      </intent-filter>
                  </activity>
              </application>
          </manifest>
          XML
          
          cat << 'GRADLE' > android/settings.gradle
          pluginManagement {
              def flutterSdkPath = {
                  def properties = new Properties()
                  file("local.properties").withInputStream { properties.load(it) }
                  def flutterSdkPath = properties.getProperty("flutter.sdk")
                  assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
                  return flutterSdkPath
              }
              settings.ext.flutterSdkPath = flutterSdkPath()
          
              includeBuild("\\${settings.ext.flutterSdkPath}/packages/flutter_tools/gradle")
          
              repositories {
                  google()
                  mavenCentral()
                  gradlePluginPortal()
              }
          
              plugins {
                  id "dev.flutter.flutter-plugin-loader" version "1.0.0"
                  id "com.android.application" version "8.7.0" apply false
                  id "org.jetbrains.kotlin.android" version "1.9.24" apply false
              }
          }
          
          include ":app"
          GRADLE
          
          cat << 'GRADLE2' > android/build.gradle
          allprojects {
              repositories {
                  google()
                  mavenCentral()
              }
          }
          
          rootProject.buildDir = '../build'
          subprojects {
              project.buildDir = "\\${rootProject.buildDir}/\\${project.name}"
          }
          subprojects {
              project.evaluationDependsOn(':app')
          }
          
          tasks.register("clean", Delete) {
              delete rootProject.buildDir
          }
          GRADLE2
      - run: flutter pub get
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: build/app/outputs/flutter-apk/app-release.apk
""")
