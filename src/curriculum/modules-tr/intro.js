export default {
  "id": "intro",
  "title": "Başlangıç",
  "description": "React'in ne işe yaradığı ve bir React projesinin nasıl kurulduğu.",
  "lessons": {
    "what-is-react": {
      "title": "React Hangi Sorunu Çözüyor",
      "content": "\n# React Hangi Sorunu Çözüyor?\n\n### Bu nedir?\nReact, kullanıcı arayüzü kurmak için kullanılan bir JavaScript kütüphanesidir. Bu cümle doğru ama tek başına pek işe yaramaz, o yüzden işe yarayan hâli şu: **React, ekranı elle güncellemek zorunda kalmayasınız diye var.**\n\nSiz belirli bir veri için ekranın nasıl görünmesi gerektiğini tarif edersiniz. Veri değiştiğinde sayfada neyin değişeceğini React hesaplar. Güncelleme talimatlarını siz yazmazsınız.\n\n> 💡 **Zihinsel Model:** Sayfayı elle yazmak, bir beyaz tahtayı bir defterle senkron tutmaya benzer. Defteri her değiştirdiğinizde kalkıp tahtayı yeniden çizmeyi hatırlamanız gerekir. React, defteri sizin yerinize izleyip tahtayı yeniden çizen kişidir — siz yalnızca defteri düzenlersiniz.\n\n### Tek satır React yazmadan önce bunun neden önemli olduğu\nReact olmadan da tarayıcı size sayfayı değiştirecek araçları verir: eleman oluştur, metnini ayarla, dinleyici bağla. Bu çalışır. Sorun şu ki **veriniz ile ekranınız aynı gerçeğin iki ayrı kopyasıdır** ve iki kopyayı uyumlu tutmak, her yeni özellikle birlikte büyüyen bir iştir.\n\nAşağıdaki örneğe bakın. Ortada tek bir sayı ve onu gösteren tek bir satır yazı var. Şimdiden uyuşması gereken iki yer ve tek işi birincisini ikincisine kopyalamak olan bir fonksiyon var. İkinci bir düğme ekleyin, üç yer olur. Bir filtre, bir toplam ve bir \"son güncelleme\" etiketi ekleyin, bir düzine olur — ve bir satırı unuttuğunuzda hepsi sessizce bozulur.\n\nBuradaki kilit kelime *sessizce*. Hiçbir hata fırlatılmaz. Ekran yalnızca artık doğru olmayan bir sayı gösterir.\n\n### React sorunun şeklini nasıl değiştiriyor\nReact kopyalama adımını ortadan kaldırır. *\"Sayı değiştiğinde etiketi bul ve metnini ayarla\"* yazmak yerine, *\"etiket sayıyı gösterir\"* yazarsınız — bir kez — ve sayı her değiştiğinde React bu tarifi yeniden çalıştırır.\n\nFikrin tamamı bu. Kursun geri kalanı ayrıntıdır:\n1. **Ekranı tarif etmenin bir yolu** — bir sonraki modülde tanışacağınız JSX.\n2. **Değişen veriyi tutmanın bir yolu** — state.\n3. **Değiştiğinde tepki vermenin bir yolu** — React'in tarifinizi yeniden çalıştırması.\n\n### Bu dersin playground'u hakkında bir not\nAşağıdaki kod React değil, düz tarayıcı JavaScript'i — bu yüzden çalıştırılacak bir önizleme yok, kod okunmak için burada. Bir sonraki dersten itibaren playground kodunuzu çalıştırıyor.\n\n### Example\n```js\nlet count = 0;\n\nconst label = document.createElement('p');\nconst button = document.createElement('button');\nbutton.textContent = 'Add one';\n\nfunction render() {\n  label.textContent = 'Count: ' + count;\n}\n\nbutton.addEventListener('click', () => {\n  count = count + 1;\n  render();\n});\n\nrender();\ndocument.body.append(label, button);\n```\n\n### Challenge\n**Challenge:** Bir **Reset** düğmesi eklendi. Tıklandığında `count` değerini `0`'a döndürüyor, ama ekran eski sayıyı göstermeye devam ediyor. Sıfırlamanın ekranı da güncellemesini sağlayın.\n\nReact'in imkânsız kılmak için tasarlandığı hata tam olarak budur.\n\n### Hints\n* Veri ile ekran ayrı şeylerdir. `count` değişmesi yazıyı değiştirmez.\n* **Add one** işleyicisinin `count` değerini değiştirdikten sonra ne yaptığına bakın.\n* Reset işleyicisinde tam olarak bir satır eksik.\n\n**Solution:**\n`count` değerini değiştirdikten sonra, tıpkı add işleyicisindeki gibi `render()` çağırın. Bunun bedeline dikkat edin: veriyi değiştiren her yer `render()` çağırmayı hatırlamak zorunda ve biri unuttuğunda sizi hiçbir şey uyarmıyor. React'te bu satırı hiç yazmayacaksınız, çünkü ekranı tarif etmek ile güncellemek artık iki ayrı iş değil.\n",
      "exampleWalkthrough": {
        "steps": [
          "Veri bu — gerçekten doğru olan tek şey. Ekrandaki her şey onun bir kopyası ve kopyalar bayatlayabilir.",
          "İki eleman elle oluşturuluyor. Sayfada henüz hiçbir şey yok; bunlar son satır onları bağlayana kadar yalnızca bellekte duruyor.",
          "`render` kopyalama adımıdır. Bütün işi `count` değerini alıp etikete yazmaktır. React'te ortadan kalkan parça işte bu fonksiyondur.",
          "Bedeli burada. 12. satır veriyi değiştiriyor. 13. satır ekranı güncelliyor. Bunlar iki ayrı talimat ve **aralarında hiçbir bağ yok** — 13. satırı silerseniz kod yine çalışır, yine sayar ve sessizce yanlış sayıyı gösterir.",
          "İlk `render()` başlangıç değerini basıyor, ardından iki eleman da sayfaya bağlanıyor.\n\nEkranda görünen:\n`Count: 0`\nve `Add one` yazan bir düğme."
        ]
      },
      "walkthrough": {
        "steps": [
          "Add işleyicisi kopyalanacak model: veriyi değiştir, sonra ekranı güncelle. Her seferinde iki adım.",
          "Reset işleyicisi `count` değerini `0` yapıyor ve artık `render()` de çağırıyor. Bu düzeltmeden önce veri `0` derken etiket hâlâ `7` diyordu — hata yok, uyarı yok, yalnızca yalan söyleyen bir ekran.",
          "Birkaç kez sayıp sonra sıfırlayın: etiket artık takip ediyor.\n\nDers, hatırlamak zorunda kaldığınız şeyde gizli. `count` değerine dokunan her yeni düğme aynı yükümlülüğü taşıyacak ve derleyici size bunu asla hatırlatmayacak."
        ]
      },
      "insights": [
        {
          "title": "React bir framework mü, kütüphane mi?",
          "steps": [
            "React tek bir işi üstlenir: veriyi ekranın bir tarifine çevirmek ve ekranı onunla uyumlu tutmak. Bu dar odak, genellikle framework yerine kütüphane denmesinin sebebidir.",
            "Geri kalan her şey sizin ayrı ayrı verdiğiniz kararlardır. Bu kursun ilerleyen bölümlerinde yönlendirme (routing) ve sunucu verisinin kendi araçlarıyla ayrı modüller olarak işlenmesinin sebebi budur — bunlar React'in parçası değildir ve öyleymiş gibi davranmak yaygın bir kafa karışıklığı kaynağıdır."
          ]
        },
        {
          "title": "Neden doğrudan tarayıcıyı kullanmıyoruz?",
          "steps": [
            "Tek bir değer ve tek bir yer söz konusuysa, elle yazılmış DOM kodu React'ten gerçekten daha basittir. Burada bir kütüphaneye uzanmak fazla kaçar ve pek çok sayfa tam olarak böyle kurulur.",
            "Zorluk herhangi bir satırda değil — her biri kolay. Zorluk, dördünün de birlikte, `count` değerini değiştirebilen her yerden, sonsuza kadar güncellenmesi gerektiğidir. Hatırlanacak şeylerin sayısı özelliklerle birlikte büyür ve birini unutmak çökme değil, yanlış bir ekran üretir. React bu büyüyen yükümlülüğü sabit bir tanesiyle takas eder: ekranı bir kez tarif edin."
          ]
        }
      ]
    },
    "modules-and-imports": {
      "title": "İçe/Dışa Aktarma ve Proje Yapısı",
      "content": "\n# İçe/Dışa Aktarma ve Proje Yapısı\n\n### Bu nedir?\nBir React uygulaması tek bir uzun dosya değildir. Her biri bir şeyler **dışa aktaran** (export) ve diğerlerinden ihtiyacı olanı **içe aktaran** (import) çok sayıda küçük dosyadır. Bu kursta neredeyse her dersin başında şu satırı göreceksiniz:\n\n```javascript\nimport { useState } from 'react';\n```\n\nBu ders, o satırın gerçekte ne yaptığını anlatıyor — ki artık atlayıp geçtiğiniz bir gürültü olmaktan çıksın.\n\n> 💡 **Zihinsel Model:** Bir dosya, servis penceresi olan bir atölyedir. İçerideki her şey varsayılan olarak özeldir. `export`, bir şeyi diğer dosyaların alabileceği pencereye koymaktır. `import` ise başka bir atölyenin penceresine gidip oradakini almaktır.\n\n### İki tür dışa aktarma\n**İsimli dışa aktarma** — dosya başına istediğiniz kadar, tam adıyla ve süslü parantez içinde alınır:\n```javascript\n// money.js\nexport const CURRENCY = 'USD';\nexport function formatPrice(n) { /* ... */ }\n\n// başka bir yerde, alan taraf:\n//   import { CURRENCY, formatPrice } from './money.js';\n```\n\n**Varsayılan dışa aktarma** — dosya başına en fazla bir tane, ve adını alan dosya seçer:\n```javascript\n// Button.js\nexport default function Button() { /* ... */ }\n\n// başka bir yerde — aşağıdaki üç satır da aynı fonksiyonu içe aktarır:\n//   import Button from './Button.js';\n//   import MyButton from './Button.js';\n//   import AnythingAtAll from './Button.js';\n```\n\nBir dosyada ikisi birden olabilir. `import React, { useState } from 'react'` satırının yaptığı tam olarak budur: `React` varsayılan dışa aktarma, `useState` ise isimli bir tanesidir.\n\n### 'react' nereden geliyor?\nŞu ikisi arasındaki farka dikkat edin:\n```javascript\nimport Button from './Button.js';  // bir yol -> sizin yazdığınız bir dosya\nimport { useState } from 'react';  // çıplak bir isim -> kurulu bir paket\n```\n`./` veya `../` ile başlayan bir yol kendi dosyanızı gösterir. Çıplak bir isim ise bir **paket**tir: bir paket yöneticisi, genellikle `npm`, tarafından `node_modules` adlı bir klasöre indirilmiş üçüncü parti kod.\n\nKendi bilgisayarınızda bir React projesi terminalden dört adımda kurulur ve başlatılır:\n\n1. `npm create vite@latest my-app -- --template react` — proje klasörünü oluştur.\n2. `cd my-app` — içine gir.\n3. `npm install` — paketleri indir.\n4. `npm run dev` — geliştirme sunucusunu başlat.\n\n`npm install`, `package.json` dosyasını okur, React'i ve orada listelenen her şeyi `node_modules` içine indirir; bundan sonra `import ... from 'react'` çözümlenir. Kursu almak için bunları çalıştırmanız gerekmiyor — bu uygulama ortamı zaten sağlıyor — ama kendi projenizi açtığınızda karşılaşacağınız yapı şudur:\n\n```javascript\n// my-app/\n//   package.json        bu projenin ihtiyaç duyduğu paketlerin listesi\n//   node_modules/       indirilmiş paketler (elle düzenlenmez)\n//   index.html          uygulamanın sunulduğu tek sayfa\n//   src/\n//     main.jsx          giriş noktası: bir DOM düğümü bulup React'e verir\n//     App.jsx           en üstteki bileşeniniz\n```\n\n### Example\n```js\nexport const COURSE_NAME = 'ReactLab';\n\nfunction buildGreeting(name) {\n  return 'Hello, ' + name + '! Welcome to ' + COURSE_NAME + '.';\n}\n\nexport default function App() {\n  return buildGreeting('Ada');\n}\n```\n\n### Challenge\n**Challenge:** Bu dosya ihtiyacı olan her şeyi tanımlıyor ama hiçbir şey dışa aktarmıyor — yani başka hiçbir dosya onu kullanamaz ve uygulamanın ekrana basacağı bir bileşen yok. İki dışa aktarmayı ekleyin: `CURRENCY` isimli dışa aktarma olsun, `App` ise varsayılan dışa aktarma.\n\n### Hints\n* İsimli dışa aktarma, mevcut bir bildirimin önüne `export` kelimesini koymaktır.\n* Dosya başına yalnızca bir varsayılan dışa aktarma olabilir ve başka bir dosyanın ekrana basmak istediği şey `App`.\n* Satır taşımıyorsunuz, kelime ekliyorsunuz.\n\n**Solution:**\n`const CURRENCY` önüne `export` koyun ki diğer dosyalar adıyla içe aktarabilsin; `function App` önüne de `export default` koyun ki giriş noktası onu istediği adla alabilsin. `formatPrice` dışa aktarılmadan kalıyor — yalnızca bu dosyanın içinde kullanılıyor ve onu özel bırakmak, servis penceresine sahip olmanın bütün amacı.\n",
      "exampleWalkthrough": {
        "steps": [
          "Bir **isimli dışa aktarma**. Başka bir dosya bunu `import { COURSE_NAME } from './App.js'` ile alır — süslü parantezler de tam yazım da zorunludur.",
          "`buildGreeting` önünde `export` olmadığı için bu dosyaya özeldir. Burada serbestçe kullanılabilir, başka her yerde görünmezdir. Varsayılan olan özelliktir; dışa aktarmak bilinçli bir eylemdir.",
          "**Varsayılan dışa aktarma.** Dosya başına en fazla bir tane olabilir ve adını alan dosya koyar: `import App from './App.js'` ile `import Root from './App.js'` aynı fonksiyonu alır.\n\nBu fonksiyon işaretleme yerine düz bir metin döndürüyor ve React bunu yazı olarak basıyor. Bir sonraki modülden itibaren JSX'in gireceği yer burası.\n\nEkranda görünen:\n`Hello, Ada! Welcome to ReactLab.`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Mevcut `const` önündeki `export`, `CURRENCY` değerini adıyla alınabilir hâle getiriyor. Bildirimin kendisi değişmedi — hiçbir şey taşınmadı, tek kelime eklendi.",
          "`formatPrice` bilinçli olarak dışa aktarılmadı. Bu dosyanın iç detayı ve onu özel tutmak, ileride kimseyi bozmadan yeniden adlandırmanıza veya yeniden yazmanıza izin verir.",
          "`export default`, `App` fonksiyonunu bu dosyanın ana sunumu olarak işaretliyor; böylece giriş noktası onu ekrana basabiliyor.\n\nEkranda görünen:\n`19.50 USD`"
        ]
      },
      "insights": [
        {
          "title": "`import { useState }` neden süslü parantez kullanıyor da `import React` kullanmıyor?",
          "steps": [
            "Tek bir import satırı iki türü birden alabilir. Virgülden önceki `React` varsayılan dışa aktarmadır — adını değiştirebilirsiniz. Süslü parantez içindeki `useState` isimli bir dışa aktarmadır ve tam olarak öyle yazılmalıdır.",
            "Süslü parantezler nesne ayrıştırmaya (destructuring) benziyor ve böyle okumak yeterince sık işe yaradığı için tehlikeli. Bunlar ayrı bir sözdizimidir ve kodunuz çalışmadan önce çözümlenir — bu yüzden bir `if` bloğu içinde koşullu import yapamazsınız ve bu yüzden isimli bir import'taki yazım hatası çalışma anında değil, derleme anında patlar."
          ]
        }
      ]
    }
  }
};
