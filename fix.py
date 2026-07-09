with open(".github/workflows/build_apk.yml", "r") as f:
    text = f.read()

# I will just update something minor to trigger
text = text.replace("name: Build APK", "name: Build APK 3")
with open(".github/workflows/build_apk.yml", "w") as f:
    f.write(text)
