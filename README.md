# Obsidian Git — WertC-14 Fork

[Vinzent03/obsidian-git](https://github.com/Vinzent03/obsidian-git) eklentisinin, Source Control panelini GitLens/GitKraken tarzına yaklaştıran bir fork'u: renkli commit graph'ı, Stash/Tag desteği ve sadeleştirilmiş bir toolbar/menü ekler. Vault'undaki değişiklikleri commit/pull/push etmek için gereken temel Git entegrasyonu aynen duruyor, üstüne bu fork'a özgü şu yenilikler var:

- 🌿 **Commit Graph** — branch'ler renkli paralel şeritlerle, merge noktaları doğru birleşerek, tag/branch rozetleriyle gösteriliyor. Hem Source Control panelinin içine gömülü hem ayrı bir History view olarak.
- 📦 **Stash** — değişiklikleri sakla/uygula/geri al/sil, terminale hiç inmeden.
- 🏷️ **Tags** — tag oluştur/sil.
- 🔧 **Sadeleştirilmiş toolbar** — branch adı gösteren bir pill + gruplu bir "..." menüsü (Sync, Branch, Stash, Tags, Remote).
- ⚡ **"Sync Changes" butonu** — commit edilecek bir şey kalmayıp push edilmemiş commit'ler varsa, ana buton otomatik olarak push'u öneriyor (VS Code/GitLens'teki gibi).

> Bu bir fork olduğu için **Obsidian'ın Community Plugins aramasında görünmüyor** — kurulum için aşağıya bak.

## 📦 Kurulum

### BRAT ile (önerilen, güncellemeleri otomatik alır)

1. Community Plugins'ten [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) eklentisini kur.

   ![BRAT'ı Community Plugins'ten kurma](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-1-install.png)

2. BRAT'ın ayarlarını aç → **Add Beta Plugin**.

   ![BRAT ayarlarında Add Beta Plugin butonu](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-2-add-beta-plugin.png)

3. Bu repoyu gir: `WertC-14/obsidian-git`.

   ![BRAT diyalog kutusuna repo adının girilmesi](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-3-enter-repo.png)

4. Kurulum bitince **Settings → Community plugins**'ten "Git"i aç.

   ![Community plugins listesinde Git'i aktif etme](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/brat-4-enable-plugin.png)

### Manuel kurulum

1. Bu reponun [Releases sayfasından](https://github.com/WertC-14/obsidian-git/releases) en son sürümün `main.js`, `manifest.json` ve `styles.css` dosyalarını indir.
2. `<vault-klasörün>/.obsidian/plugins/obsidian-git/` klasörünü oluşturup bu üç dosyayı içine koy.
3. Obsidian'ı yeniden başlat (veya eklentiyi kapat/aç) ve **Settings → Community plugins**'ten "Git"i etkinleştir.

> Orijinal `obsidian-git` eklentisi zaten kuruluysa önce onu kapat/kaldır — ikisi aynı eklenti ID'sini kullanıyor, çakışırlar.

## Ekran Görüntüleri

### Source Control Paneli

Branch pill + "..." menüsüyle sadeleşmiş toolbar, Staged/Changes listeleri (dosya durumları M/U/D olarak renkli gösteriliyor) ve commit mesajı kutusu.

![Source Control Paneli](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/source-view.png)

### Commit Graph

Branch'ler renkli paralel şeritlerle, merge noktaları doğru birleşerek, tag rozeti (`v1.0.0`) ve aktif branch rozetiyle gösteriliyor.

![Commit Graph](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/commit-graph.png)

### Branch Değiştirme

Branch pill'e tıklayınca çıkan hızlı seçim ekranı.

![Branch değiştirme ekranı](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/switch-branch.png)

### Diff View

Bir dosyadaki değişiklikleri yan yana karşılaştırma.

![Diff View örneği](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/diff-view-demo.png)

### Stash & Tags Menüsü

"..." menüsünden stash ve tag işlemleri.

![Stash ve Tags menüsü](https://raw.githubusercontent.com/WertC-14/obsidian-git/master/images/stash-tags-menu.png)

## Diğer Her Şey İçin

Commit/pull/push, otomatik yedekleme, satır bazlı imzalar (signs), diff view, submodule desteği gibi bu fork'ta değişmeyen tüm özellikler ve ayarlar için orijinal projenin 📖 [tam dokümantasyonuna](https://publish.obsidian.md/git-doc) bakabilirsin — bu fork sadece Source Control panelinin görünümünü/işlevini genişletiyor, alttaki git entegrasyonu aynı.

> ⚠️ **Mobil kullanıcılar:** Mobildeki git motoru (isomorphic-git) hâlâ **kararsız** — büyük repolarda çökme/donma yaşanabilir. Detaylar için [orijinal projenin mobil bölümüne](https://github.com/Vinzent03/obsidian-git#-mobile-support-%EF%B8%8F--experimental) bak.

## Teşekkür

- Orijinal proje ve alttaki git entegrasyonu [Vinzent03](https://github.com/Vinzent03) tarafından geliştiriliyor (ilk yazan [denolehov](https://github.com/denolehov)).
- Bu fork'taki Source Control paneli reworku (commit graph, Stash/Tags, yeni toolbar/menü) [WertC-14](https://github.com/WertC-14) tarafından yapıldı.
- Geri bildirim/soru için GitHub issues kullanabilirsin.
