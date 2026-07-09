# Yeni Özellikler ve Değişiklikler — Özet

Bu dosya, `WertC-14/obsidian-git` fork'unda Source Control paneline yapılan
kapsamlı UI/özellik güncellemesinin genel özeti. Her bölümde ne değiştiği
anlatılıyor ve **fotoğraf konulması gereken yerler işaretli** — o kısımları
sen araştırıp uygun ekran görüntüsüyle doldurabilirsin.

Fotoğraf placeholder'ları şu formatta:
```
📸 [FOTOĞRAF BURAYA: ...ne çekilmesi gerektiğinin açıklaması...]
```

## README'de Kullanılan Dosya Adları

README.md zaten şu dosya adlarına referans veriyor (`images/` klasörüne bu
isimlerle kaydedersen otomatik bağlanır, README'de başka bir şey
değiştirmene gerek kalmaz):

| Dosya adı | Neyi gösterecek | Durum |
|---|---|---|
| `images/source-view.png` | Source Control paneli (Staged/Changes, commit kutusu) | ✅ eklendi |
| `images/commit-graph.png` | Renkli dallı commit graph, tag rozeti, merge | ✅ eklendi |
| `images/switch-branch.png` | Branch pill'e tıklayınca çıkan "Select branch to checkout" ekranı | ✅ eklendi |
| `images/diff-view-demo.png` | Bir dosyanın diff/karşılaştırma ekranı | ✅ eklendi |
| `images/stash-tags-menu.png` | "..." menüsünün tamamı (Sync/Branch/Stash/Tags/Remote grupları) | ✅ eklendi |
| `images/brat-1-install.png` | Obsidian Community Plugins aramasında BRAT eklentisinin bulunup "Install" butonuna basılacağı an | ✅ eklendi |
| `images/brat-2-add-beta-plugin.png` | BRAT'ın kendi ayarlar sayfası, "Add Beta Plugin" butonu görünecek şekilde | ✅ eklendi |
| `images/brat-3-enter-repo.png` | "Add Beta Plugin" tıklanınca açılan diyalog kutusu — `WertC-14/obsidian-git` yazılmış/yazılacak alan görünecek şekilde | ✅ eklendi |
| `images/brat-4-enable-plugin.png` | BRAT kurulumu bitince Settings → Community plugins listesinde "Git" eklentisinin göründüğü ve aç/kapa (toggle) düğmesinin bulunduğu an | ⏳ bekliyor |

Kalan 1 tanesi için de aynı şekilde ekran görüntüsü paylaşman yeterli,
ben `images/` klasörüne kaydedip README'ye bağlarım.

README artık orijinal projenin History View / Signs ekran görüntülerini
içermiyor (`images/history-view.png`, `images/signs.png`, eski
`images/diff-view.png` hâlâ repoda duruyorlar ama README bunlara
referans vermiyor, yeni `diff-view-demo.png` kullanılıyor) — README
artık sadece bu fork'a özgü şeyleri gösteriyor, değişmeyen özellikler
için orijinal dokümantasyona link veriyor.

## Test Vault'ta Hazırladığım Örnek Veri (Screenshot İçin)

Test vault'un git reposu (`Git-Deneme`, `~/Documents/Obsidian Vault - 1/Git-Deneme`
altında) boş/sıkıcı görünmesin diye şu örnek durumu kurdum — Obsidian'ı açıp
Source Control panelini açtığında şunları göreceksin:

- **Staged Changes** (2 dosya):
  - `main-only-note.md` — değiştirilmiş (M)
  - `Tarifler/Elmalı Kek.md` — değiştirilmiş (M)
- **Changes** (3 dosya, henüz stage edilmemiş):
  - `Deneme - 1.md` — değiştirilmiş (M)
  - `Silinecek Not.md` — silinmiş (D)
  - `Tarifler/5 Dakikalık Tarifler/Çikolatalı Puding.md` — yeni/untracked (U),
    **iki seviye iç içe klasör** altında — tree görünümünde klasör
    açılıp kapanmasını göstermek için
- **1 stash**: `"Ekran görüntüsü için örnek stash"` (`graph-test-note.md`
  dosyasındaki ayrı bir değişiklik) — "..." menüsünden Apply/Pop/Drop
  stash açtığında listede bu görünecek.
- **1 tag**: `v1.0.0` (`"Demo release for screenshots"` mesajıyla,
  annotated), en tepedeki commit'te — hem Tags menüsündeki silme
  listesinde hem Graph'ta o commit'in yanında rozet olarak görünecek.
- **Graph**: `main` branch'inin tepesine, eski test isimli commit'lerin
  ("araba", "sdafsaf" gibi) üstüne 4 tane düzgün/profesyonel isimli commit
  ekledim (`docs: proje açıklaması güncellendi`, `feat: lazanya tarifi
  eklendi`, `feat: haftalık plan şablonu eklendi`, `fix: lazanya tarifine
  ek not eklendi`) — graph'ın en üstü artık gerçek bir proje gibi görünüyor.
  Eski test commit'leri hâlâ altta duruyor ama ekran görüntüsünde
  scroll etmeden görünmeyecekler. `main` ve `test-graph-feature`
  branch'lerinin birleştiği (merge) nokta da daha aşağıda hâlâ duruyor,
  Graph'ın branch/merge kısmını göstermek istersen biraz aşağı kaydırman
  gerekebilir.

Bu veriler gerçek notların değil, sırf ekran görüntüsü için uydurma
içerik. Çekimler bitince temizlemek istersen:
```
git tag -d v1.0.0
git stash drop
git checkout -- "main-only-note.md"
git rm --cached "Tarifler/Elmalı Kek.md" && rm -rf Tarifler
git checkout -- "Deneme - 1.md" "Silinecek Not.md"
```
(Son iki dosya `git checkout --` ile HEAD'deki haline döner; silinmiş
gösterilen `Silinecek Not.md` da böylece geri gelir.)

---

## 1. Toolbar Sadeleştirme

Eskiden Source Control panelinin üstünde 8 tane etiketsiz ikon yan yana
duruyordu (commit-and-sync, commit, stage all, unstage all, push, pull,
layout değiştir, refresh) ve ne işe yaradıkları anlaşılmıyordu.

**Yeni davranış:**
- Sol tarafta aktif branch adını gösteren tıklanabilir bir pill (rozet) —
  tıklanınca branch değiştirme ekranı açılıyor.
- Sağ tarafta sadece 3 öğe: **Refresh**, **Push** (push edilmemiş commit
  sayısını gösteren rozetle), ve **"..."** (more actions) menüsü.
- Diğer her şey (Commit & Sync, Pull, Stage/Unstage all, Discard all,
  Tree/List görünüm) "..." menüsünün içine taşındı.

📸 [FOTOĞRAF BURAYA: Sadeleşmiş toolbar'ın tam hali — branch pill + 3 ikon
görünecek şekilde Source Control panelinin en üstü]

---

## 2. Commit Graph (Renkli Dallı Görünüm)

History paneli artık düz bir liste değil, GitLens/GitKraken tarzı bir
**commit graph**. Birden fazla local branch aynı anda renkli paralel
çizgilerle gösteriliyor, merge noktalarında çizgiler birleşiyor, HEAD özel
işaretli (dolgu yerine halka).

**Nerede kullanılabilir:**
- Ayrı **History View**'de (`Open history view` komutu).
- Source Control panelinin içine gömülü, katlanabilir bir **Graph** bölümü
  olarak (Changes'in altında).

**Özellikler:**
- Her branch kendi renginde bir "lane" (dikey şerit) alıyor, merge/diverge
  noktaları doğru çizgilerle birleşiyor.
- Local branch'ler ve tag'ler commit noktasının yanında küçük renkli
  rozetlerle gösteriliyor.
- HEAD commit'i dolgu yerine halka (ring) olarak çiziliyor.
- Sayfalama: ilk yüklemede 100 commit (mobilde 40), altta "Load more" butonu.
- Bir satırın altını açınca (chevron'a tıklayınca) değişen dosyalar listesi
  görünüyor, graph çizgisi bu genişleyen alana kadar kesintisiz uzuyor.
- En üstte, varsa staged/unstaged değişiklikleri gösteren ayrı bir
  "Uncommitted changes" satırı var (sadece History View'de).

📸 [FOTOĞRAF BURAYA: En az 2 farklı branch'in birleştiği (merge) bir noktayı
gösteren graph görünümü — renkli çizgiler, branch rozetleri ve HEAD halkası
net görünecek şekilde]

📸 [FOTOĞRAF BURAYA: Bir commit satırının altı açılmış, değişen dosyalar
listeleniyor, graph çizgisinin genişleyen satıra kadar kesintisiz uzadığı
görülüyor]

---

## 3. Değişiklikler (Changes) Bölümü — Responsive Boyutlandırma

Eskiden Changes bölümü boşken bile aynı yer kaplıyordu ya da tam tersi hiç
büyümüyordu. Şimdi:

- Bölüm, ekran/pencere yüksekliğine göre otomatik ayarlanan bir aralıkta
  (`clamp(240px, %55 ekran yüksekliği, 750px)`) büyüyor.
- Staged Changes / Changes bölümleri **kapatıldığında** Graph bölümü
  otomatik olarak yukarı kayıp boşalan alanı dolduruyor; **açıldığında**
  tekrar aşağı iniyor.
- "Staged Changes" başlığı, hiç staged dosya yokken tamamen gizleniyor
  (GitLens'teki gibi).

📸 [FOTOĞRAF BURAYA: Changes bölümü kapalıyken Graph'ın yukarı çıktığı hal
ile Changes açıkken Graph'ın aşağı indiği hali yan yana veya art arda]

---

## 4. Commit Mesajı Kutusu ve "Sync Changes" Butonu

- Commit mesajı kutusu artık otomatik yedekleme şablonunu (`vault backup:
  {{date}}` gibi) gerçek metin olarak önceden doldurmuyor — GitLens'teki
  gibi `Message (Ctrl+Enter to commit on "branch-adı")` şeklinde bir
  placeholder gösteriyor. Boş bırakılırsa commit sırasında yine ayarlardaki
  varsayılan şablon kullanılıyor.
- Commit edilecek bir şey kalmayıp push edilmemiş commit(ler) varsa, ana
  buton otomatik olarak **"Sync Changes N↑"** haline dönüşüp tıklanınca push
  işlemini tetikliyor (VS Code/GitLens'teki "Sync Changes" davranışı).

📸 [FOTOĞRAF BURAYA: Commit mesajı kutusunun placeholder haliyle boş
görünümü]

📸 [FOTOĞRAF BURAYA: "Sync Changes N↑" butonunun göründüğü an — bir commit
yapılmış, push edilmemiş commit sayısı butonda görünüyor]

---

## 5. Stash Desteği (Yepyeni Özellik)

Git'in "stash" (değişiklikleri geçici saklama) özelliği artık plugin
içinden kullanılabiliyor — hem masaüstünde hem mobilde çalışıyor.

**"..." menüsünden erişilebilen aksiyonlar:**
- **Stash changes...** — mevcut değişiklikleri saklar, isteğe bağlı mesaj
  girilebilir (masaüstünde ayrıca "untracked dosyaları da dahil et"
  seçeneği var).
- **Apply stash...** — seçilen stash'i uygular, stash listede kalır.
- **Pop stash...** — seçilen stash'i uygular ve listeden kaldırır.
- **Drop stash...** — seçilen stash'i onay alarak kalıcı siler.

Komut paletinden de aynı aksiyonlara erişilebiliyor (`Stash changes`, `Pop
stash`, `Apply stash`, `Drop stash`).

**Mobil not:** isomorphic-git (mobil motor) stash'in bazı sınırlamaları var
(paketlenmiş objeleri stashlemiyor, apply/pop çakışan değişiklikleri
sessizce ezebiliyor) — bu yüzden mobilde stash menüsünü ilk açtığında bir
kerelik uyarı bildirimi çıkıyor.

📸 [FOTOĞRAF BURAYA: "..." menüsünde Stash grubunun açık hali — Stash
changes / Apply / Pop / Drop seçenekleri görünecek şekilde]

📸 [FOTOĞRAF BURAYA: "Stash changes..." tıklandığında çıkan mesaj girme
ekranı]

📸 [FOTOĞRAF BURAYA: Birden fazla stash varken "Apply stash..." veya "Drop
stash..." tıklandığında çıkan seçim listesi]

---

## 6. Tags Desteği (Yepyeni Özellik)

Git tag oluşturma/silme artık plugin içinden yapılabiliyor.

**"..." menüsünden erişilebilen aksiyonlar:**
- **Create tag...** — tag adı ve isteğe bağlı mesaj sorar (mesaj girilirse
  annotated tag, boş bırakılırsa lightweight tag oluşur).
- **Delete tag...** — mevcut tag'ler arasından seçip siler.

Oluşturulan tag'ler commit graph'ta ilgili commit'in yanında ayırt edici
bir rozetle (branch rozetlerinden farklı, çerçeveli stil) gösteriliyor.

Not: Tag'ler şimdilik sadece lokal kalıyor, otomatik olarak uzak sunucuya
(remote) push edilmiyor — bilinçli bir kapsam kararı.

📸 [FOTOĞRAF BURAYA: "Create tag..." akışı — isim/mesaj girme ekranları]

📸 [FOTOĞRAF BURAYA: Graph'ta bir commit'in yanında tag rozetinin göründüğü
hal — branch rozetinden görsel olarak ayırt edilebilmeli]

---

## 7. Yeniden Düzenlenmiş "..." Menüsü

VS Code/GitLens'in Git menüsüne benzer şekilde, "..." menüsü artık gruplu:

- **Sync**: Commit and sync / Pull / Push / Fetch
- **Working tree**: Stage all / Unstage all / Discard all
- **Branch**: Switch branch / Switch to remote branch / Create branch /
  Delete branch
- **Stash**: Stash changes / Apply / Pop / Drop
- **Tags**: Create tag / Delete tag
- **Remote**: Edit remotes / Remove remote / Clone repository
- **View**: Tree/List görünüm değiştir

(Not: Obsidian'ın resmi menü API'sinde VS Code'daki gibi iç içe açılan
alt-menüler desteklenmiyor, bu yüzden gruplar kalın başlıklarla ayrılan tek
düzey bir liste olarak tasarlandı.)

📸 [FOTOĞRAF BURAYA: "..." menüsünün tamamının açık hali, tüm grupları
gösterecek şekilde — gerekirse birden fazla ekran görüntüsü/scroll ile]

---

## 8. Bilinen Sınırlamalar / İleride Yapılabilecekler

- Stash pop/apply sırasında çakışma (conflict) çıkarsa, plugin'in diğer
  yerlerdeki gibi rehberli "conflict resolution" akışına bağlanmıyor, genel
  bir hata mesajı gösteriyor.
- Mobil motorda (isomorphic-git) commit graph sıralaması saat damgasına
  göre yapılıyor, native git'teki gibi tam topological sıralama değil —
  çok nadir durumlarda (saat senkronizasyon sorunu vb.) graph çizgilerinde
  ufak görsel tutarsızlığa yol açabilir.
- Tag'ler için otomatik push seçeneği yok (bilinçli kapsam dışı bırakıldı).

---

## Referans Dosyalar

- Bölüm 1-2'nin orijinal görev tanımı: `claude-code-prompt-source-control-graph.md`
- Önceki oturum notları: `docs/dev/session-summary-commit-graph.md`
