export default {
  "id": "fundamentals",
  "title": "Temeller",
  "description": "Bileşenler, JSX, prop'lar, state, olaylar, koşullu basma, listeler ve key'ler.",
  "lessons": {
    "jsx-intro": {
      "title": "JSX Söz Dizimi ve Kuralları",
      "content": "\n# JSX Söz Dizimi ve Kuralları\n\n### Bu nedir?\n**JSX (JavaScript XML)**, JavaScript kodunun içine doğrudan HTML benzeri işaretleme yazmanızı sağlayan bir söz dizimi uzantısıdır. Bir şablon dili değildir — düz JavaScript fonksiyon çağrılarına derlenir.\n\n> 💡 **Zihinsel Model:** JSX, kılık değiştirmiş bir telefon görüşmesidir. `<h1 className=\"title\">Hello</h1>` yazdığınızda derleyici bunu `_jsx('h1', { className: 'title', children: 'Hello' })` hâline getirir. HTML yazmıyorsunuz — neyin basılmasını istediğinizi anlatan düz bir JavaScript nesnesi (React elemanı) döndüren bir fonksiyon çağrısı yazıyorsunuz.\n\n### React neden düz JavaScript yerine JSX kullanıyor?\nJSX olmadan arayüz tanımlamak derin iç içe fonksiyon çağrıları gerektirir:\n```jsx\n// JSX olmadan: okuması ve bakımı zor\nReact.createElement('div', { className: 'card' },\n  React.createElement('h1', null, 'Hello World'),\n  React.createElement('p', null, 'Welcome')\n);\n\n// JSX ile: tarif ettiği arayüz yapısı gibi okunur\n<div className=\"card\">\n  <h1>Hello World</h1>\n  <p>Welcome</p>\n</div>\n```\nJSX sürümü görsel hiyerarşiyi doğrudan gösterir. İç içe `createElement` çağrıları onu gizler. JSX tamamen bir geliştirici deneyimi aracıdır — tarayıcı onu hiç görmez. Babel, Vite veya SWC gibi araçlar kodunuz çalışmadan önce JSX'i derleyip kaldırır.\n\n### JSX'in 4 Temel Kuralı\n\n1. **Tek Kök Eleman** — Her bileşen dönüşünün tek bir üst düzey elemanı olmalıdır. Gerçek bir DOM düğümü eklemeden kardeşleri gruplamak için Fragment `<>...</>` kullanın.\n\n2. **`class` yerine `className`** — `className`, elemanın class özelliğine karşılık gelen React DOM prop'udur. JSX, ham HTML öznitelik yazımı yerine React DOM adlandırma geleneklerini kullanır.\n\n3. **camelCase Öznitelikler** — `onclick` gibi HTML öznitelikleri `onClick`, `tabindex` ise `tabIndex`, `stroke-width` ise `strokeWidth` olur. Bu, JavaScript'in DOM özellik adlandırmasıyla örtüşür.\n\n4. **Kapanan Etiketler Zorunlu** — JSX, HTML gibi değil XML gibi ayrıştırılır. HTML'de `<img src=\"...\" >` geçerlidir. JSX'te her etiket açıkça kapatılmalıdır: `<img src=\"...\" />`.\n\n### Challenge\n**Challenge:** Kodda üç JSX hatası var: eksik kök sarmalayıcı, bir `class` özniteliği ve kapatılmamış bir `<img>` etiketi. Üçünü de düzeltin.\n\n### Hints\n* İçeriği `<>...</>` (Fragment) ile sarın; böylece gerçek bir `<div>` eklemeden tek kök kuralını karşılarsınız.\n* JSX'te CSS sınıfları `class` değil `className` üzerinde yazılır.\n* Kendiliğinden kapanan her etiketin `>` işaretinden önce bir `/` işaretine ihtiyacı vardır: `<img ... />`.\n\n**Solution:**\nTek ve geçerli bir JSX ağacı döndürün, CSS sınıfları için `className` kullanın, her elemanı kapatın ve JavaScript ifadelerini süslü parantez içine koyun. Değer birden çok adım veya deyim gerektiriyorsa, JSX içine deyim koymak yerine dönüşten önce hesaplayın.\n\n### Example\n```jsx\nexport default function ProfileCard() {\n  const name = \"Ada Lovelace\";\n  const tags = [\"math\", \"computing\"];\n\n  return (\n    <>\n      <h1 className=\"heading\" tabIndex={0}>{name}</h1>\n      <p>Interests: {tags.join(\", \")}</p>\n      <img src=\"https://picsum.photos/seed/reactlab/120\" alt={name} />\n    </>\n  );\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Bir React bileşeni, büyük harfle başlayan ve JSX döndüren bir JavaScript fonksiyonudur. React `<ProfileCard />` ile karşılaştığında bu fonksiyonu çağırır ve döndürülen değerle DOM'u kurar.\n\nBüyük harf isteğe bağlı değildir: küçük harfli `<profileCard />` sizin bileşeniniz olarak değil, bilinmeyen bir HTML elemanı olarak ele alınır.",
          "**Kural 1 — tek kök eleman.** Bir `return` deyimi tek bir değer üretir, dolayısıyla JSX de öyle olmalıdır. `<>...</>` bir Fragment'tır: üç kardeşi, gerçek DOM'a sarmalayıcı bir `<div>` eklemeden gruplar.\n\nOnsuz `<h1>`, `<p>` ve `<img>` etiketlerini yan yana döndürmek, bir değer beklenen yerde üç değer olurdu — söz dizimi hatası.",
          "**Kural 2 — `class` değil `className`.** JSX, ham HTML öznitelik yazımı yerine React DOM özellik adlarını kullanır.\n\n**Kural 3 — camelCase öznitelikler.** `tabindex` → `tabIndex`, `onclick` → `onClick`, `stroke-width` → `strokeWidth`. JavaScript'in zaten kullandığı DOM özellik adlandırma geleneğinin aynısı.",
          "**Kural 4 — her etiket kapanır.** JSX, HTML gibi değil XML gibi ayrıştırılır. `<img src=\"...\">` geçerli HTML'dir ama JSX'te ayrıştırma hatasıdır; `<img src=\"...\" />` olmalıdır.",
          "Süslü parantezler JSX içine bir JavaScript ifadesi bırakır. `{name}` bir değişken okur, `{tags.join(\", \")}` ise bir metot çağrısı çalıştırır — her ifade işe yarar, çünkü bu bir şablon dili değil, JavaScript.\n\nEkranda görünecek tam metin:\n`Ada Lovelace`\n`Interests: math, computing`\n`[Görsel: Ada Lovelace]`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Fragment `<>...</>`, eksik kök eleman sorununun çözümüdür. `_jsx(Fragment, { children: [...] })` biçimine derlenir — çocukları hiçbir gerçek DOM düğümü oluşturmadan gruplayan bir React içselidir. Basılan HTML'iniz `<h1>`, `<p>` ve `<img>` etiketlerini doğrudan içerir, fazladan sarmalayıcı `<div>` olmaz.",
          "`class` → `className`. Bu değişiklik, JSX'in JavaScript'e derlenmesinden kaynaklanır ve `class` JavaScript'te ayrılmış bir anahtar kelimedir (ES6 sınıf söz dizimi için). Derleyici `class=` ifadesine takılırdı. React `className` adını seçti çünkü karşılık gelen DOM özelliğinin adı budur: `element.className`.",
          "`<img>` etiketi kendiliğinden kapanma eğik çizgisini alıyor. JSX, açık kapanış işareti gerektiren bir XML ayrıştırıcısı kullanır. Tarayıcının HTML ayrıştırıcısı hoşgörülüdür ve kapanış etiketlerini çıkarım yapar — JSX'in derleyicisi yapmaz.",
          "Bileşen artık derleniyor ve ekrana basılıyor.\n\nEkranda görünecek tam metin:\n`Hello React!`\n`This is my first component.`\n`[Görsel]`"
        ]
      },
      "insights": [
        {
          "title": "JSX aslında neye derleniyor?",
          "steps": [
            "JSX bir söz dizimi kısaltmasıdır — tarayıcı onu hiç görmez. Vite, Babel veya SWC, kodunuz tarayıcıya ulaşmadan önce her JSX ifadesini bir `_jsx()` çağrısına dönüştürür.",
            "`_jsx()` düz bir JavaScript nesnesi döndürür: arayüzü tarif eden bir React elemanı. React, eleman değerlerini render ve uzlaştırma (reconciliation) girdisi olarak kullanır; JSX'in kendisi tarayıcıya hiç ulaşmaz. JSX → nesneler → fark alma → gerçek DOM değişiklikleri."
          ]
        },
        {
          "title": "JSX'te neden `class` kullanamıyorum?",
          "steps": [
            "JSX, JavaScript'e derlenir. `className`, React DOM'un elemanın class özelliği için kullandığı JSX prop'udur. Bunu React'in JavaScript anahtar kelimesine koyduğu özel bir yasak gibi düşünmeyin; esas olarak bir DOM/JSX özellik adlandırma geleneğidir.",
            "`className`, bir elemanın CSS sınıfını temsil eden gerçek DOM özelliğinin adıdır. `element.className = 'container'` geçerli JavaScript'tir — `element.class` değildir. React, DOM API'siyle doğrudan örtüşmek için `className` adını seçti."
          ]
        },
        {
          "title": "Bir bileşeni başka bir bileşenin içinde tanımlayabilir miyim?",
          "steps": [
            "`Parent` her render edildiğinde JavaScript bellekte *yepyeni* bir `Child` fonksiyon nesnesi oluşturur. Fonksiyon gövdesi birebir aynı olsa bile, her render'da farklı bir fonksiyon referansıdır.",
            "React, ağaçta hangi bileşenlerin var olduğunu izlemek için bileşen fonksiyonunun kimliğini (bellek referansını) kullanır. `<Child />` basıldığında React şunu kontrol eder: 'Bu, geçen seferkiyle aynı bileşen mi?' Yeni bir fonksiyon referansı React'in 'Hayır' demesine yol açar — eski Child DOM'unun tamamını yıkar ve sıfırdan kurar. Child içindeki state her render'da yok olur. Bileşenleri her zaman modül düzeyinde tanımlayın."
          ]
        },
        {
          "title": "Tüm JSX etiketleri neden kendiliğinden kapanmak zorunda?",
          "steps": [
            "Tarayıcılar, HTML spesifikasyonunun içerik modeli kurallarına dayanarak kapanış etiketlerini çıkarım yapan son derece hoşgörülü bir HTML5 ayrıştırıcısı içerir. `<img>` bir 'boş eleman'dır — tarayıcı çocuğu olamayacağını bilir ve onu otomatik kapatır.",
            "Babel/Vite'ın kullandığı JSX ayrıştırıcısında HTML spesifikasyonu gömülü değildir — daha basit XML ayrıştırma kurallarını kullanır. XML'de her etiket açıkça kapatılmalıdır. Bu aslında bir özelliktir: eşleşmeyen etiketleri, herhangi bir kod çalışmadan önce, derleme anında yakalar."
          ]
        }
      ]
    },
    "components": {
      "title": "Bileşenler ve Yeniden Kullanım",
      "content": "\n# Bileşenler ve Kompozisyon\n\n### Bu nedir?\n**JSX üzerine inşa ediyoruz:** Bir React bileşeni, **Büyük Harfle** başlayan ve JSX döndüren bir JavaScript fonksiyonudur. Bileşenler React'te arayüzün temel birimidir — küçük ve odaklı bileşenleri daha büyüklerin içine yerleştirerek karmaşık arayüzler kurarsınız.\n\n> 💡 **Zihinsel Model:** Bileşenleri LEGO parçaları gibi düşünün. Tek bir parça (bileşen) basit ve yeniden kullanılabilirdir. Birden çok parçayı farklı şekillerde birleştirerek küçük bir arabadan koca bir şatoya kadar her şeyi kurabilirsiniz. Parçanın kendisi değişmez — yalnızca onları nasıl birleştirdiğiniz değişir.\n\n### React neden bileşenleri bu şekilde kullanıyor?\nBileşenler, arayüzdeki kod tekrarı sorununu kökten çözer. Onlar olmasa, 50 farklı yerde bir düğmeye ihtiyacınız varsa düğme HTML'ini 50 kez yazardınız. Düğme stilini bir kez değiştirmek mi? 50 yeri güncelleyin. Bir `<Button />` bileşeniyle bir kez yazar, bir kez değiştirirsiniz. Kompozisyon — bileşenleri başka bileşenlerin içine koymak — basit ve test edilebilir parçalardan istediğiniz karmaşıklıkta arayüzler kurmanın yoludur.\n\n### Nasıl?\n1. Bir JavaScript fonksiyonu yazın. Adını **Büyük Harfle** başlatın.\n2. Ondan JSX döndürün.\n3. JSX içinde bir HTML etiketi gibi kullanın: `<MyComponent />`.\n\n> **Sırasından biraz önce gelen bir şey:** aşağıdaki örnek `<Button label=\"Save\" />` yazıyor. Buradaki `label` bir **prop**`tur — bir bileşene, onu kullanan taraf tarafından verilen bir değer. Her kopya birbirinin aynısıysa yeniden kullanımın pek değeri kalmaz, bu yüzden burada bir ders erken görünüyor. Prop'ların nasıl çalıştığını şimdi anlamanız gerekmiyor; bir sonraki ders tamamen onlara ayrılmış.\n\n### ⚠️ Büyük Harf Kuralı\nBu isteğe bağlı değildir. JSX, kullanıcı tanımlı bileşenleri HTML elemanlarından ayırmak için büyük/küçük harfi kullanır:\n- `<button>` → React bir HTML `<button>` elemanı basar.\n- `<Button>` → React sizin `Button` fonksiyonunuzu çağırır ve döndürdüğünü basar.\n\nKüçük harfli `<button>` ile `button` adıyla tanımlanmış bir fonksiyon, sessizce işe yaramaz bir çıktı üretir.\n\n### Ne zaman bileşen ÇIKARMAMALI?\nBir şey görsel olarak ayrı duruyor diye yeni bir bileşen oluşturmayın. Şu durumlarda bileşen oluşturun:\n- Aynı JSX 2 veya daha fazla kez tekrarlanıyorsa.\n- Bir bölüm, rahat düşünülemeyecek kadar büyüdüyse.\n- Bir bölümün kendi bağımsız state'i veya davranışı varsa.\n\n### Challenge\n**Challenge:** `App` bileşeninde profil işaretlemesi tekrarlanıyor. `name` ve `role` prop'larını kabul eden yeniden kullanılabilir bir `UserProfile` bileşeni çıkarın, sonra onu `App` içinde her kişi için farklı veriyle kullanın.\n\n### Hints\n* `function UserProfile({ name, role }) { ... }` — prop'ları parametre listesinde ayrıştırın.\n* Bileşenin içinde, sabit yazılı metinlerin şu anda bulunduğu yerde `{name}` ve `{role}` kullanın.\n* `App` içinde `<UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />` basın.\n\n**Solution:**\nTekrarlanan veya kendi başına sorumluluk taşıyan arayüzü bir bileşene çıkarın. Değişen veriyi prop olarak geçirin, bileşeni tek bir sorumluluğa odaklı tutun ve işaretlemesini kopyalamak yerine ebeveynden kompoze edin.\n\n### Example\n```jsx\nfunction Button({ label }) {\n  return <button className=\"btn\">{label}</button>;\n}\n\nexport default function ActionPanel() {\n  return (\n    <div>\n      <Button label=\"Save\" />\n      <Button label=\"Cancel\" />\n    </div>\n  );\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "`Button` bir bileşendir — JSX döndüren sıradan bir JavaScript fonksiyonu. Tek bir prop kabul eder: `label`. Fonksiyonun nerede kullanılacağına dair hiçbir bilgisi yoktur — yalnızca neye ihtiyacı olduğunu (`label`) ve ne ürettiğini (bir `<button>`) bilir.\n\nYeniden kullanımın özü budur: bileşenin mantığı kapsüllenmiştir. Çağıranların `Button` etiketini nasıl bastığını bilmesi gerekmez — yalnızca veriyi geçirirler.",
          "`ActionPanel` ebeveyn bileşendir — arayüzü `Button` kullanarak kompoze eder. Bu **kompozisyondur**: küçük ve odaklı bileşenleri birleştirerek daha büyük yapılar kurmak. `ActionPanel`, `Button` bileşeninin nasıl bastığını umursamaz — yalnızca sonucu umursar.",
          "Farklı `label` prop'larıyla iki `<Button />` örneği. React her örnek için `Button` fonksiyonunu bir kez çağırır ve her seferinde farklı bir prop nesnesi geçirir: `{ label: 'Save' }` ve `{ label: 'Cancel' }`. Ortaya çıkan iki DOM düğümü tamamen bağımsızdır.\n\nEkranda görünecek tam metin:\n`[Düğme: Save]`\n`[Düğme: Cancel]`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Tekrarlanan profil işaretlemesini bir `UserProfile` fonksiyonuna çıkarıyoruz. Sabit yazılı metinler `{name}` ve `{role}` ile değiştiriliyor — bunlar ebeveynden prop olarak enjekte edilen değişkenler.\n\nBu bileşen artık bir şablon. Kimi gösterdiğini ne bilir ne de umursar — kendisine ne verilirse onu basar.",
          "`App` içinde ilk `<UserProfile />` bileşenini Jane'in verisiyle basıyoruz. React `UserProfile({ name: 'Jane Doe', role: 'Software Engineer' })` çağrısını yapar ve sonucu bileşen ağacında bu konuma yerleştirir.",
          "John'un verisiyle ikinci bir `<UserProfile />`. Aynı fonksiyon, farklı girdi, farklı çıktı. İki bileşen örneği tamamen bağımsızdır — React'in ağacında ayrı konumları ve, state'leri olsaydı, ayrı state yuvaları olurdu.",
          "Bileşen ağacı temiz biçimde basılıyor. Tek bir bileşenin iki örneği, iki farklı kişi.\n\nEkranda görünecek tam metin:\n`Our Team`\n`Jane Doe`\n`Software Engineer`\n`John Smith`\n`Product Manager`"
        ]
      },
      "insights": [
        {
          "title": "Bir bileşeni fonksiyon gibi çağırmak hook'ları neden bozar?",
          "steps": [
            "`{Child()}` yazdığınızda JavaScript, `Child` fonksiyonunu `Parent` bileşeninin render'ı içinde düz bir fonksiyon çağrısı olarak çalıştırır. `Child` içindeki hook'lar (`useState` gibi) ayrı bir yuvaya değil, `Parent` bileşeninin hook listesine kaydedilir. Bu, hook çağrı sırasını bozar, hook hatalarına yol açar ve React'in `Child` için state'i ayrı izleme yeteneğini kırar.",
            "`<Child />` JSX söz dizimi, React'e Fiber ağacında `Child` için ayrı bir düğüm oluşturmasını söyler. React, `Child` bileşeninin hook'larını, state'ini ve yaşam döngüsünü `Parent` bileşeninden tamamen bağımsız yönetir. Doğru zihinsel model budur: her `<Component />`, kendi özel state'i olan ayrı ve canlı bir varlıktır."
          ]
        },
        {
          "title": "Büyük/küçük harf React'in ne basacağını neden belirliyor?",
          "steps": [
            "JSX küçük harfli bir etiket gördüğünde, derleyici etiket adını `_jsx` fonksiyonuna bir **metin** olarak geçirir. React da `document.createElement('div')` çağrısını yapar — yerel bir tarayıcı API'si.",
            "JSX büyük harfle başlayan bir etiket gördüğünde, derleyici **fonksiyon referansının kendisini** `_jsx` fonksiyonuna geçirir. React da o fonksiyonu çağırır ve dönüş değerini basılan çıktı olarak kullanır. Büyük/küçük harf, derleyicinin metin mi referans mı olduğuna karar verme yöntemidir — bir gelenek değil, JSX dönüşümüne gömülü bir kuraldır."
          ]
        }
      ]
    },
    "props": {
      "title": "Prop'lar (Veri Geçirme)",
      "content": "\n# Prop'lar (Veri Geçirme)\n\n### Bu nedir?\n**Bileşenler üzerine inşa ediyoruz:** Bileşenler en çok dinamik veri bastıklarında işe yarar. **Prop'lar** (özellikler), veriyi bir ebeveyn bileşenden bir çocuk bileşene geçirme mekanizmasıdır — React'in tek yönlü veri otoyolu.\n\n> 💡 **Zihinsel Model:** Prop'lar fonksiyon argümanları gibidir, ama bileşenler için. `Math.max(3, 7)` fonksiyona `3` ve `7` değerlerini geçirdiği gibi, `<UserCard name=\"Alice\" age={25} />` de `name` ve `age` değerlerini `UserCard` bileşenine geçirir. Bileşen bunları bir nesne olarak alır ve çıktısını üretmek için kullanır.\n\n### Prop'lar neden tek yönlü (yalnızca ebeveynden çocuğa)?\nBu, **tek yönlü veri akışı** denen bilinçli bir mimari tercihtir. Veri aşağı akar; olaylar yukarı çıkar. Bu, uygulamanızı öngörülebilir kılar: bir bileşen yanlış veri gösteriyorsa nereye bakacağınızı tam olarak bilirsiniz — *yukarı*, onu basan her neyse ona doğru. Çift yönlü veri bağlamada (Angular'ın eski yaklaşımı gibi) herhangi bir bileşen herhangi bir veriyi değiştirebilir ve hataları izlemek çok daha zor olurdu.\n\n### Prop'lar salt okunurdur\n**Bir bileşenin içinde prop'ları asla değiştirmemelisiniz.** Bir değeri değiştirmeniz gerekiyorsa, state'in sahibi ebeveyn olmalı ve aşağı bir güncelleme fonksiyonu prop olarak geçirmelidir.\n\n```javascript\nfunction UserCard({ age }) {\n  age = age + 1; // ❌ Bunu asla yapmayın — React uyarabilir veya sessizce bozulabilir\n}\n```\n\n### Metin dışı değerleri geçirme\nMetinler `{}` olmadan geçirilebilir. Diğer her şey — sayılar, mantıksal değerler, nesneler, diziler, fonksiyonlar — `{}` içine alınmalıdır:\n```jsx\n<UserCard name=\"Alice\" age={25} isAdmin={true} onClick={handleClick} />\n```\n\n### Challenge\n**Challenge:** `UserProfile` sabit yazılmış ve her seferinde aynı veriyi basıyor. Ona `name` ve `role` prop'larını ekleyin, sabit metinleri bu prop'larla değiştirin, sonra `App` içinden farklı değerler geçirin.\n\n### Hints\n* Fonksiyon parametresine `{ name = 'Unknown', role = 'Member' }` ekleyin — prop geçirilmezse varsayılanlar devreye girer.\n* JSX içinde sabit metinleri `{name}` ve `{role}` ile değiştirin.\n* Prop'ları HTML öznitelikleri gibi geçirin: `<UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />`.\n\n**Solution:**\nDeğerin sahipliğini ebeveynde tutun, güncel değeri prop olarak aşağı geçirin ve çocuğun değişiklik talep etmesi gerektiğinde `onRemove(id)` gibi bir geri çağırım geçirin. State güncellemesini ebeveyn yapar ve yeni değeri tekrar aşağı basar.\n\n### Example\n```jsx\nfunction WelcomeMessage({ name, role }) {\n  return <h2>Hello {name}, you are a {role}!</h2>;\n}\n\nexport default function App() {\n  return <WelcomeMessage name=\"Alice\" role=\"Developer\" />;\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Ebeveyn `App`, `<WelcomeMessage name=\"Alice\" role=\"Developer\" />` basıyor. React JSX özniteliklerini bir prop nesnesinde toplar: `{ name: 'Alice', role: 'Developer' }`, sonra `WelcomeMessage` çağrılırken bu nesneyi ilk argüman olarak geçirir.",
          "`WelcomeMessage` prop nesnesini alır. Parametre listesinde `{ name, role }` ayrıştırması yaparak ihtiyacımız olan iki değeri anında çıkarırız — `props.name` yazmaya gerek kalmaz. Bu şununla birebir aynıdır: `const { name, role } = props;`",
          "JSX, prop değerlerini `{name}` ve `{role}` ile gömüyor. React iki ifadeyi de değerlendirir ve nihai metni üretir.\n\nEkranda görünecek tam metin:\n`Hello Alice, you are a Developer!`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Parametre listesine `{ name = 'Unknown', role = 'Member' }` ekliyoruz. Bu iki iş yapar: **ayrıştırma** (`name` ve `role` değerlerini prop nesnesinden çıkarmak) ve **varsayılan değerler** (bir ebeveyn `name` geçirmeden `<UserProfile />` basarsa, değer `undefined` olmak yerine otomatik olarak `'Unknown'` olur).",
          "Sabit yazılı `'Jane Doe'` ve `'Software Engineer'` metinleri `{name}` ve `{role}` ile değiştiriliyor. Bunlar JSX ifade yuvalarıdır — React onları değerlendirir ve o anda değişkenlerde hangi değer varsa onu yerleştirir. Bileşen artık genel amaçlı bir şablondur.",
          "`App` içinde her `<UserProfile />` farklı prop'lar alıyor. React birincisi için `UserProfile({ name: 'Jane Doe', role: 'Software Engineer' })`, ikincisi için `UserProfile({ name: 'John Smith', role: 'System Admin' })` çağrısını yapar. İki çağrı, iki çıktı, tek fonksiyon tanımı.",
          "Bileşen ağacı dinamik veriyle basılıyor.\n\nEkranda görünecek tam metin:\n`Team Roster`\n`Jane Doe`\n`Software Engineer`\n`John Smith`\n`System Admin`"
        ]
      },
      "insights": [
        {
          "title": "Prop'lar kesinlikle salt okunurdur — ve bu neden önemli",
          "steps": [
            "Prop'lar ebeveynden çocuğa akar. Bir çocuk onları sessizce değiştirebilseydi, ebeveynin state'i aşağıdan bozulurdu — ebeveyn `age: 25` geçirdiğini sanır ama bellekteki değer artık `26` olur. Bu, hata ayıklamayı kâbusa çevirir ve React'in tek yönlü veri akışı sözleşmesini ihlal eder.",
            "Bir prop'un değiştirilmiş bir sürümüne ihtiyacınız varsa, yeni bir türetilmiş değişken oluşturun. Prop'un kendisi değişmez kalır. Verinin kullanıcı etkileşimine tepki olarak değişmesi gerekiyorsa, ebeveyn bir state değişkenine sahip olmalı ve aşağı bir güncelleme fonksiyonu geçirmelidir: `<UserCard age={age} onAgeChange={setAge} />`."
          ]
        },
        {
          "title": "JSX elemanlarını prop olarak geçirebilir miyim?",
          "steps": [
            "`children`, React'in bir bileşenin açılış ve kapanış etiketleri arasına koyduğunuz JSX ile otomatik olarak doldurduğu özel bir prop'tur. Bu, **kompozisyon** denen güçlü bir deseni mümkün kılar — hangi içeriği taşıyacaklarını bilmeye gerek kalmadan yerleşim/kapsayıcı bileşenleri kurabilirsiniz.",
            "`<Card>...</Card>` arasındaki `<img>` ve `<p>` etiketleri `children` olur. React bunları `Card` fonksiyonuna `children` prop'u olarak geçirir. Material UI, shadcn/ui ve Radix gibi arayüz kütüphaneleri sarmalayıcı bileşenleri böyle kurar — `<Dialog>`, `<Card>`, `<Tooltip>` hepsi içine koyduğunuz şeyi sarmak için `children` kullanır."
          ]
        },
        {
          "title": "Prop delme (prop drilling): prop'lar ne zaman soruna dönüşür",
          "steps": [
            "Prop delme, verinin derindeki bir torunun eline ulaşmak için birkaç bileşen katmanından geçmesi gerektiğinde olur. `Layout` ve `Sidebar`, `theme` değerini kullanmaz — yalnızca aktarma istasyonlarıdır. Her ara bileşen, umursamadığı hâlde prop'u bildirmek ve iletmek zorundadır.",
            "Kendinizi prop'ları 3 veya daha fazla katman boyunca delerken bulduğunuzda, Context API (`useContext`) veya bir state yönetimi kütüphanesi düşünmenin vaktidir. Bunlar, ağaçtaki herhangi bir bileşenin veriye ara katmanlardan geçirmeden doğrudan erişmesine izin verir."
          ]
        }
      ]
    },
    "state": {
      "title": "useState ile State",
      "content": "\n# useState ile State\n\n### Bu nedir?\n**JSX ve prop'lar üzerine inşa ediyoruz:** Prop'lar ebeveynlerin aşağı sabit veri geçirmesini sağlar, ama **state** bir bileşenin özel ve değişebilir hafızasıdır. `useState`, bir state parçası oluşturan, güncel değeri veren ve onu güncellemek için bir fonksiyon sağlayan hook'tur — değer değiştiğinde otomatik olarak yeniden render tetikler.\n\n> 💡 **Zihinsel Model:** State, bileşenin üzerindeki bir yapışkan not gibidir. Notta bir değer yazılıdır. `setCount(1)` çağırdığınızda mevcut notu silip yeniden yazmıyorsunuz — React'e şunu söylüyorsunuz: 'Bu bileşen fonksiyonunu bir dahaki çağırdığında ona 1 yazan yeni bir not ver.' React sonra fonksiyonu baştan çağırır ve yeni bir `const count = 1` sabiti oluşturur. Önceki render'ın `count` değeri gitmiştir. Her render yeni bir fonksiyon çağrısı, yeni bir sabittir.\n\n### Sıradan bir `let` değişkeni neden işe yaramıyor?\n```javascript\nfunction Counter() {\n  let count = 0;          // HER render'da 0'a sıfırlanır\n  function handleClick() {\n    count = count + 1;    // Değişkeni günceller...\n    // ...ama React bunu bilmez! Yeniden render olmaz.\n    // Olsa bile count yine 0'a sıfırlanırdı.\n  }\n}\n```\nSıradan değişkenler iki nedenle başarısız olur:\n1. **React onları gözlemleyemez.** React yalnızca bir state güncelleyicisi çağırdığınızda yeniden render eder.\n2. **Her render'da sıfırlanırlar.** Her render bileşen fonksiyonunu baştan çağırır. `let count = 0` yeniden çalışır ve değeri sıfırlar.\n\n> **Sırasından biraz önce gelen bir şey:** aşağıdaki kod `onClick={...}` kullanıyor; bu, React'e düğmeye basıldığında bir fonksiyonu çalıştırmasını söyler. Şimdilik bundan ihtiyacınız olan tek şey bu — olay işleme hemen bu dersin ardından kendi dersini alıyor. State ancak onu değiştiren bir şey olduğunda gözlemlenebilir, dolayısıyla bir düğme onu göstermenin en küçük dürüst yolu.\n\n### Anlık Görüntü Kuralı — anlaşılması gereken en önemli şey\n`setCount(count + 1)` çağırdığınızda React `count` değerini anında güncellemez. Yeni bir render planlar. **Mevcut fonksiyon çağrısında `count`, bu render başladığındaki değerinde kalır.**\n\n```javascript\nconst [count, setCount] = useState(0);\n\nfunction handleClick() {\n  setCount(count + 1); // Planlar: sonraki render'da count = 1\n  setCount(count + 1); // Planlar: sonraki render'da count = 1 (2 değil!)\n  console.log(count);  // Hâlâ 0 — bu render'ın anlık görüntüsü\n}\n```\nİki `setCount` çağrısı da aynı `count` değerini (0) görür, dolayısıyla ikisi de count = 1 planlar. Birden çok kez doğru şekilde artırmak için **fonksiyonel güncelleme biçimini** kullanın: `setCount(prev => prev + 1)`.\n\n### Ne zaman state KULLANMAMALI?\n- **Türetilmiş değerler:** Mevcut state'ten hesaplayabiliyorsanız, onu state'te saklamayın. `const fullName = firstName + ' ' + lastName` — `useState` değil.\n- **Render'ı etkilemeyen değerler:** Bunun yerine `useRef` kullanın — State Mimarisi modülünde ele alınan bir hook.\n- **Sunucu verisi:** Sunucuda yaşayan veri genellikle React Query gibi özel bir araçla daha iyi yönetilir; Ölçekte State Yönetimi modülü bunu işliyor. Şimdilik ikisine de ihtiyacınız yok; burada anılmalarının sebebi, ileride alışkanlıkla `useState` demek yerine farklı bir cevabın var olduğunu bilmeniz.\n\n### Challenge\n**Challenge:** Sayaç, her render'da sıfırlanan ve React'i değişikliklerden haberdar etmeyen `let count` kullanıyor. Onu `useState` kullanacak şekilde dönüştürün.\n\n### Hints\n* `useState` fonksiyonunu 'react' içinden içe aktarın.\n* `let count = 0` yerine `const [count, setCount] = useState(0)` yazın.\n* `handleClick` içinde `count = count + 1` yerine `setCount(count + 1)` çağırın.\n\n**Solution:**\nState'i güncelleyiciyle güncelleyin ve ilgisiz veriyi koruyun. Sonraki değer öncekine bağlıysa `setCount(previous => previous + 1)` gibi fonksiyonel güncelleyici biçimini kullanın; nesneler ve diziler için eskisini değiştirmek yerine yeni bir kopya oluşturun.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "`useState(0)` ilk render sırasında iki iş yapar: React'in içsel deposunda (bileşen fonksiyonunun dışında) bir state yuvası oluşturur ve `[0, setCount]` döndürür. Buradaki `0` başlangıç değeridir — yalnızca ilk render'da kullanılır.\n\nÖnemli olan: `count` `const` ile tanımlanmıştır. Onu yeniden atayamazsınız ve bu kasıtlıdır — bu render içinde sabit bir anlık görüntüdür.",
          "`{count}` güncel state değerini basar. İlk render'da bu `0`'dır. React kendi içsel state yuvasından okur ve fonksiyonunuza verir.",
          "Tıklandığında `setCount(count + 1)` React'e şunu söyler: 'Sonraki render'da state `1` olmalı.' React bu güncellemeyi kuyruğa alır ve olay işleyicisi bittikten sonra `Counter` fonksiyonunu yeniden çağırır. Bu sefer `useState(0)` çağrısı `0` değerini yok sayar (başlangıç değeri yalnızca bir kez kullanılır) ve state yuvasından `[1, setCount]` döndürür. `count` artık `1`'dir, JSX yeniden basılır ve `Count: 1` görünür.\n\nEkranda görünecek tam metin:\n`Count: 0`\n`[Düğme: Increment]`"
        ]
      },
      "walkthrough": {
        "steps": [
          "`import { useState }` ekliyoruz ve `let count = 0` yerine `const [count, setCount] = useState(0)` yazıyoruz.\n\nEski `let count`, her render'la doğup ölen yerel bir değişkendi. React'in onunla hiçbir bağı yoktu. `useState`, `count` değerini React'in içsel fiber düğümünde saklar — render'lar arasında yaşar ve React onu izler.",
          "`count = count + 1` (React'in yok saydığı) yerine `setCount(count + 1)` (React'in yakaladığı) yazıyoruz.\n\n`setCount` çağrıldığında üç iş yapar: yeni değeri fiber düğümünde saklar, bileşeni 'yeniden render gerekiyor' olarak işaretler ve yeniden render'ı sonraki toplu iş için planlar. React ancak olay işleyicisi çıktıktan sonra gerçekten yeniden render eder.",
          "Bileşen basılıyor. Düğmeye tıklamak `handleClick` çağırır, o da `setCount` çağırır, bu da `count = 1` ile yeni bir render tetikler.\n\nEkranda görünecek tam metin:\n`Counter: 0`\n`[Düğme: Increment]`"
        ]
      },
      "insights": [
        {
          "title": "`setCount(1)` çağrısından hemen sonra `count` neden hâlâ 0 gösteriyor?",
          "steps": [
            "`setCount` eşzamanlı bir değişken ataması değildir. React'in zamanlayıcısına verilen bir talimattır: 'Bu değerle bir yeniden render planla.' Talimat kuyruğa alınır — yürütme eşzamanlı olarak devam eder.",
            "Mevcut render'daki `count` değişkeni bir `const`'tur — bu render başladığında ayarlanmıştır ve aynı çağrı içinde değişemez. `console.log(count)` da `alert(...)` de bu render'ın başındaki anlık görüntü değerini görür: `0`.\n\nYeni değere erişmek için bir sonraki render'ı beklemelisiniz. `setCount(prev => prev + 1)` fonksiyonel biçimi, bayat değerleri okumadan birden çok güncellemeyi güvenle zincirleme yöntemidir."
          ]
        },
        {
          "title": "State bir anlık görüntüdür: her render'ın kendi `count` değeri vardır",
          "steps": [
            "Her render, bileşen fonksiyonunun ayrı bir çağrısıdır. 1. render'da `count`, `0` değerine ayarlanmış bir `const`'tur. Bu render'da tanımlanan olay işleyicileri `count = 0` değerini kapatır. 5 dakika sonra bile, kullanıcı 1. render'dan kalma bir düğmeye tıklarsa işleyici hâlâ `count = 0` görür — değer kapanışında yakalanmıştır.",
            "`setCount(1)` çağrısından sonra React `Counter()` fonksiyonunu yeniden çağırır. Bu taze bir çağrıdır — `const count = 1`. Yeni olay işleyicileri yeni `count = 1` değerini kapatır. Önceki render'ın kapanışı gitmiştir.\n\nReact state'ine 'anlık görüntü' denmesinin sebebi budur — her render, basıldığı andaki state'in donmuş bir resmini görür. Paylaşılan değişebilir bir değişken yoktur — yalnızca bir dizi değişmez anlık görüntü vardır."
          ]
        },
        {
          "title": "Fonksiyonel güncelleme biçimi ne zaman kullanılır: `setCount(prev => prev + 1)`",
          "steps": [
            "React, aynı olay işleyicisindeki birden çok `setCount` çağrısını toplu işler. Üç `setCount(count + 1)` çağrısı da mevcut render'ın kapanışındaki aynı `count` değerini (0) görür. Hepsi aynı değeri (1) planlar. React tekrarları eler ve `count` 3 değil 1 olur.",
            "`setCount(prev => prev + 1)` fonksiyonel biçimi, kuyruğa en son eklenen state'i `prev` olarak alır. React kuyruğu sırayla işler: ilk güncelleyici 0 alır, 1 döndürür. İkincisi 1 alır, 2 döndürür. Üçüncüsü 2 alır, 3 döndürür. Sonuç: 3. Yeni state eskisine bağlı olduğunda her zaman fonksiyonel biçimi kullanın."
          ]
        },
        {
          "title": "Nesne state'i: eski state'i neden yaymak zorundasınız",
          "steps": [
            "Sınıf bileşenlerindeki `setState` fonksiyonunun aksine, `useState` güncelleyicisi state değerinin tamamını **değiştirir**. State'iniz bir nesneyse ve kısmi bir nesne geçirirseniz, React o kısmi nesneyi saklar — diğer alanlar kaybolur. Bu, nesne state'iyle yapılan en yaygın hatadır.",
            "Önce `...prev` yayarak mevcut tüm alanları kopyalayın, sonra yalnızca değiştirmek istediklerinizi ezin. Bu, yeni bir nesne oluşturur (React'in değişikliği fark etmesi için gereklidir) ve açıkça değiştirmediğiniz tüm alanları korur."
          ]
        }
      ]
    },
    "events": {
      "title": "Olay İşleme",
      "content": "\n# Olay İşleme\n\n### Bu nedir?\n**State üzerine inşa ediyoruz:** State güncellemelerinin yeniden render tetiklediğini biliyoruz, ama bir şeyin o güncellemelere *sebep olması* gerekir. **Olay işleyicileri**, kullanıcı eylemlerine tepki olarak çalışan fonksiyonlardır — tıklamalar, tuş vuruşları, form gönderimleri, fare hareketleri.\n\n> 💡 **Zihinsel Model:** React'in olay sistemini, sizinle yabancı dil konuşan biri arasında duran bir çevirmen gibi düşünün: tarayıcı kendi yerel olay lehçesini 'konuşur' ve React'in Sentetik Olayı onu sarar; böylece hangi tarayıcı konuşuyor olursa olsun tutarlı ve öngörülebilir tek bir sürüm alırsınız.\n\n### React neden sentetik olay işleyicileri kullanıyor?\nDüz JavaScript'te olay dinleyicilerini doğrudan `addEventListener` ile bağlamak, bellek sızıntılarını önlemek için bileşen kaldırılırken elle temizlik (`removeEventListener`) gerektirir ve olay nesnesi özelliklerindeki tarayıcı farklarıyla uğraşmak zorunda kalırsınız. React, olay yetkilendirmesini kök kapsayıcı düzeyinde otomatik yönetir, normalleştirilmiş bir `SyntheticEvent` sarmalayıcısı sunar ve arayüz mantığını bildirimsel tutar.\n\n### Temel Kurallar ve Mekanik\nReact, yerel tarayıcı olaylarını bir **Sentetik Olay** katmanıyla sarar:\n- Öznitelik adları **camelCase**'tir: `onclick` değil `onClick`, `onsubmit` değil `onSubmit`.\n- Bir metin değil, **fonksiyon referansı** geçirirsiniz: `onClick=\"handleClick()\"` değil `onClick={handleClick}`.\n- React tarayıcı farklarını normalleştirir, dolayısıyla `event.target`, `event.preventDefault()` ve `event.stopPropagation()` her yerde tutarlı çalışır.\n\n### En önemli kural: geçirirken parantez yok\n```jsx\n// ✅ Fonksiyon referansını geçirin — React tıklandığında çağırır\n<button onClick={handleClick}>Save</button>;\n\n// ❌ Fonksiyonu render sırasında hemen çağırır — sayfa yüklenirken tetiklenir!\n<button onClick={handleClick()}>Save</button>;\n```\n\n### `e.preventDefault()` — tarayıcının varsayılan davranışını durdurmak\nHTML formlarının, bağlantı etiketlerinin ve onay kutularının varsayılan tarayıcı davranışları vardır. `e.preventDefault()` bunları durdurur:\n- `<form onSubmit>` → sayfanın yeniden yüklenmesini engeller\n- `<a href>` → gezinmeyi engeller\n- `<input type=\"checkbox\">` → varsayılan işaretlemeyi engeller (kontrollü girdilerde kullanışlı)\n\n### Yaygın Tuzaklar\n1. **İşleyiciyi render sırasında çağırmak:** `onClick={handleClick()}` geçirmek, fonksiyonu tıklamayı beklemek yerine render sırasında çalıştırır; işleyici `setState` çağırıyorsa bu genellikle sonsuz render döngülerine yol açar.\n2. **Form gönderiminde `preventDefault()` unutmak:** Yerel HTML formları varsayılan olarak bir HTTP isteği gönderir ve sayfayı yeniler, bellekteki tüm React state'ini siler.\n3. **Olay havuzu yanılgıları:** Modern React'te (17+ ve React 19) Sentetik Olaylar artık havuzlanmaz, dolayısıyla `event.target` değerini eşzamansız kodda güvenle okuyabilirsiniz.\n\n### Challenge\n**Challenge:** Form şu anda gönderildiğinde sayfayı yeniliyor (varsayılan HTML davranışı). `e.preventDefault()` çağıran ve güncel arama sorgusunu bir `alert` ile gösteren bir `handleSubmit` fonksiyonu ekleyin.\n\n### Hints\n* `return` ifadesinden önce `function handleSubmit(e) { ... }` oluşturun.\n* İçindeki ilk satır olarak `e.preventDefault()` çağırın.\n* Onu düğmeye değil, `<form>` etiketine `onSubmit={handleSubmit}` ile bağlayın.\n\n**Solution:**\nOlay prop'una bir fonksiyon referansı geçirin, olay verisini işleyicinin içinde okuyun ve `preventDefault()` çağrısını yalnızca tarayıcının varsayılan eylemi durdurulmalıysa yapın. İşleyiciyi bir Effect'e taşımak yerine kullanıcı eyleminden sorumlu tutun.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function ClickTracker() {\n  const [lastClick, setLastClick] = useState('nothing yet');\n\n  function handleClick(event) {\n    setLastClick(`${event.target.textContent} at x=${event.clientX}`);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={handleClick}>Left</button>\n      <button onClick={handleClick}>Right</button>\n      <button onClick={() => setLastClick('reset')}>Reset</button>\n      <p>Last: {lastClick}</p>\n    </div>\n  );\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "`handleClick` bir **Sentetik Olay** alır — React'in yerel tarayıcı `MouseEvent` nesnesi etrafındaki, özellikleri Chrome, Firefox, Safari ve Edge arasında normalleştirilmiş sarmalayıcısı.\n\n`event.clientX` işaretçinin görünüm alanındaki x konumudur; `event.target` ise tıklanan tam DOM düğümüdür — tek bir işleyicinin iki düğmeyi birbirinden ayırt edebilmesinin yolu budur.",
          "`onClick={handleClick}` **fonksiyon referansını** geçirir. Burada onu çağırmıyorsunuz — React'e \"bir tıklama olduğunda benim için bunu çağır\" diyorsunuz. `onClick={handleClick()}` yazmak onu render sırasında hemen çağırır ve React'e onun yerine dönüş değerini verir.\n\nİki düğme tek bir işleyiciyi paylaşıyor. React, düğme başına bir dinleyici yerine kökte tek bir yetkilendirilmiş dinleyici bağlar.",
          "Bir işleyicinin, olayın taşımadığı bir argümana ihtiyacı olduğunda onu satır içi bir okla sarın: `() => setLastClick('reset')`. React'in sakladığı referans oktur ve tetiklendiğinde güncelleyiciyi sizin değerinizle çağırır.\n\nBu, her render'da yeni bir fonksiyon oluşturur. Düz bir DOM düğmesi için bu, üzerinde düşünmeye değer bir maliyet değildir.",
          "Her tıklama state'e bir metin yazar, React yeniden render eder ve paragraf onu gösterir.\n\n**Left** düğmesine tıkladıktan sonra ekranda görünecek tam metin:\n`[Düğme: Left] [Düğme: Right] [Düğme: Reset]`\n`Last: Left at x=<işaretçi konumu>`"
        ]
      },
      "walkthrough": {
        "steps": [
          "`handleSubmit`, formun Sentetik Gönderim Olayını alır. İlk satır mutlaka `e.preventDefault()` olmalıdır — onsuz tarayıcının yerel form gönderimi tetiklenir, bu da bir HTTP GET isteği gönderip sayfayı yeniler ve tüm React state'ini siler.\n\n`e.preventDefault()`, olayı tarayıcının varsayılan işleyicisine ulaşmadan yakalar; sayfayı hayatta tutar ve denetimi tamamen React'e bırakır.",
          "`handleSubmit` fonksiyonunu `<button>` etiketine değil, `<form>` elemanına `onSubmit` ile bağlıyoruz. Doğru desen budur: formun submit olayı hem düğmeye tıklandığında *hem de* kullanıcı herhangi bir girdi alanında Enter'a bastığında tetiklenir. Forma bağlamak iki durumu da karşılar.",
          "Form basılıyor. `query` state'i `onChange` ile kontrol ediliyor — her tuş vuruşu state'i günceller, her state güncellemesi girdiyi yeniden render eder.\n\nEkranda görünecek tam metin:\n`[Girdi: Search...]`\n`[Düğme: Search]`"
        ]
      },
      "insights": [
        {
          "title": "`handleClick` neden parantezsiz?",
          "steps": [
            "Parantezli `handleClick()` bir fonksiyon çağrısıdır — JavaScript onu JSX değerlendirilirken, render sırasında hemen çalıştırır. Düğmedeki olay dinleyicisi fonksiyonun kendisini değil, `handleClick` fonksiyonunun *dönüş değerini* (muhtemelen `undefined`) alır. Daha sonra düğmeye tıklamak hiçbir şey yapmaz.",
            "Parantezsiz `handleClick` bir fonksiyon *referansıdır* — fonksiyonun kendisini geçiriyorsunuz, bir değişken geçirir gibi. React onu saklar ve tıklama olayı tetiklendiğinde çağırır. Şöyle düşünün: 'İşte telefon numaram. Bir şey olduğunda beni ara.' — 'Beni şimdi ara' değil."
          ]
        },
        {
          "title": "Bir olay işleyicisine nasıl argüman geçirilir?",
          "steps": [
            "Bir argüman (kimlik gibi) geçirmeniz gerekiyorsa `onClick={deleteItem(5)}` yazamazsınız — bu onu render sırasında hemen çağırır. Düğme, tıklama işleyicisi olarak `undefined` alır.",
            "Onu bir ok fonksiyonuyla sarın: `() => deleteItem(5)`. Ok fonksiyonunun kendisi tıklama işleyicisi olur. Tıklandığında ok fonksiyonu çalışır ve `deleteItem(5)` çağırır. Olay nesnesine de ihtiyacınız varsa onu da ekleyin: `(e) => deleteItem(5, e)`."
          ]
        },
        {
          "title": "React'in Sentetik Olay sistemi — neden yerel bir olay değil?",
          "steps": [
            "React, tarayıcının yerel olayını bir **Sentetik Olay** nesnesiyle sarar. Bu normalleştirilmiş sarmalayıcı, `onClick`, `onChange` ve `onSubmit` olaylarının tüm tarayıcılarda aynı şekilde çalışmasını sağlar. Tarayıcıya özgü API'lere ihtiyacınız olursa özgün yerel olaya her zaman `e.nativeEvent` üzerinden erişebilirsiniz.",
            "Tüm standart olay API'leri Sentetik Olay üzerinde çalışır: `preventDefault()`, `stopPropagation()`, `target`, fare koordinatları, klavye kodları. React 17 ve sonrasında React, Sentetik Olay nesnelerini havuzlayıp yeniden kullanmayı bıraktı (kafa karıştırıcı hatalara yol açan eski bir optimizasyon), dolayısıyla `e` nesnesini state'te veya eşzamansız geri çağırımlarda güvenle saklayabilirsiniz."
          ]
        }
      ]
    },
    "conditional": {
      "title": "Koşullu Basma",
      "content": "\n# Koşullu Basma\n\n### Bu nedir?\n**State ve prop'lar üzerine inşa ediyoruz:** Bileşenlerimiz artık dinamik state tuttuğuna ve prop aldığına göre, koşullara bağlı olarak farklı arayüz dalları basabiliriz. Koşullu basma, React bileşenlerinin çıktısını veriye göre uyarlama yöntemidir.\n\n> 💡 **Zihinsel Model:** Koşullu basmayı JSX için bir trafik ışığı gibi düşünün: hangi renk yanıyorsa (koşul), yalnızca o yol gösterilir — React kırmızı ve yeşil yolları aynı anda basmaya asla çalışmaz.\n\n### React neyi basacağına nasıl karar verir?\nJSX'in `{}` yuvaları yalnızca **ifadeleri** kabul eder — değer üreten şeyleri. React'te kullanılan üç desen:\n\n1. **Üçlü operatör** — iki seçenekten birini göstermek için:\n```jsx\n{isLoggedIn ? <Dashboard /> : <LoginPage />}\n```\n\n2. **Mantıksal VE (`&&`)** — bir şeyi göstermek ya da hiçbir şey göstermemek için:\n```jsx\n{isLoading && <Spinner />}\n```\n⚠️ **Sıfır tuzağı:** `count === 0` olduğunda `{count && <Badge />}` ekrana düz bir `0` basar. Her zaman `count > 0 && <Badge />` yazın.\n\n3. **Erken dönüş** — karmaşık koruma koşulları olan bileşenler için:\n```jsx\nfunction Profile({ user }) {\n  if (!user) return <EmptyState />;\n  return <div>{user.name}</div>;\n}\n```\n\n### React'te kaldırma ile `display: none` neden farklı?\nBu kritik bir ayrımdır:\n- **`display: none`** → Bileşen DOM'da kalır, state'ini korur, effect'lerini çalıştırır ve bellek tüketir. Yalnızca görsel olarak gizlenmiştir.\n- **Koşullu basma** → Bileşen DOM'dan tamamen kaldırılır. State'i yok edilir, effect'leri temizlenir, bellek serbest bırakılır.\n\nBir bileşenin state'ini gizlerken korumak istiyorsanız CSS kullanın. Temiz bir sıfırlama istiyorsanız koşullu basma kullanın.\n\n### Challenge\n**Challenge:** `Dashboard` şu anda iki başlığı da aynı anda gösteriyor. Bir üçlü operatör kullanarak `isLoggedIn` değeri `true` iken yalnızca `'Welcome back!'`, `false` iken yalnızca `'Please log in.'` göstermesini sağlayın.\n\n### Hints\n* Koşullu çıktıyı bir JSX ifadesiyle sarın: `{isLoggedIn ? (...) : (...)}`.\n* İki sabit `<h1>` etiketini kaldırın ve yerlerine üçlü operatörü koyun.\n* Yanlış dalı doğrulamak için `App` içinde `isLoggedIn={false}` ile deneyin.\n\n**Solution:**\nBir üçlü operatörle tam olarak tek bir dal basın veya koşul karmaşıksa erken dönün. `count` sıfır olabiliyorken `count && <Badge />` gibi çıplak bir sayısal ifade kullanmayın, çünkü React sıfırı ekrana basabilir.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function LoginStatus() {\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      {isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>}\n      {isLoggedIn && <button>Log out</button>}\n      <button onClick={() => setIsLoggedIn(v => !v)}>Toggle</button>\n    </div>\n  );\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Üçlü operatör `isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>` bir JavaScript ifadesidir. React onu değerlendirir, iki elemandan birini alır ve yalnızca onu basar. Diğeri hiç oluşturulmaz.\n\nYani koşul değiştikçe DOM düğümleri gerçekten kurulur ve yok edilir — bu, birini CSS ile gizlemek değildir.",
          "`isLoggedIn && <button>Log out</button>` mantıksal VE desenidir: bayrak doğruysa düğmeyi bas, yanlışsa hiçbir şey basma. React `false`, `null` ve `undefined` değerlerini \"çıktı yok\" olarak ele alır.\n\nBir tuzak: `0` yanlışsıdır ama yok **sayılmaz** — `count` değeri `0` iken `{count && <p>…</p>}` ekrana düz bir `0` basar. Sol taraf bir sayı olduğunda `count > 0 && …` kullanın.",
          "Toggle düğmesi bayrağı ters çevirir, böylece iki dalın önizlemede yer değiştirmesini okumak yerine izleyebilirsiniz.\n\nBaşlangıç durumu `false`, dolayısıyla ekranda görünecek tam metin:\n`Please log in.`\n`[Düğme: Toggle]`\n\nBir tıklamadan sonra:\n`Welcome back!`\n`[Düğme: Log out] [Düğme: Toggle]`"
        ]
      },
      "walkthrough": {
        "steps": [
          "`App`, `Dashboard` bileşenine `isLoggedIn={false}` geçiriyor. Bu bir mantıksal değerdir (metin değil), dolayısıyla `{}` parantezleri gerekir. `isLoggedIn=\"false\"` yazmak *metin* olarak `'false'` geçirirdi ki bu JavaScript'te doğrusudur (truthy) ve yanlış dalı basardı.",
          "`Dashboard` içinde iki sabit `<h1>` etiketini kaldırıp yerlerine tek bir üçlü operatör koyuyoruz. React `isLoggedIn` değerini (`false`) değerlendirir, ilk dalı atlar ve ikinci `<h1>` etiketini basar.\n\nÖnemli ayrıntı: ilk `<h1>` gizlenmedi — hiç oluşturulmadı. Ona ait bir DOM düğümü yok. Bu, `display: none` davranışından temelden farklıdır.",
          "`isLoggedIn` değeri `false` olduğu için yedek dal basılıyor.\n\nEkranda görünecek tam metin:\n`Please log in.`"
        ]
      },
      "insights": [
        {
          "title": "`&&` ile Sıfır Tuzağı",
          "steps": [
            "JavaScript'in `&&` operatörü işlenenlerinden birini döndürür, illa bir mantıksal değer değil. `0 && <Badge />` ifadesi `0` değerine dönüşür, çünkü `0` yanlışsıdır — `&&` kısa devre yapıp sol işleneni döndürür. React `0` sayısını alır ve onu `'0'` metin düğümü olarak basar. Sayfanızda gizemli bir sıfır görürsünüz.",
            "`unreadMessages > 0` her zaman `true` veya `false` üretir. `false && <Badge />` ifadesi `false` döndürür ve React bunu hiçbir şey olarak basar. Değer ne olursa olsun güvenlidir.\n\nBu sıfır tuzağı `items.length` dahil her sayısal değeri etkiler. Sayılarla her zaman açık bir mantıksal kontrol kullanın."
          ]
        },
        {
          "title": "`display:none` ile koşullu basma neden tamamen farklı?",
          "steps": [
            "CSS `display: none` bir elemanı görünmez yapar ama eleman DOM'da tamamen canlı kalır. `ExpensiveChart` veri çekiyorsa veya bir `setInterval` çalıştırıyorsa bunlar çalışmaya devam eder. State'i (yakınlaştırma seviyesi, seçili veri noktası) korunur. Gizle/göster döngüleri boyunca state'i korumak istediğinizde bu kullanışlıdır (sekme panelleri gibi).",
            "React koşullu basma, koşul yanlış olduğunda bileşeni tamamen kaldırır. DOM düğümleri silinir, `useEffect` temizlemeleri çalışır, state atılır. Yeniden bağlandığında sıfırdan başlar. Temiz bir sıfırlama istediğinizde, bellek boşaltmanız gerektiğinde veya gizliyken effect'lerin durmasını istediğinizde bunu kullanın."
          ]
        }
      ]
    },
    "lists-and-keys": {
      "title": "Liste Basma ve Key",
      "content": "\n# Liste Basma ve Key\n\n### Bu nedir?\n**Bileşenler, dizi metotları ve state üzerine inşa ediyoruz:** Bir diziden öğe listesi basmanız gerektiğinde, her öğeyi `.map()` ile bir JSX elemanına dönüştürürsünüz. React, `.map()` geri çağırımından döndürülen her kök eleman üzerinde benzersiz ve kararlı bir **`key`** prop'u ister.\n\n> 💡 **Zihinsel Model:** Key'ler bir konferanstaki isim kartları gibidir. Etkinlik düzenleyicisi (React) oturma düzenini (DOM) güncellemesi gerektiğinde, herkesle yeniden röportaj yapmak yerine isim kartlarını tarar: kim yer değiştirdi, kim yeni geldi, kim ayrıldı. İsim kartları olmadan, 3 numaralı koltuktaki kişinin geçen seferki 3 numaralı koltuktaki kişiyle aynı olduğunu varsaymak zorunda kalırlardı — biri yer değiştirir değiştirmez bu varsayım çöker.\n\n### React'in key'lere neden ihtiyacı var?\nUzlaştırma sırasında (React'in fark alma algoritması) React, önceki sanal DOM ağacını yenisiyle karşılaştırır. Listeler için **konum + key** buluşsalını kullanır:\n- Bir öğe farklı bir konumda aynı key'e sahipse → React DOM düğümünü taşır.\n- Bir öğenin daha önce var olmayan bir key'i varsa → React yeni bir DOM düğümü oluşturur.\n- Bir key kaybolursa → React DOM düğümünü yok eder.\n\nKey'ler olmadan React yalnızca konuma göre karşılaştırmaya düşer. `[A, B, C]` listesinden 0. öğeyi silerseniz, React yeni `[B, C]` listesini \"0. öğe A'dan B'ye değişti, 1. öğe B'den C'ye değişti\" diye yorumlar — A'nın silindiğini anlamak yerine. Bu da yanlış state'in yanlış satırda görünmesine yol açar.\n\n### ⚠️ Dizi indeksini key olarak kullanmak neden tehlikeli?\n```jsx\n{items.map((item, index) => <li key={index}>{item}</li>)}\n```\nİlk öğeyi silerseniz sonraki her öğenin indeksi kayar. `indeks 1` artık eski `indeks 2` öğesine karşılık gelir. React eski `indeks 1` öğesine ait DOM düğümlerini yeniden kullanır — bunlar silinen öğeden kalma bayat state (işaretli bir onay kutusu gibi) taşıyor olabilir. Her zaman verinizden gelen kararlı ve benzersiz bir tanımlayıcı kullanın.\n\n### İndeksi key olarak kullanmak ne zaman güvenli?\nYalnızca şu üçü birden doğruysa:\n1. Liste asla yeniden sıralanmaz, filtrelenmez veya sıralanmaz.\n2. Öğeler asla ortadan silinmez.\n3. Öğelerin kendi bağımsız state'i yoktur.\n\n### Challenge\n**Challenge:** `TodoList` key olarak dizi indeksini kullanıyor. Bir onay kutusunu işaretleyip Delete düğmesine basmayı deneyin — işaretli durum yanlış öğede kalıyor! Bunu `item.id` değerini key olarak kullanarak düzeltin.\n\n### Hints\n* `key={index}` yerine `key={item.id}` yazın.\n* Artık ihtiyacınız kalmadığı için `index` parametresini `.map()` çağrısından tamamen kaldırabilirsiniz.\n* `item.id` değerleri (`'t1'`, `'t2'`, `'t3'`) kararlı metinlerdir — öğeler silindiğinde değişmezler.\n\n**Solution:**\nListeyi `key={item.id}` gibi kararlı bir öğe tanımlayıcısıyla basın. Key, güncel dizi konumunu değil, render'lar boyunca kimliği anlatmalıdır; bu, ekleme ve silmelerden sonra satıra ait yerel state'in başka bir öğeye geçmesini önler.\n\n### Example\n```jsx\nconst items = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }];\n\nexport default function ShoppingList() {\n  return (\n    <ul>\n      {items.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Veri dizisi, veri kaynağından gelen nesne kimliklerini (`1`, `2`) kullanıyor. Bunlar kararlıdır — liste yeniden sıralandığında veya filtrelendiğinde değişmezler. İyi bir `key` olan tanımlayıcı türü budur.",
          "`.map()` her veri nesnesini bir JSX elemanına dönüştürüyor. `key={item.id}`, geri çağırımdan döndürülen en dıştaki elemana — yani `<li>` etiketine — bağlanıyor.\n\nReact bu key'i Fiber düğümünde içsel olarak saklar. Bir sonraki render'da yeni key listesini öncekiyle karşılaştırır. Bir key konum değiştirirse React DOM düğümünü taşır. Bir key kaybolursa React o düğümü kaldırır ve temizlemesini çalıştırır. `key` bileşeninize asla prop olarak geçirilmez — tamamen React'in içsel takibi içindir.\n\nEkranda görünecek tam metin:\n`• Apple`\n`• Banana`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Hata: `key={index}` demek, ilk öğe (`t1`) silindikten sonra kalan öğelerin kayması demektir: `t2` 0. konuma, `t3` 1. konuma geçer. React key'leri `0, 1, 2` → `0, 1` olarak görür. Şöyle düşünür: '0. konumdaki öğe hâlâ var — DOM düğümünü yeniden kullan.' `t1` öğesine ait DOM düğümü (belki de işaretli bir onay kutusuyla) `t2` verisi için yeniden kullanılır. Onay kutusunun durumu veriye ait değildir — DOM düğümüne aittir — dolayısıyla yanlış öğeyi takip eder.",
          "`key={item.id}` yazmak her DOM düğümünü kendi veri kimliğine (`'t1'`, `'t2'`, `'t3'`) demirler. `t1` silindiğinde React `'t1'` key'inin listede artık olmadığını görür — o belirli DOM düğümünü (onay kutusu durumu dahil) yok eder. `t2` ve `t3` DOM düğümlerini olduğu gibi korur. `t1` üzerindeki onay kutusu `t1` ile birlikte gitmiştir.",
          "Bileşen doğru şekilde basılıyor. Her yapılacak öğesinin kimliğine demirlenmiş kendi kararlı DOM düğümü var.\n\nEkranda görünecek tam metin:\n`Todo List`\n`[Onay kutusu] Learn React [Düğme: Delete]`\n`[Onay kutusu] Learn Vite [Düğme: Delete]`\n`[Onay kutusu] Build an app [Düğme: Delete]`"
        ]
      },
      "insights": [
        {
          "title": "Neden `Math.random()` değerini key olarak kullanamıyorum?",
          "steps": [
            "`Math.random()` her render'da farklı bir sayı üretir. React, bileşen her yeniden render edildiğinde (listeyle ilgisi olmayan bir ebeveyn state güncellemesi gibi sebeplerle bile) tamamen yeni key'ler görür. Listenin tamamının değiştiği sonucuna varır ve tüm DOM düğümlerini sıfırdan kurar.",
            "Bu, liste öğelerinin içindeki tüm bileşen state'ini yok eder, animasyonları yarıda keser, girdilerin odağını kaybettirir ve her render'da tam bir DOM yıkımı yaratır. Muhtemelen hiç key kullanmamaktan daha kötüdür. Veriden türeyen kimlikler kullanın veya verinizde kimlik yoksa onları *bir kez*, veri oluşturulurken üretin — render sırasında değil."
          ]
        },
        {
          "title": "`key` prop'u tam olarak nereye konur?",
          "steps": [
            "`key`, **`.map()` geri çağırımından döndürülen en dıştaki elemanda** olmalıdır. React liste öğelerini, geri çağırımınızın döndürdüğü şeye göre izler — her yinelemeden gördüğü ilk eleman.",
            "Geri çağırımınız bir `<UserCard>` bileşenini saran bir `<div>` döndürüyorsa, React `<div>` etiketini izler — `key` değerini `<div>` üzerine koyun. `key` değerini içteki `<UserCard>` üzerine koymak, dıştaki `<div>` etiketinin key'siz kalması demektir — React `<div>` için konuma dayalı takibe düşer ve amaç boşa gider."
          ]
        },
        {
          "title": "`key` prop'una bileşenin içinden asla erişilemez",
          "steps": [
            "`key`, yalnızca React'in uzlaştırıcısı tarafından tüketilen özel ve ayrılmış bir prop'tur. Bileşeninizin `props` nesnesine asla geçirilmez — `props.key` her zaman `undefined`'dır.",
            "Öğenin kimliğine bileşenin içinde ihtiyacınız varsa (örneğin bir silme işleyicisine geçirmek için), onu ayrı bir prop olarak geçirin: `id={item.id}`. `key` ve `id` ayrıdır — `key` React içindir, `id` sizin bileşeniniz için."
          ]
        }
      ]
    }
  }
};
