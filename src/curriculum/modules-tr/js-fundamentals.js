export default {
  "id": "js-fundamentals",
  "title": "JS Temelleri",
  "description": "React'in dayandığı JavaScript kavramları: kapsam, kapanışlar, referanslar, diziler ve eşzamansız davranış.",
  "lessons": {
    "js-variables": {
      "title": "Değişkenler ve Kapsam",
      "content": "\n# Değişkenler ve Kapsam\n\n### Bu nedir?\nModern JavaScript'te **`const`** ve **`let`**, eski `var` anahtar kelimesinin yerini alan blok kapsamlı değişken bildirimleridir.\n* **`const`**: Değişken adı başka bir değere **yeniden atanamaz**. (Değerin kendisi yine de değiştirilebilir — aşağıdaki İçgörülere bakın.)\n* **`let`**: Yeniden atanabilir, ama kendisini çevreleyen `{ ... }` bloğunun içinde kalır. Dışarı sızmaz.\n\n> 💡 **Zihinsel Model:** `const` değişkenini beyaz tahtaya kalıcı kalemle yazmak gibi düşünün. Tahtanın *üzerindekini* silip yeniden çizebilirsiniz (özellikleri değiştirmek), ama tahtayı başka bir tahtayla değiştiremezsiniz (yeniden atama). `let` aynı tahtadaki kurşun kalemdir — silip tamamını yeniden yazabilirsiniz. `var` ise tutunacağı duvarı olmayan bir tahtadır — bulunduğu odaya (fonksiyona) kadar yükselir ve ortalığı karıştırır.\n\n### JavaScript neden böyle çalışıyor?\nEski `var` anahtar kelimesi **fonksiyon kapsamlıdır** ve **yukarı taşınır** (hoisting). Yani bir `if` bloğu içinde tanımlanan `var`, aslında çevreleyen fonksiyonun *her yerinden* erişilebilirdir — hatta bildirildiği satırdan önce bile. Bu, özellikle döngülerde meşhur bir hata sınıfına yol açtı:\n```javascript\n// var ile: i TEK bir paylaşılan değişkendir. Herhangi bir setTimeout çalıştığında döngü bitmiştir ve i === 3.\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100); // Basar: 3, 3, 3\n}\n\n// let ile: her döngü adımı j için YEPYENİ bir bağ oluşturur.\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 100); // Basar: 0, 1, 2\n}\n```\n`let` ve `const` blok sınırlarına saygı göstererek bunu düzeltir — `{}` parantezleri anlamlı duvarlara dönüşür.\n\n### Nasıl?\n1. **Her şey için varsayılan olarak `const` kullanın.** ESLint veya TypeScript şikâyet ederse `let`'e geçin.\n2. **`let`** yalnızca gerçekten yeniden atama gerektiğinde kullanılır (döngü sayaçları, biriktirme desenleri).\n3. Modern React kodunda **asla `var` kullanmayın**.\n\n### 🔗 React Bağlantısı\nReact'te bir bileşenin gövdesinde neredeyse hiç `let` yazmayacaksınız. Nedeni şu:\n```javascript\nconst [count, setCount] = useState(0);\n```\n`count` değişkeni `const` ile tanımlanmış. Onu *yeniden atamıyorsunuz* — React mevcut fonksiyon çağrısını yok eder ve bir sonraki render'da fonksiyonu güncel değerle yeniden çağırır, yani *yeni* bir `const count` oluşturur. Önceki render'ın `count` sabiti basitçe atılır. State güncellemeleri fonksiyon çağrılarıdır, değişken değişimleri değil.\n\n### Söz Dizimi\n```javascript\n// const yeniden atamayı engeller\nconst MAX_USERS = 100;\n\n// let kendi bloğu içinde yeniden atamaya izin verir\nlet currentUser = \"Alice\";\ncurrentUser = \"Bob\";\n```\n\n### Example\n```js\nconst title = 'Const cannot be reassigned';\nlet counter = 0;\n\n// let allows reassignment:\ncounter = 5;\n\nexport default function App() {\n  return title + ' / Count is: ' + counter;\n}\n```\n\n### Challenge\n**Challenge:** Aşağıdaki kod, değer yeniden atandığı hâlde `const` kullanıyor ve kapsam sızıntısına yol açacak şekilde `var` kullanıyor. Her ikisini de düzeltin; kod hatasız çalışsın ve doğru kapsam kurallarına uysun.\n\n### Hints\n* Bir değişkenin değeri kodun herhangi bir yerinde yeniden atanıyorsa, o `const` olamaz.\n* `if (true) {}` bloğu içindeki `var`, aynı addaki dış değişkenle kapsamı **paylaşır** — ayrı bir blok kapsamlı bağ oluşturmak için `let`'e çevirin.\n* İçteki `let role`, dıştaki `let role` değişkenini güvenle gölgeler — ikisi farklı kapsam bloklarında yaşar.\n\n**Solution:**\nYeniden atanmaması gereken bağlar için `const`, yalnızca bağın kendisi değişmek zorundaysa `let` kullanın. Değişkeni ona ihtiyaç duyan en dar kapsamda tutun ve unutmayın: bir `const` nesnesinin özellikleri hâlâ değiştirilebilir — değişmezlik ayrı bir karardır.\n",
      "exampleWalkthrough": {
        "steps": [
          "`title` değişkeni `const` ile tanımlandı çünkü hiç değişmeyecek. `counter` ise `let` ile tanımlandı çünkü dört satır aşağıda yeniden atamak niyetindeyiz.\n\n`const` ile `let` arasındaki seçim yalnızca stil değildir — sonraki her okuyucuya hangi değerlerin oynayabileceğini söyler.",
          "`counter` değişkeni `let` ile tanımlandığı için bu yeniden atama çalışır. `const counter = 0` olsaydı JavaScript `TypeError: Assignment to constant variable` hatası fırlatırdı ve altındaki hiçbir şey çalışmazdı.",
          "Bu dışa aktarılan fonksiyon ekranda gösterilecek metni döndürüyor. Sıradan bir fonksiyon — tek sıra dışı yanı, döndürdüğü şeyin ekrana çıkması.\n\nEkranda görünen:\n`Const cannot be reassigned / Count is: 5`"
        ]
      },
      "walkthrough": {
        "steps": [
          "`username` hemen bir sonraki satırda yeniden atanıyor. Bağın kendisi değişmek zorunda olduğundan `const` burada geçersizdir ve doğru seçim `let`'tir.",
          "Asıl kapsam düzeltmesi burada. İki `var role` bildirimi de fonksiyon genelinde tek bir değişkeni paylaşıyordu, yani içteki dıştakini sessizce eziyordu.\n\n`let` ile içteki `role` yalnızca `if` bloğunun içinde var olur. Dıştaki `role` ayrı bir değişkendir ve blok kapandığında hâlâ `Admin` değerini tutar.",
          "İçteki `role` blok kapsamlı olduğu için dıştaki hayatta kaldı.\n\nEkranda görünen:\n`ReactPro / role: Admin`"
        ]
      },
      "insights": [
        {
          "title": "Bir dakika, `const` tamamen değiştirilemez olmalı değil miydi?",
          "steps": [
            "`const` yalnızca **yeniden atamayı** engeller — `user` değişkenini başka bir nesneye yönlendiremezsiniz. Ama JavaScript nesneleri ve dizileri referansla saklanır ve `const` yalnızca referansın kendisini kilitler, referansın gösterdiği nesneyi değil. Nesnenin iç özelliklerini serbestçe değiştirebilirsiniz.",
            "İşte bu yüzden React'te state'i değişmez kabul etmeniz *bir kural gereği* gerekir, JavaScript zorladığı için değil. `const todos = [...]` ardından `todos.push(newItem)` yazmak diziyi bellekte değiştirir ve React bundan haberdar olmaz — arayüz sessizce güncellenmez. Her zaman yeni bir dizi oluşturun: `setTodos([...todos, newItem])`."
          ]
        },
        {
          "title": "Geçici Ölü Bölge (TDZ): `let` değişkenine bildiriminden önce erişmek neden çöker?",
          "steps": [
            "`var`, kendisini çevreleyen fonksiyonun tepesine **taşınır** (hoisting). JavaScript, hiçbir kod çalışmadan önce değişkeni gizlice oluşturur ama değerini `undefined` yapar. Yani bildiriminden önce okumak çökme yerine `undefined` verir — sessiz bir hata fabrikası.",
            "`let` ve `const` da teknik olarak taşınır, ama bloğun başından gerçek bildirim satırına kadar bir **Geçici Ölü Bölge (TDZ)** içine girerler. TDZ içinde erişmek sert bir `ReferenceError` fırlatır. Bu kasıtlıdır — değişkenleri kullanmadan önce bildirmeye zorlar ve koca bir hata sınıfını çalışma anında yakalar."
          ]
        },
        {
          "title": "Klasik Döngü Kapanış Hatası: var mı let mi?",
          "steps": [
            "`var` ile, tüm döngü için tam olarak **bir** `i` değişkeni vardır. `setTimeout` içindeki üç ok fonksiyonu da kapanış (closure) yoluyla aynı `i` değişkenini yakalar. Herhangi bir zamanlayıcı çalıştığında (100 ms sonra) döngü çoktan bitmiş ve `i` değeri `3` olmuştur. Her fonksiyon `3` görür.",
            "`let` ile, döngünün her adımı **yepyeni ve bağımsız** bir `j` bağı oluşturur. Her ok fonksiyonu kendi benzersiz `j` değerini kapatır. Zamanlayıcılar çalıştığında her fonksiyon kendi özel anlık görüntüsünü görür: 0, 1 veya 2. Blok kapsamının gücü budur."
          ]
        }
      ]
    },
    "js-arrow-functions": {
      "title": "Ok Fonksiyonları",
      "content": "\n# Ok Fonksiyonları\n\n### Bu nedir?\nOk fonksiyonları (`() => ifade`), fonksiyon ifadeleri yazmanın kısa bir yoludur. Sıradan fonksiyonlardan iki önemli farkı vardır: **daha kısa söz dizimi** ve **kendilerine ait bir `this` bağı olmaması** (çevreleyen kapsamdan devralırlar).\n\n> 💡 **Zihinsel Model:** Sıradan bir fonksiyon, o anda odada kim varsa onun kimliğine bakan bir çalışan gibidir (`this` değerini onu çağıran belirler); ok fonksiyonu ise hangi odaya girerse girsin evden getirdiği kendi kartını taşıyan bir çalışandır.\n\n### JavaScript neden böyle çalışıyor?\nJavaScript'in ilk yıllarında `this` anahtar kelimesi sürekli bir kafa karışıklığı kaynağıydı, çünkü değeri tamamen fonksiyonun *nerede tanımlandığına* değil *nasıl çağrıldığına* bağlıydı. Bu, geri çağırımlar (callback) içinde kullanımı neredeyse imkânsız kılıyordu. Ok fonksiyonları bunu kalıcı olarak çözer: `this` değerini tanımlandıkları noktada yakalarlar, kendilerine ait bir `this` hiç olmaz.\n\n### Nasıl?\n1. `function(args) { return expr; }` yerine `(args) => expr` yazın (tek ifade için örtük dönüş).\n2. Çok satırlı gövdeler için `{}` ve açık `return` kalır.\n3. **Kritik tuzak:** Örtük olarak bir **nesne değişmezi** döndürürken parantez içine alın: `() => ({ id: 1 })` — aksi hâlde `{}` fonksiyon gövdesi bloğu sayılır ve `undefined` döner.\n\n### 🔗 React Bağlantısı\nReact'te yazacağınız her olay işleyicisi bir ok fonksiyonu olacak:\n```jsx\n<button onClick={() => setCount(c => c + 1)}>Increment</button>\n```\nOk fonksiyonları burada üç nedenle işe yarar:\n1. **`this` gerekmez** — React fonksiyon bileşenleri `this` kullanmaz.\n2. **Satır içi okunabilirlik** — kısa ok fonksiyonları olay bağlantısıyla eylemi aynı satırda tutar.\n3. **Kapanışlar** — ok fonksiyonu `count` ve `setCount` değerlerini kapatır, böylece her zaman o render'ın değerlerine erişir.\n\nEski söz diziminin ne kadar okunmaz olduğunu karşılaştırın:\n```jsx\n// Sınıf bileşenlerindeki eski söz dizimi\n<button onClick={function () { this.setState({ count: this.state.count + 1 }); }}>\n  Increment\n</button>\n```\n\n### Söz Dizimi\n```javascript\n// Geleneksel fonksiyon\nconst addTraditional = function(a, b) {\n  return a + b;\n};\n\n// Örtük dönüşlü ok fonksiyonu\nconst addArrow = (a, b) => a + b;\n\n// Örtük nesne dönüşü (parantez gerekir)\nconst makeUser = (name) => ({ name, active: true });\n```\n\n### Challenge\n**Challenge:** Aşağıdaki kod, bir yardımcı ve bir dönüştürücü için eski usul `function` ifadeleri kullanıyor. İkisini de modern ok fonksiyonu söz dizimine çevirin. `formatName` örtük dönüş kullanmalı.\n\n### Hints\n* `function` anahtar kelimesini kaldırın ve parametrelerden sonra `=>` ekleyin.\n* Örtük dönüş için `{}` parantezlerini ve `return` kelimesini tamamen kaldırın.\n* `shout` de aynı dönüşümü alır: `const shout = (text) => ...`\n\n**Solution:**\nFonksiyonu aynı parametrelerle bir ok fonksiyonu olarak yeniden yazın. Tek ifade için örtük dönüş kullanın ve bir nesne değişmezi döndürüyorsanız JavaScript parantezleri fonksiyon gövdesi sanmasın diye etrafına parantez ekleyin.\n\n### Example\n```js\nconst formatName = (first, last) => `${first} ${last}`;\n\nconst shout = (text) => text.toUpperCase() + '!';\n\nexport default function App() {\n  return shout(formatName('Jane', 'Doe'));\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "`formatName` **örtük dönüşlü** bir ok fonksiyonudur: süslü parantez yok, dolayısıyla `=>` işaretinden sonraki tek ifade geri dönen değerdir. Kısa yardımcılarda en sık göreceğiniz biçim budur.",
          "`shout` tek argüman alır ve o da ifadesini doğrudan döndürür. Tek parametrenin etrafındaki parantezler isteğe bağlıdır — `text => ...` de geçerlidir ve ekipler hangisini tercih ettikleri konusunda ayrışır.",
          "İki yardımcı birleşiyor: `formatName` ismi kuruyor, `shout` onu dönüştürüyor.\n\nEkranda görünen:\n`JANE DOE!`"
        ]
      },
      "walkthrough": {
        "steps": [
          "`function` anahtar kelimesi gitti, `=>` parametre listesinden sonraya geldi ve gövde tek bir `return` olduğu için süslü parantezler de `return` kelimesi de onunla birlikte kayboldu. Üç satır, hiçbir şey kaybetmeden bire indi.",
          "`shout` de aynı işlemi görüyor. Örtük dönüşün yalnızca tek bir ifade için çalıştığına dikkat edin — ikinci bir deyime ihtiyacınız olduğu anda süslü parantezler ve `return` geri gelir.",
          "Davranış değişmedi; yalnızca yazım kısaldı.\n\nEkranda görünen:\n`JOHN DOE!`"
        ]
      },
      "insights": [
        {
          "title": "Ok fonksiyonum neden `undefined` döndürüyor?",
          "steps": [
            "JavaScript'in ayrıştırıcısı `=> {` gördüğü anda `{}` işaretini nesne değişmezi değil, fonksiyon gövdesi bloğunun başlangıcı sayar. İçindeki `name: 'Alice'` etiketi geçerli JavaScript söz dizimidir (etiket ve ardından bir dizgi), bu yüzden hata fırlatmaz — yalnızca `return` deyimi olmadığı için `undefined` döner. Tamamen sessiz bir hatadır.",
            "Nesneyi parantez içine almak `({ ... })`, ayrıştırıcıyı `{}` işaretini deyim (blok) değil ifade (nesne değişmezi) olarak ele almaya zorlar. React'te `.map()` ile JSX veya nesne döndüren ok fonksiyonları yazarken bunu sürekli kullanacaksınız:\n```jsx\nitems.map(item => ({ id: item.id, label: item.name }))\n```"
          ]
        },
        {
          "title": "Ok fonksiyonları ve `this`: React bileşenleri neden `.bind(this)` gerektirmiyor?",
          "steps": [
            "Sınıf bileşenlerinde, `this.state` veya `this.setState` erişen her olay işleyicisinin yapıcıda elle bağlanması gerekiyordu; aksi hâlde olay tetiklendiğinde `this` değeri `undefined` oluyordu. Bu, React'in ilk yıllarında yeni başlayanların en sık düştüğü hatalardan biriydi.",
            "Fonksiyon bileşenlerinde `this` diye bir şey yoktur. Ok fonksiyonları değişkenleri kapanışlarından yakalar — `count` ve `setCount` kapsamdaki sıradan değişkenlerdir. Modern React kodunun yazması ve üzerine düşünmesi bu kadar kolay olmasının sebebi budur."
          ]
        },
        {
          "title": "Dizi Metotlarında Örtük Nesne Dönüşü Tuzağı",
          "steps": [
            "Tam olarak bu hata, React'te liste kurarken sürekli karşınıza çıkar. `users.map(u => { id: u.id })` yazımı `{ id: 1 }` nesneleri üretecekmiş gibi görünür — ama `{}` fonksiyon gövdesi olarak ayrıştırılır, dolayısıyla ok fonksiyonu hiçbir şey döndürmeden çalışır.",
            "Nesne değişmezinin etrafına `()` eklemek `({ id: u.id })` sorunu çözer. Bir diziyi nesne dizisine `.map()` etmek istediğinizde doğru desen budur. API verisi dönüştürürken React'te sık göreceksiniz."
          ]
        }
      ]
    },
    "js-template-literals": {
      "title": "Şablon Dizgileri",
      "content": "\n# Şablon Dizgileri\n\n### Bu nedir?\nŞablon dizgileri, tırnak yerine ters tırnak (`` ` ``) içine alınan metinlerdir. İçlerine `${ifade}` söz dizimiyle herhangi bir JavaScript ifadesini doğrudan gömmenize izin verir ve satır sonlarını korur.\n\n> 💡 **Zihinsel Model:** Şablon dizgilerini boşluk doldurmalı bir davetiye kartı gibi düşünün: bir cümleyi kurmak için ayrı kâğıt parçalarını birbirine yapıştırmak (dizgi birleştirme) yerine, cümlenin tamamını bir kez yazar ve boşluklara değerleri bırakırsınız.\n\n### JavaScript neden böyle çalışıyor?\nŞablon dizgilerinden önce dinamik metin kurmak `+` ile birleştirme gerektiriyordu; bu hem kırılgan hem de okunması zordu — özellikle değişkenler, boşluklar ve özel karakterler karıştığında. Şablon dizgileri metni asıl nesne hâline getirerek ve ifadelerin içinde doğal akmasına izin vererek bunu çözer.\n\n### Nasıl?\n`'...'` veya `\"...\"` yerine `` `...` `` yazın. Bir değer istediğiniz her yerde `${` yazın, ardından geçerli bir JavaScript ifadesi, sonra `}`.\n\n### 🔗 React Bağlantısı\nJSX'in etiketler içindeki `{ifade}` söz dizimi, şablon dizgisindeki `${ifade}` karşılığıdır — ikisi de bir JavaScript ifadesini değerlendirip sonucu yerleştirir. Şablon dizgilerini sürekli şunlar için kullanacaksınız:\n```jsx\n// Dinamik sınıf adları\n<div className={`card ${isActive ? 'card--active' : ''}`}>Card</div>;\n\n// Dinamik adresler\nfetch(`/api/users/${userId}/posts`);\n\n// Hata ayıklama mesajları\nconsole.log(`Rendered with count: ${count}`);\n```\n\n### Söz Dizimi\n```javascript\nconst name = \"World\";\n\n// Eski dizgi birleştirme\nconst oldMessage = \"Hello, \" + name + \"!\"; // \"Hello, World!\"\n\n// Modern şablon dizgisi\nconst newMessage = `Hello, ${name}!`; // \"Hello, World!\"\n```\n\n### Challenge\n**Challenge:** Kod, `message` metnini kurmak için dağınık `+` birleştirmesi kullanıyor. Bunu tek ve temiz bir şablon dizgisine dönüştürün.\n\n### Hints\n* Metnin tamamını ters tırnak `` ` `` içine alın. `+` operatörlerini ve tırnaklı parçaları kaldırın.\n* Her değişkeni cümlede ait olduğu yere tam olarak `${değişkenAdı}` ile yerleştirin.\n* `${}` etrafına fazladan boşluk eklemeniz gerekmez — cümleyi doğal biçimde yazmanız yeterli.\n\n**Solution:**\nTers tırnaklı bir şablon dizgisi kullanın ve ifadeleri `${...}` ile yerleştirin. Bu, değeri okunabilir tutar, elle dizgi birleştirmeyi ortadan kaldırır ve metin ile JavaScript ifadesi arasındaki ayrımı korur.\n\n### Example\n```js\nconst name = 'Alice';\nconst greeting = `Hello, ${name}! Welcome to the course.`;\n\nexport default function App() {\n  return greeting;\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Sıradan bir metin, daha uzun bir cümlenin içine yerleştirmek istediğimiz değeri tutuyor.",
          "Ters tırnaklar bir **şablon dizgisi** başlatır. `${ ... }` içindeki her şey JavaScript olarak değerlendirilir ve sonucu metne yerleştirilir.\n\nAlternatifiyle karşılaştırın: `'Hello, ' + name + '! Welcome to the course.'` — aynı sonuç, ama cümle parçalara bölünmüş ve boşlukları yanlış yapmak çok kolay.",
          "Tamamlanmış cümle olduğu gibi döndürülüyor.\n\nEkranda görünen:\n`Hello, Alice! Welcome to the course.`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Üç değer değişmedi — yalnızca aşağıda bir araya getiriliş biçimleri değişti.",
          "Cümlenin tamamı artık soldan sağa, ürettiği cümle olarak okunuyor. Boşluklar `' '` parçalarının içinde saklanmak yerine ait oldukları yerde görünüyor; birleştirme hataları da tam olarak oradan çıkar.",
          "Ekranda görünen:\n`Hello Jane, your total is 150 USD.`\n\n`150.00` değil `150` yazdığına dikkat edin: şablon dizgisi sayıyı JavaScript nasıl gösteriyorsa öyle yerleştirir. Biçimlendirme ayrı bir iştir."
        ]
      },
      "insights": [
        {
          "title": "`${}` içinde tam JavaScript ifadeleri çalıştırabilir miyim?",
          "steps": [
            "`${}` yuvası geçerli her JavaScript ifadesini kabul eder — matematik, fonksiyon çağrıları, metot zincirleri, üçlü operatörler, hatta başka şablon dizgileri. `.toFixed(2)` sayıyı iki ondalığa yuvarlar ve bir metin döndürür. Buradaki `${...}` öncesindeki `$` yalnızca düz bir dolar işaretidir — yerleştirmeyi yalnızca `${` tetikler, dolayısıyla tek başına bir `$` hiç kaçırılmaya ihtiyaç duymaz. Hemen ardından `{` gelen düz bir `$` yazmanız gerekirse `\\$` ile kaçırın; örneğin `Price: \\${100}` ekrana `Price: ${100}` basar, `100` değerini hesaplamaya çalışmaz.",
            "Şablon dizgisi içindeki üçlü operatörler, React'te dinamik sınıf adları ve öznitelik metinleri kurmak için son derece yaygındır. Bu desen, koşullu CSS sınıflarını birleştirirken çirkin dizgi birleştirmesinden kurtarır."
          ]
        },
        {
          "title": "Kaçış dizileri olmadan çok satırlı metinler",
          "steps": [
            "Sıradan metinlerde satır sonu `\\n` kaçış dizisini gerektirir — unutulması veya yanlış yere konması çok kolay olan görünmez karakterler.",
            "Şablon dizgileri kaynak kodunuzdaki gerçek satır sonlarını korur. Bu, çok satırlı hata mesajları, SQL sorguları veya HTML metinleri kurarken işe yarar. React'te JSX zaten çok satırlı işaretlemeyi hallettiği için daha az rastlanır, ama yardımcı fonksiyonlarda ve testlerde paha biçilmezdir."
          ]
        },
        {
          "title": "Etiketli Şablon nedir? (`styled-components` nasıl çalışır?)",
          "steps": [
            "Bir şablon dizgisinin hemen önüne bir fonksiyon adı koyarsanız, JavaScript o fonksiyonu çağırır ve metin parçalarıyla yerleştirilen değerleri ayrı argümanlar olarak geçirir. Buna **etiketli şablon** denir.",
            "`styled-components` ve `graphql-tag` gibi kütüphaneler tamamen buna dayanır. `styled.button` yalnızca bir fonksiyondur ve şablon dizgisi onu CSS metniyle çağırır. `${props => props.primary ? 'blue' : 'white'}` yuvası metin değil gerçek bir fonksiyon geçirir, böylece `styled-components` onu render anında bileşen prop'larıyla çağırabilir."
          ]
        }
      ]
    },
    "js-destructuring": {
      "title": "Ayrıştırma (Destructuring)",
      "content": "\n# Ayrıştırma (Destructuring)\n\n### Bu nedir?\nAyrıştırma, dizilerden değerleri veya nesnelerden özellikleri tek satırda ayrı değişkenlere **açmanızı** sağlayan bir JavaScript söz dizimidir.\n\n> 💡 **Zihinsel Model:** Ayrıştırma bir posta ayırma makinesi gibidir. Nesne ya da dizi sağdan girer. Makine belirli etiketli gözleri (nesneler için) veya konumları (diziler için) tarar ve çıkardığı her değeri soldaki eşleşen adlı değişkene bırakır. Geri kalan her şey yok sayılır.\n\n### JavaScript neden böyle çalışıyor?\nAyrıştırmadan önce iç içe veriye erişmek tekrarlayan nokta gösterimi gerektiriyordu: `props.user.name`, `props.user.age`, `props.user.role`. Bu, bir fonksiyonun aslında hangi özellikleri kullandığını ilk bakışta belirsiz kılar. Ayrıştırma sözleşmeyi açık hâle getirir — hangi veriden neyin çıkarıldığını tam olarak görürsünüz.\n\n### Nasıl?\n**Nesne ayrıştırma:** Solda `{}` kullanın. Değişken adları özellik adlarıyla eşleşmelidir (ya da yeniden adlandırabilirsiniz).\n**Dizi ayrıştırma:** Solda `[]` kullanın. Neyi aldığınızı adlar değil, konumlar belirler.\n\n### 🔗 React Bağlantısı\nAyrıştırma React'te *her yerdedir*. **Aşağıdaki React kodunu anlamanız beklenmiyor** — meydana geldiğinde şeklini tanıyabilin diye burada. Her satır ilerleyen derslerde tam olarak anlatılıyor: `useState` ve prop'lar Temeller modülünde, `useQuery` Ölçekte State Yönetimi modülünde, `useContext` ise State Paylaşımı modülünde.\n\n```jsx\n// 1. Hook dönüş değerlerini ayrıştırma (dizi ayrıştırma)\nconst [count, setCount] = useState(0);\n\n// 2. Fonksiyon imzasında prop ayrıştırma (nesne ayrıştırma)\nfunction UserCard({ name, age, role = 'Member' }) {\n  return <p>{name} ({age}) - {role}</p>;\n}\n\n// 3. API yanıtlarını ayrıştırma (nesne ayrıştırma)\nconst { data, isLoading, error } = useQuery({ queryKey: ['users'] });\n\n// 4. Context değerlerini ayrıştırma\nconst { user, signOut } = useContext(AuthContext);\n```\n`useState` çağırdığınız her seferde dizi ayrıştırma kullanıyorsunuz. `[data, setter]` yerine `[count, setCount]` adlandırma geleneğinin sebebi, dizi ayrıştırmanın değişken adlarını serbestçe seçmenize izin vermesidir — `useState` yalnızca sabit sırada iki elemanlı bir dizi döndürür.\n\n### Söz Dizimi\n```javascript\nconst person = { name: \"Bob\", age: 30 };\nconst colors = [\"red\", \"blue\"];\n\n// Nesne ayrıştırma\nconst { name, age } = person;\n\n// Dizi ayrıştırma\nconst [primary, secondary] = colors;\n```\n\n### Challenge\n**Challenge:** Kod, `book` içinden veri çıkarmak için uzun nokta ve köşeli parantez gösterimi kullanıyor. `title` ve `author` için nesne ayrıştırma, `tag1` ve `tag2` için dizi ayrıştırma kullanacak şekilde yeniden yazın.\n\n### Hints\n* Nesne için: `const { title, author } = book;` — özellik adları birebir eşleşmeli.\n* Dizi için: `const [tag1, tag2] = book.tags;` — `book` içinden değil, `book.tags` içinden çıkarıyorsunuz.\n* Dizi ayrıştırmada sıra önemlidir — `tag1` sıfırıncı, `tag2` birinci elemanı alır.\n\n**Solution:**\nDeğerleri kullanıldıkları noktada ayrıştırın ve her değişkene açık bir ad verin. İç içe veya isteğe bağlı veriler için güvenli bir varsayılan verin ve yedeği sonraki bir koşulun içinde gizlemek yerine görünür tutun.\n\n### Example\n```js\nconst user = { username: 'Alice', level: 5 };\nconst tools = ['React', 'JavaScript'];\n\nconst { username, level } = user;\nconst [firstTool, secondTool] = tools;\n\nexport default function App() {\n  return `${username} is level ${level}, using ${firstTool} and ${secondTool}.`;\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Bir nesne ve bir dizi; her ikisi de adıyla kullanmak istediğimiz değerleri tutuyor.",
          "**Nesne ayrıştırma** özellikleri anahtarlarıyla çeker. Bu tek satır, `const username = user.username;` ve `const level = user.level;` satırlarının yerine geçer — ve adlar anahtarlarla birebir eşleşmelidir.",
          "**Dizi ayrıştırma** elemanları konumlarıyla çeker. Burada adları siz seçersiniz, çünkü dizilerin anahtarı yoktur — yalnızca sırası vardır.",
          "Dört değer de artık sıradan birer değişken.\n\nEkranda görünen:\n`Alice is level 5, using React and JavaScript.`"
        ]
      },
      "walkthrough": {
        "steps": [
          "Veriye dokunulmadı. Ayrıştırma yalnızca değerlerin ondan nasıl okunduğunu değiştirir.",
          "İki `book.` erişimi tek satıra iniyor. Değişken adları anahtarlardan gelir; bu yüzden `:` yeniden adlandırma söz dizimi olmadan burada başka bir ad veremezsiniz.",
          "Dizi biçimi ilk iki etiketi konumlarına göre alıyor. Üçüncü etiket olan `ui` basitçe toplanmıyor — ayrıştırma her şeyi almanızı asla zorunlu kılmaz.",
          "Ekranda görünen:\n`The Great React by Code Master — tags: frontend, web`"
        ]
      },
      "insights": [
        {
          "title": "Ayrıştırma fonksiyon parametrelerinde nasıl çalışır? (prop'lar!)",
          "steps": [
            "Ayrıştırma olmadan her prop erişiminin başına `props.` koymanız gerekir. On prop'u olan bir bileşende bu son derece gürültülü hâle gelir ve bileşenin gerçekte hangi prop'ları kullandığını gizler.",
            "Parametre listesinde ayrıştırma (`{ name, role }`) aynı anda iki iş yapar: değerleri çıkarır *ve* bileşenin arayüzünü belgeler. Bileşenin hangi veriye ihtiyaç duyduğunu tek bakışta görürsünüz. `= 'Member'` ise bir **varsayılan değerdir** — `role` tanımsızsa (ebeveyn geçirmediyse) otomatik olarak `'Member'` değerine düşer."
          ]
        },
        {
          "title": "Ayrıştırırken değişkenleri yeniden adlandırabilir miyim?",
          "steps": [
            "`: yeniAd` söz dizimi, ayrıştırma sırasında bir özelliği yeniden adlandırır. `u: username` şu demektir: \"`u` adlı özelliği bul, ama `username` adlı bir değişken oluştur\". Özgün özellik adı `u` bir değişkene dönüşmez — yalnızca `username` dönüşür. Kısaltılmış veya anlaşılmaz özellik adları döndüren API'lerle çalışırken inanılmaz faydalıdır."
          ]
        },
        {
          "title": "Dizi ayrıştırmada eleman atlama",
          "steps": [
            "Boş bir yuva (değişken adı olmayan bir virgül) ayrıştırmaya o konumu tamamen atlamasını söyler. `[red, , blue]` içindeki `,,` birinci indeksi atlar. Bu desen seyrek kullanılır ama bir hook birden çok değer döndürüp siz yalnızca bazılarına ihtiyaç duyduğunuzda React'te karşınıza çıkar — gerçi o durumda genellikle nesne ayrıştırma daha temizdir."
          ]
        }
      ]
    },
    "js-spread-rest": {
      "title": "Yayma ve Toplama Operatörleri",
      "content": "\n# Yayma ve Toplama Operatörleri\n\n### Bu nedir?\nİkisi de üç nokta `...` kullanır. **Yayma (spread)**, bir dizinin elemanlarını veya bir nesnenin özelliklerini başka bir dizi ya da nesnenin içine açar. **Toplama (rest)** tam tersini yapar — kalan elemanları bir dizide toplar.\n\n> 💡 **Zihinsel Model:** Yayma, bir torba bilyeyi masaya dökmek gibidir — bilyeler (değerler) tek tek dağılır. Toplama ise masadaki bilyeleri süpürüp *torbaya* geri koymaktır. Aynı hareket, ters yön.\n\n### JavaScript neden böyle çalışıyor?\nReact, state güncellemelerinin değişmez olmasını gerektirir — mevcut bir diziyi veya nesneyi değiştirip React'in bunu fark etmesini bekleyemezsiniz. **Yeni bir referans** oluşturmanız gerekir. Yayma operatörü, bir yapıyı kopyalarken belirli değerleri eklemenin ya da geçersiz kılmanın en kısa ve en okunabilir yoludur.\n\n### 🔗 React Bağlantısı\nYayma, nesne ve dizi içeren tüm state güncellemelerinin belkemiğidir:\n```javascript\n// Diziye ekleme (state üzerinde asla .push kullanmayın!)\nsetItems(prev => [...prev, newItem]);\n\n// Diziden çıkarma\nsetItems(prev => prev.filter(item => item.id !== idToRemove));\n\n// Nesnede tek bir alanı güncelleme (asla doğrudan değiştirmeyin!)\nsetUser(prev => ({ ...prev, name: newName }));\n\n// Form alanı değişikliklerini birleştirme\nsetForm(prev => ({ ...prev, [e.target.name]: e.target.value }));\n```\nYayma olmasaydı, tek bir şeyi değiştirmek için her özelliği elle kopyalamanız gerekirdi — hataya açık ve uzun.\n\n### Nasıl?\n* **Diziler:** `[...eskiDizi, yeniEleman]` tüm eski elemanları ve sonuna `yeniEleman` ekleyen yeni bir dizi oluşturur.\n* **Nesneler:** `{ ...eskiNesne, yeniOzellik: deger }` tüm eski özellikleri içeren ve `yeniOzellik` ile ekleyen veya ezen yeni bir nesne oluşturur.\n* **Nesnelerde sıra önemlidir:** yaymadan sonra yazılan aynı adlı özellikler öncekileri ezer.\n\n### Söz Dizimi\n```javascript\nconst colors = [\"red\", \"blue\"];\nconst newColors = [...colors, \"green\"]; // [\"red\", \"blue\", \"green\"]\n\nconst user = { name: \"Ali\", age: 25 };\nconst updatedUser = { ...user, age: 26, admin: true };\n// { name: \"Ali\", age: 26, admin: true }\n```\n\n### Challenge\n**Challenge:** `.concat()` çağrısını dizi yayma ile, `Object.assign()` çağrısını da nesne yayma ile değiştirin.\n\n### Hints\n* Dizi yayma söz dizimi: `[...eskiDizi, yeniEleman]`.\n* Nesne yayma söz dizimi: `{ ...eskiNesne, ezilecekAnahtar: yeniDeger }`.\n* Yayma her zaman nesnede önce gelir ki sonraki özellikler onu ezebilsin.\n\n**Solution:**\nMevcut veriyi koruyan yeni bir değer oluşturmak için nesne veya dizi yayma kullanın, ardından ihtiyacınız olan alanı ezin veya elemanı ekleyin. Bir fonksiyonun belirsiz sayıda kalan argümanı toplaması gerektiğinde toplama parametrelerini kullanın.\n\n### Example\n```js\nconst arr1 = [1, 2];\nconst arr2 = [...arr1, 3, 4];\n\nconst user = { name: 'Ali', age: 25 };\nconst updatedUser = { ...user, age: 26 };\n\nconst sum = (...numbers) => numbers.reduce((total, n) => total + n, 0);\n\nexport default function App() {\n  return `Array: ${arr2.join(', ')} | Age: ${updatedUser.age} | Sum: ${sum(...arr2)}`;\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "**Yayma**, `arr1` elemanlarını yepyeni bir diziye kopyalar, sonra üzerine ekler. `arr1` kendisi dokunulmadan kalır — bu bir kopyadır, değişiklik değil.",
          "Nesneler için aynı fikir. `{ ...user }` her özelliği kopyalar, sonra `age: 26` bunlardan birini ezer. Sıra önemlidir: yaymadan sonra yazılan anahtarlar kazanır.",
          "**Toplama** bunun ayna görüntüsüdür ve aynı üç noktadır. Bir parametre listesinde `...numbers`, bir diziyi dağıtmak yerine her argümanı tek bir dizide toplar.",
          "`sum(...arr2)` diziyi tekrar ayrı argümanlara yayar, `...numbers` de onları yeniden toplar.\n\nEkranda görünen:\n`Array: 1, 2, 3, 4 | Age: 26 | Sum: 10`"
        ]
      },
      "walkthrough": {
        "steps": [
          "`concat` yerini yaymaya bırakıyor. İkisi de yeni bir dizi üretir ve `baseColors` değişkenine dokunmaz; yayma sürümü sonucun şeklini sayfada doğrudan gösterir.",
          "`Object.assign({}, profile, { theme: 'dark' })` yerini `{ ...profile, theme: 'dark' }` alıyor. Baştaki boş `{}` argümanı yalnızca `profile` nesnesini değiştirmemek için vardı — yayma ile değiştirmemek, ayarlamayı hatırlamanız gereken bir şey değil, varsayılan davranıştır.",
          "Ekranda görünen:\n`Colors: red, blue, green | Theme: dark`\n\nBu modülün size en çok kazandırmak istediği alışkanlık, işte bu \"değiştirme, kopyala\" alışkanlığıdır."
        ]
      },
      "insights": [
        {
          "title": "İç içe nesneler içeren bir nesneyi yaymak neden hâlâ referans paylaşıyor?",
          "steps": [
            "Yayma **sığ bir kopya** oluşturur — üst düzey anahtarları değerleriyle kopyalar, ama iç içe nesneler ve diziler için nesnenin kendisini değil *referansını* (bellek adresini) kopyalar. Yani `copy.b` ile `original.b` *bellekteki aynı nesneyi* gösterir.",
            "`copy.b.c` değerini değiştirmek, hem `copy.b` hem `original.b` tarafından gösterilen ortak nesneyi değiştirir. Bu, gizemli React state hatalarının bir numaralı sebebidir. Düzeltmek için iç içe nesneleri de yaymanız gerekir: `{ ...original, b: { ...original.b, c: 99 } }`. Değişen her katmanın kendi yayması olmalıdır."
          ]
        },
        {
          "title": "Toplama parametreleri: argümanların 'geri kalanını' toplamak",
          "steps": [
            "Fonksiyon parametrelerinde `...rest`, açıkça adlandırılanlardan sonraki tüm argümanları bir dizide toplar. `sum(1, 2, 3, 4)` çağrısı `first = 1` ve `rest = [2, 3, 4]` verir. Toplama parametresi her zaman sonda olmalıdır — `...rest` sonrasına parametre koyamazsınız.",
            "Nesne ayrıştırmada `...rest`, açıkça adlandırılmamış kalan tüm özellikleri yeni bir nesnede toplar. React'te bu, **prop iletmenin** standart yöntemidir — ihtiyacınız olan prop'ları (`onClick`, `children`) çıkarır, geri kalan her şeyi (`className`, `disabled`, `aria-label`) `{...rest}` ile alttaki DOM elemanına geçirirsiniz."
          ]
        }
      ]
    },
    "js-array-methods": {
      "title": "Dizi Metotları",
      "content": "\n# Dizi Metotları (.map, .filter, .reduce)\n\n### Bu nedir?\n`Array.prototype.map()`, `filter()` ve `reduce()`, diziyi değiştirmeden dönüştüren **saf** yüksek mertebeli fonksiyonlardır.\n* **`.map(fn)`** — her elemana `fn` uygular ve sonuçlardan aynı uzunlukta yeni bir dizi döndürür.\n* **`.filter(fn)`** — yalnızca `fn` fonksiyonunun `true` döndürdüğü elemanları tutar ve yeni (daha kısa) bir dizi döndürür.\n* **`.reduce(fn, baslangic)`** — tüm elemanları tek bir değerde biriktirir.\n\n> 💡 **Zihinsel Model:** `.map()` bir fabrika montaj hattıdır — banttaki (girdi dizisi) her parça aynı makineden (fonksiyonunuz) geçer ve dönüşmüş olarak çıkar (çıktı dizisi). `.filter()` ise kalite kontrolcüsüdür — bazı parçalar geçer, bazıları elenir. Hattın uzunluğu değişebilir.\n\n### React neden `for` döngüleri yerine bunları kullanıyor?\nReact render'ları **saf fonksiyonlardır** — aynı state verildiğinde aynı JSX'i üretmelidirler. `push()` kullanan buyurgan `for` döngüleri durum tutar ve değiştirme gerektirir. `.map()` ve `.filter()` gibi işlevsel metotlar yan etkisiz olarak yeni diziler döndürür, bu da onları render sırasında çağırmayı güvenli kılar. Ayrıca daha okunabilirdirler — niyet (dönüştür, filtrele) metodun adında ifade edilir.\n\n### 🔗 React Bağlantısı\nBu üç metot, React'te liste basmanın ve türetilmiş state'in kalbidir:\n```jsx\n// Liste basma: .map() veriyi JSX'e çevirir\n{users.map(user => <UserCard key={user.id} user={user} />)}\n\n// Gösterilen öğeleri filtreleme: state'i değiştirme, türet\nconst activeUsers = users.filter(u => u.active);\n\n// State'ten bir öğe çıkarma: id ile filtrele\nsetItems(prev => prev.filter(item => item.id !== idToDelete));\n\n// Toplam hesaplama: toplamalar için .reduce()\nconst total = cart.reduce((sum, item) => sum + item.price, 0);\n```\n\n### Söz Dizimi\n```javascript\nconst doubled = [1, 2, 3].map(n => n * 2);     // [2, 4, 6]\nconst evens   = [1, 2, 3].filter(n => n % 2 === 0); // [2]\nconst sum     = [1, 2, 3].reduce((acc, n) => acc + n, 0); // 6\n```\n\n### Challenge\n**Challenge:** Buyurgan `for` döngüsünü, yalnızca aktif kullanıcıların adlarını üretecek zincirlenmiş bir `.filter()` ve `.map()` ile değiştirin.\n\n### Hints\n* Önce `.filter()` ile yalnızca aktif kullanıcıları seçin, sonra `.map()` ile adlarına dönüştürün.\n* `.filter()`, `true` (tut) veya `false` (at) döndüren bir fonksiyon alır.\n* Dizi artık tek seferde üretildiği için `let names = []` yerine `const names` kullanabilirsiniz.\n\n**Solution:**\nNiyeti anlatan metodu seçin: `map` her öğeyi dönüştürür, `filter` eşleşenleri tutar, `find` tek bir eşleşme döndürür, `reduce` ise değerleri birleştirir. Özgün girdiyi değiştirmek yerine yeni diziyi döndürün.\n\n### Example\n```js\nconst scores = [\n  { id: 1, player: 'Ada', points: 42 },\n  { id: 2, player: 'Linus', points: 17 },\n  { id: 3, player: 'Grace', points: 88 }\n];\n\nconst total = scores.reduce((sum, score) => sum + score.points, 0);\n\nconst leaders = scores\n  .filter(score => score.points > 20)\n  .map(score => `${score.player}: ${score.points}`);\n\nexport default function App() {\n  return `Above 20 — ${leaders.join(' | ')} (total ${total})`;\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Nesnelerden oluşan bir liste. Aşağıdaki her şey bu listeyi hiç değiştirmeden dönüştürüyor.",
          "`reduce` listeyi gezer ve tek bir değere katlar. Sondaki `0` başlangıç toplamıdır — onu yazmazsanız ilk nesne başlangıç değeri olur ki bu da klasik `[object Object]42` sonuçlarının kaynağıdır.",
          "`filter`, geri çağırımı true döndüren kayıtları tutar ve daha kısa bir dizi üretir. `map` ise hayatta kalan her kaydı başka bir şeye çevirir — burada bir metne.\n\nHer adım **yeni** bir dizi döndürür; zincirlenebilmelerinin sebebi budur.",
          "Ekranda görünen:\n`Above 20 — Ada: 42 | Grace: 88 (total 147)`\n\n`total` değerinin 130 değil 147 olduğuna dikkat edin: `reduce`, filtrelemeden önce özgün liste üzerinde çalıştı."
        ]
      },
      "walkthrough": {
        "steps": [
          "Veri değişmedi. Değişen yalnızca ondan bir ad listesini türetme biçimimiz.",
          "Altı satırlık döngü, ne demek istediğini söyleyen üç satıra iniyor: aktif kullanıcıları tut, sonra her birinin adını al.\n\n`let names = []` da `const names` oluyor, çünkü dizi artık tekrarlanan `push` ile büyütülmüyor — tek seferde üretiliyor.",
          "Ekranda görünen:\n`Active users: Alice, Charlie`\n\nDöngü yanlış değildi. Fark şu: `filter` ve `map` niyeti belirtir, döngü ise mekaniği belirtip niyeti çıkarımınıza bırakır."
        ]
      },
      "insights": [
        {
          "title": "`.map()` ile `.forEach()` farkı — React neden `.map()` kullanır?",
          "steps": [
            "`.forEach()` fonksiyonunuzu yan etkiler için çağırır — her zaman `undefined` döndürür. JSX içinde `{items.forEach(...)}` denerseniz React hiçbir şey basmaz. Yeni başlayanların çok sık yaptığı bir hatadır.",
            "`.map()`, fonksiyonunuzun her eleman için döndürdüğü değerleri içeren yeni bir dizi döndürür. JSX, React elemanlarından oluşan dizileri basabildiği için `{items.map(...)}` bir JSX ifadesi olarak kusursuz çalışır. Veriyi basılabilir çıktıya dönüştürmek istediğinizde doğru araç `.map()`'tir."
          ]
        },
        {
          "title": "Performans için `.filter()` metodunu `.map()` öncesine zincirlemek",
          "steps": [
            "Önce `.map()` sonra `.filter()` yaparsanız, `expensiveTransform` işlemini her bir öğe için çalıştırır, sonra sonuçların çoğunu çöpe atarsınız. Bu, elenen öğe sayısıyla orantılı bir hesaplama israfıdır.",
            "Önce filtrelemek istenmeyen öğeleri ucuza atar (dönüştürme maliyeti yok), sonra yalnızca kalanları dönüştürür. Filtre koşulunuz dönüştürülmüş veriye bağlı değilse `.filter()` metodunu her zaman `.map()` öncesine koyun. React'in render fonksiyonu sık çalışabilir, bu yüzden küçük kazanımlar birikir."
          ]
        },
        {
          "title": "`.find()` ile `.filter()` farkı — tek öğe mi, çok öğe mi?",
          "steps": [
            "`.find()` eşleşen ilk **elemanı** doğrudan döndürür — dizi değil. Bir eşleşme bulur bulmaz taramayı durdurur. Belirli bir öğeyi kimliğiyle ararken bunu kullanın (örneğin `selectedItem = items.find(i => i.id === selectedId)`).",
            "`.filter()` her zaman dizinin tamamını tarar ve her zaman bir **dizi** döndürür — yalnızca tek öğe eşleşse bile `item` değil `[item]` alırsınız. Birden çok eşleşme beklediğinizde veya türetilmiş bir liste kurduğunuzda (`activeItems` gibi) `.filter()` kullanın."
          ]
        }
      ]
    },
    "js-ternary": {
      "title": "Üçlü Operatör",
      "content": "\n# Üçlü Operatör\n\n### Bu nedir?\nÜçlü operatör, JavaScript'in üç parçalı tek **ifadesidir**: `koşul ? doğruysaDeğer : yanlışsaDeğer`. Her zaman bir değer üretir; onu bir `if` deyiminden temelde ayıran şey budur.\n\n> 💡 **Zihinsel Model:** Üçlü operatörü, sonuçları önceden belirlenmiş bir yazı tura gibi düşünün: evet/hayır sorusu sorarsınız (`koşul ?`) ve cevaba göre iki ödülden birini geri alırsınız. Buradaki kilit ifade \"geri alırsınız\" — bu bir eylem değil, bir ifadedir.\n\n### JSX neden deyim değil ifade istiyor?\nJSX'in `{}` yuvaları yalnızca **ifadeleri** kabul eder — bir değere dönüşen şeyleri. Bir `if` deyimi değer üretmez; *programın akışını yönetir*. Bu yüzden JSX içinde `{if (koşul) { <A /> }}` yazamazsınız. Üçlü operatör bir ifadedir, dolayısıyla `{}` içinde kusursuz çalışır.\n\n### ⚠️ `0 && <Component />` Tuzağı\nPek çok geliştirici koşullu basma için `&&` kullanır: `{count && <Badge />}`. **Dikkat:** JavaScript'te `0` yanlışsı (falsy) bir değerdir. `0 && <Badge />` ifadesi `0` değerine dönüşür ve React sayfanıza `0` sayısını basar!\n\nHer zaman açık bir mantıksal kontrol kullanın:\n```jsx\n{count > 0 && <Badge />}       // ✅ Güvenli\n{Boolean(count) && <Badge />}  // ✅ Güvenli\n{count ? <Badge /> : null}     // ✅ En açık hâli\n```\n\n### 🔗 React Bağlantısı\nÜçlü operatör React'in **birincil koşullu basma aracıdır**:\n```jsx\nfunction Example({ isLoggedIn, isActive, data }) {\n  return (\n    <>\n      {/* Oturum durumuna göre farklı içerik göster */}\n      {isLoggedIn ? <Dashboard /> : <LoginPage />}\n\n      {/* Dinamik CSS sınıfları */}\n      <div className={`btn ${isActive ? 'btn--active' : 'btn--default'}`}>Save</div>\n\n      {/* Yedek içerik */}\n      {data ? <DataTable data={data} /> : <EmptyState />}\n    </>\n  );\n}\n```\n\n### Söz Dizimi\n```javascript\nconst score = 85;\nconst status = score >= 50 ? \"Passed\" : \"Failed\";\n```\n\n### Challenge\n**Challenge:** Kod, `text` ve `tone` değerlerini atamak için `let` değişkenleri ve bir `if/else` bloğu kullanıyor. Bunu üçlü operatörlerle yeniden yazın ve `let` değişkenlerinden kurtulun.\n\n### Hints\n* Her değer tek satırda karar verilebilir: `const text = isOnline ? '...' : '...';`\n* Tek satırda hem tanımlanıp hem karar verildiği için `let` yerine `const` kullanabilirsiniz.\n* İki değer de aynı koşula bakar, ama her biri kendi üçlü ifadesini alır.\n\n**Solution:**\n`const text = isOnline ? 'System Online' : 'System Offline';` ve `const tone = isOnline ? 'success' : 'error';` yazın; iki `let` tanımını ve `if/else` bloğunun tamamını silin. Artık hiçbir değer yeniden atanmıyor; `const` tam da bu yüzden doğru seçim, çünkü bu değerler dosyanın devamında sessizce değiştirilemez.\n\n### Example\n```js\nconst isLoggedIn = true;\n\nconst message = isLoggedIn ? 'Welcome back!' : 'Please log in.';\n\nexport default function App() {\n  return message;\n}\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Tek bir mantıksal değer, iki değerden hangisini istediğimizi belirliyor.",
          "Üçlü operatör bir cümle gibi okunur: *eğer* `isLoggedIn` ise, *o zaman* ilk değer, *yoksa* ikincisi. `if` deyiminin aksine bu bir **ifadedir** — bir değer üretir, dolayısıyla bir `=` işaretinin sağında durabilir.\n\nBu ayrım onu ileride kullanışlı kılan şeydir: bir `if` deyimi değer beklenen yere konulamaz, ama üçlü operatör konulabilir.",
          "Ekranda görünen:\n`Welcome back!`\n\nBirinci satırdaki `true` değerini `false` yapın; diğer dal seçilir."
        ]
      },
      "walkthrough": {
        "steps": [
          "Koşul değişmedi.",
          "Her değişken artık tek satırda hem tanımlanıp hem karara bağlandığı için `let` yerini `const` aldı. Başlangıç kodunda `let text;` satırı, `if` bloğu onu doldurana kadar boş bir kutu olarak var olmak zorundaydı — iki karar için dokuz satırlık iskele.",
          "Ekranda görünen:\n`[success] System Online`\n\nÜçlü operatör tam olarak bunda en iyidir: bir koşul, iki değer. Bir `if` yazmamak için üç kat iç içe geçirmek, okunabilirliğini kaybettiği noktadır."
        ]
      },
      "insights": [
        {
          "title": "JSX içinde neden `if` kullanamıyorum?",
          "steps": [
            "JSX'teki `{}` yuvaları **ifade yuvalarıdır** — basılabilir bir değere (metin, sayı, JSX, dizi, `null`, `undefined`, `false`) dönüşen JavaScript beklerler. `if` deyimi bir değer üretmez — hangi kodun çalışacağını yönetir. Bu yüzden burada söz dizimsel olarak geçersizdir.",
            "Üçlü operatör bir ifadedir — `<Profile />` veya `null` değerine dönüşür. React `null`, `undefined` ve `false` değerlerini hiçbir şey olarak basar (DOM çıktısı üretmezler), bu da hiçbir şey basmak istemediğiniz \"değilse\" dalı için onları mükemmel yedek değerler yapar."
          ]
        },
        {
          "title": "Ekrana 0 basan '0 &&' tuzağı",
          "steps": [
            "JavaScript'in `&&` operatörü işlenenlerinden birini döndürür, illa bir mantıksal değer değil. `0 && <Badge />` ifadesi `0` değerine dönüşür, çünkü `0` yanlışsıdır — `&&` kısa devre yapıp sol tarafı döndürür. React `0` sayısını alır ve onu bir metin düğümü olarak basar. Sayfada başıboş bir `0` belirir.",
            "`unreadCount > 0` her zaman `true` veya `false` üreten bir karşılaştırmadır. `false && <Badge />` ifadesi `false` değerine dönüşür ve React bunu hiçbir şey olarak basar. Artık koşul, `0` dahil her sayısal değer için güvenlidir."
          ]
        },
        {
          "title": "React'te `&&` mi üçlü operatör mü?",
          "steps": [
            "Yalnızca \"göster ya da hiçbir şey\" davranışına ihtiyacınız varsa `&&` en kısa söz dizimidir. Ama sol tarafın mantıksal bir değer olduğundan ya da açıkça dönüştürüldüğünden (`> 0`, `Boolean()` veya `!!` ile) her zaman emin olun.",
            "Üçlü operatör her iki dalı da açık ve okunabilir kılar. Birden çok koşullu karmaşık mantık için, bileşenin tepesinde erken bir `return` genellikle derin iç içe bir üçlü operatörden daha temizdir — koşullu ifade yerine bir koruma cümlesi gibi okunur."
          ]
        }
      ]
    },
    "js-promises": {
      "title": "Promise'ler ve async/await",
      "content": "\n# Promise'ler ve async/await\n\n### Bu nedir?\nBir **Promise**, eşzamansız bir işlemin nihai sonucunu temsil eder — ya *beklemede*, ya *yerine getirilmiş* (bir değerle) ya da *reddedilmiş*tir (bir hatayla). **`async/await`** ise Promise'ler üzerine kurulmuş, eşzamansız kodu eşzamanlı ve okunabilir bir biçimde yazmanızı sağlayan bir söz dizimi kolaylığıdır.\n\n> 💡 **Zihinsel Model:** Bir Promise'i restoran masası çağrı cihazı gibi düşünün. Sipariş verdiğinizde bir cihaz alırsınız (Promise). Mutfak çalışıyordur (beklemede). İş bitince cihaz öter (yerine getirilir) ve yemeğinizi alırsınız (çözümlenen değer). Bir şey yanarsa (reddedilir) yine haberdar edilirsiniz. Bu arada tezgâhın önünde donmuş beklemezsiniz — oturur başka şeyler yaparsınız (ana iş parçacığı çalışmaya devam eder).\n\n### JavaScript neden böyle çalışıyor?\nJavaScript tek iş parçacığında çalışır. Bir ağ isteği 2 saniye sürüp iş parçacığını bloke etseydi, tüm arayüz donardı — tıklama yok, animasyon yok, hiçbir şey yok. **Olay döngüsü**, eşzamansız işlemlerin iş parçacığının dışında gerçekleşmesine izin verir. Promise'ler, \"bu işlem bitince sırada şu var\" demenin bloke etmeyen, yapılandırılmış bir yolunu sunar.\n\n### Nasıl?\n1. Bir fonksiyonu `async` olarak işaretleyin — artık içinde `await` kullanabilir.\n2. Promise döndüren her çağrının önüne `await` koyun — yürütme, Promise çözümlenene kadar *yalnızca o fonksiyonun içinde* duraklar (tüm uygulamada değil).\n3. Hataları ele almak için her zaman `try/catch` kullanın veya `.catch()` zincirleyin.\n\n### 🔗 React Bağlantısı — Kritik Kural\n**`useEffect` geri çağırımları `async` olamaz.** Bu, React'in en kafa karıştırıcı kurallarından biridir. Sebebi şu:\n\n`useEffect`, geri çağırımından ya `undefined` ya da bir **temizleme fonksiyonu** döndürmesini bekler. `async` bir fonksiyon *her zaman bir Promise döndürür* — temizleme fonksiyonu değil. Effect geri çağırımını `async` yaparsanız, React `undefined` veya fonksiyon beklediği yerde bir Promise alır ve temizleme hiçbir zaman doğru çalışmaz.\n\n```javascript\n// ❌ YANLIŞ: async effect geri çağırımı bir Promise döndürür\nuseEffect(async () => {\n  const data = await fetchData();\n  setData(data);\n}, []);\n\n// ✅ DOĞRU: içteki async fonksiyon geri çağırımı eşzamanlı tutar\nuseEffect(() => {\n  async function loadData() {\n    const data = await fetchData();\n    setData(data);\n  }\n  loadData();\n}, []);\n```\nReact kod tabanlarında bu deseni sürekli görmenizin sebebi budur.\n\n### Söz Dizimi\n```javascript\n// Eski .then() zinciri\nfetch(url)\n  .then(response => response.json())\n  .then(data => console.log(data));\n\n// Modern async/await\nasync function getData() {\n  const response = await fetch(url);\n  const data = await response.json();\n  console.log(data);\n}\n```\n\n### Challenge\n**Challenge:** `loadTodo` fonksiyonu eski `.then()` zincirini kullanıyor. Hem `fetch()` hem de `.json()` çağrısında açık `await` kullanarak `async/await` biçimine dönüştürün.\n\n### Hints\n* `function loadTodo()` önüne `async` ekleyin.\n* `.then(res => res.json()).then(data => ...)` zincirini iki ayrı `await` satırıyla değiştirin.\n* `await` iki kez gerekir: biri ağ yanıtı için, biri JSON'ı ayrıştırmak için (ikisi de eşzamansız işlemdir).\n\n**Solution:**\nPromise zincirini döndürün veya `try`/`catch` içinde `async`/`await` kullanın. Reddedilen durumu açıkça ele alın ve unutmayın: `await` eşzamansız fonksiyonu duraklatır — tarayıcı iş parçacığını bloke etmez.\n\n### Example\n```js\nfunction fetchMessage() {\n  return new Promise(resolve => {\n    setTimeout(() => resolve('Hello from the server!'), 1000);\n  });\n}\n\nasync function start() {\n  console.log('Asking...');\n  const message = await fetchMessage();\n  console.log(message);\n}\n\nstart();\n```\n",
      "exampleWalkthrough": {
        "steps": [
          "Bir **Promise**, henüz hazır olmayan bir değeri temsil eden nesnedir. `resolve(...)` çağırmak, \"artık hazır, işte burada\" demenin yoludur.\n\nBuradaki Promise yavaş bir ağ isteğini temsil ediyor: bir saniye sonra çözümleniyor.",
          "`await`, Promise çözümlenene kadar bu fonksiyonu duraklatır ve sonra değeri teslim eder. Bir fonksiyon `await` kullanabilmek için `async` olarak işaretlenmiş olmalıdır — duraklamayı yasal kılan anahtar kelime budur.\n\nBeklerken sayfadaki başka hiçbir şey bloke olmaz; yalnızca bu fonksiyon askıya alınır.",
          "`start()` çağrılıyor ve iki günlük satırı bir saniye arayla görünüyor — önce anında `Asking...`, sonra mesaj.\n\nBu ders yalnızca editörü gösteriyor: sonradan gelen bir değerin saklanacak ve yeniden gösterilecek bir yere ihtiyacı var; bu da Temeller modülünde tanışacağınız state'tir."
        ]
      },
      "walkthrough": {
        "steps": [
          "Fonksiyon `async` olarak işaretlendi; içinde `await` kullanılmasına izin veren ve otomatik olarak bir Promise döndürmesini sağlayan şey budur.",
          "Her `.then(...)` bir `await` ve sıradan bir değişkene dönüşüyor. `fetch` bir yanıta çözümlenir, `res.json()` ise başka bir Promise döndürür — özgün kodun iki `.then` çağrısına, bunun da iki `await` satırına ihtiyaç duymasının sebebi budur.",
          "Sonuç, diğer her şeyle aynı girintide, sıradan bir satırda kullanılıyor.\n\nİki sürüm aynı işi yapar. `await` size esas olarak sıradan akış denetimini geri kazandırır: `try/catch`, `if` ve döngüler yeniden normal davranır — iç içe `.then` geri çağırımlarının zorlaştırdığı şey tam olarak budur."
        ]
      },
      "insights": [
        {
          "title": "`useEffect` geri çağırımları neden `async` olamaz?",
          "steps": [
            "React, `useEffect` geri çağırımınızın dönüş değerini bir **temizleme fonksiyonu** olarak kullanır — bileşen kaldırıldığında veya effect yeniden çalıştığında onu çağırır. `async` bir fonksiyon *her zaman bir Promise döndürür*, asla düz bir fonksiyon değil. Yani React, `undefined` veya temizleme fonksiyonu beklediği yerde bir Promise alır.",
            "Çözüm: içeride bir `async` fonksiyon tanımlayıp hemen çağırın. Dıştaki geri çağırım eşzamanlı kalır (hiçbir şey döndürmez) ve React'in beklentisini karşılar. İçteki async fonksiyon işi yapar. Temizlemeye ihtiyacınız varsa, bileşen kaldırıldıktan sonra `setUser` çağrılmasını önlemek için bir bayrak ya da `AbortController` ekleyin (yaygın bir yarış durumu)."
          ]
        },
        {
          "title": "Yarış durumları: React'te eşzamansız veri çekmenin sessiz tehlikesi",
          "steps": [
            "`userId` hızla değişirse (kullanıcı profiller arasında hızlıca gezinirse) aynı anda birden çok istek yola çıkar. En yavaş olan, daha yenisinden *sonra* dönebilir ve bayat veriyi güncel kullanıcı olarak yazabilir. Buna **yarış durumu** denir ve görünmezdir — hata yok, yalnızca ekranda yanlış veri.",
            "Bir iptal bayrağı bunu düzeltir. Temizleme fonksiyonu, bileşen yeni bir `userId` ile yeniden render edildiğinde `cancelled = true` yapar. Bayat istek döndüğünde `if (!cancelled)` kontrolü `setUser` çağrılmasını engeller. Modern alternatif, ağ isteğini gerçekten iptal eden `AbortController`'dır."
          ]
        },
        {
          "title": "`async function` neden her zaman bir Promise döndürür?",
          "steps": [
            "`async` anahtar kelimesi dönüş değerini otomatik olarak `Promise.resolve()` içine sarar. `return 'Hello'` (düz bir metin) yazsanız bile, çağıran taraf `'Hello'` değerine çözümlenen bir Promise alır. Async fonksiyonların dönüş değerine erişmek için `await` veya `.then()` ile çağrılmak zorunda olmalarının sebebi budur.",
            "`await getData()` Promise'i açar ve size ham `'Hello'` metnini verir. async/await deseninin bu kadar temiz olmasının sebebi budur — async fonksiyonların içinde `return value` yazar, dışarıda `await` ile doğrudan okursunuz, sanki eşzamanlıymış gibi."
          ]
        }
      ]
    }
  }
};
