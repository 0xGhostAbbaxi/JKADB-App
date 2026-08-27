# JKADB ko APK banane ka tareeqa

## Step 1 — Files apne repo mein daalo
Ye 3 files/folders apne `jkadb-app` repo ke **root** mein copy karo (jahan `package.json` hai):

```
capacitor.config.json
www/index.html
.github/workflows/main.yml
```

## Step 2 — GitHub par push karo
```
git add capacitor.config.json www .github
git commit -m "Add Android APK build setup"
git push origin main
```

## Step 3 — APK download karo
1. GitHub repo kholo -> **Actions** tab
2. "Build Android APK" workflow chalte hue dikhega (2-4 minute lagenge)
3. Complete hone ke baad, us workflow run ke andar neeche **Artifacts** section mein
   `jkadb-debug-apk` milega -> download kar lo, phone mein install karo.

Abhi ye APK sirf ek placeholder screen dikhayega ("live server se connected nahi")
kyunki hum ne jaan-boojh kar live site se disconnect rakha hai.

## Step 4 — Baad mein live se connect karna ho jab
`capacitor.config.json` file kholo aur is tarah edit karo:

```json
{
  "appId": "com.majorforce.jkadb",
  "appName": "JKADB",
  "webDir": "www",
  "bundledWebRuntime": false,
  "server": {
    "url": "https://YAHAN-APNI-LIVE-JKADB-URL-DALO.com",
    "cleartext": true
  }
}
```

Phir dobara `git push` karo — workflow khud nayi APK bana dega jo seedha
tumhari live JKADB website load karegi (ab wo real Android app ki tarah kaam karegi).

## Zaroori note
- Ye APK andar se ek "wrapper" hai — database aur login sab kaam tumhare
  live server (jahan JKADB deploy hoga) se hote hain, phone ke andar nahi.
  Isliye connect karne se pehle live deployment zaroori hai.
- Play Store par publish karne ke liye "release" (signed) APK/AAB banana
  padega — ye workflow filhaal sirf "debug" APK banata hai jo testing/
  direct-install ke liye theek hai.
