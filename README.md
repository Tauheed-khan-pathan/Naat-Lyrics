# Naat Lyrics — Phase 1

Professional, halki aur fast static website. Koi heavy framework nahi, koi database server nahi.

Live site (GitHub Pages, repo Settings → Pages me main branch on karne ke baad):
https://tauheed-khan-pathan.github.io/Naat-Lyrics/

## Kya hai isme
- Homepage: top search (title + har line/word, Roman aur Hindi dono me), tabs with counts (Naat / Hamd / Salaam / Noha), language toggle (Roman / Hindi), font size, copy button
- Har lyric ka alag page (`lyric.html?id=...`) — SEO aur share karne ke liye
- Mobile-first design, green/gold theme, keyboard focus styles
- `sitemap.xml` + `robots.txt` — Google ko site samajhne me aasani

## Structure (expert tarika, simple rakha gaya hai)
- `index.html` — homepage: search, tabs, language toggle
- `styles.css` — poora design, mobile-first
- `app.js` — search, tabs filter, language toggle, copy
- `lyrics.json` — saara content, ek hi jagah
- `lyric.html` — har lyric ka alag page
- `sitemap.xml`, `robots.txt` — search engines ke liye

## Add / Update / Delete / Create — kaise?
Lyrics sirf `lyrics.json` me hoti hain. Ek lyric = ek entry:

```json
{
  "id": "mustafa-jaan-e-rehmat",
  "title": "Mustafa Jaan-e-Rehmat",
  "category": "Salaam",
  "poet": "Ala Hazrat",
  "roman": ["line 1", "line 2"],
  "hindi": ["लाइन 1", "लाइन 2"]
}
```

- **Add:** lyrics.json me ek nayi entry jodo, commit karo — site, tabs, counts aur sitemap (nayi entry ke liye sitemap me URL bhi jodo) khud update ho jayenge.
- **Update:** us entry ki lines badlo.
- **Delete:** us entry ko hata do.
- **Create (nayi category):** category naam badlo, tab khud ban jayega.

Tauheed ke liye sabse aasan tareeka: mujhe lyric bhej do, main entry bana kar GitHub me push kar dunga. Ya GitHub website par lyrics.json khol kar Edit kar do — coding nahi chahiye.

## Hosting
GitHub Pages (free). Repo me push hote hi, Settings → Pages → Deploy from a branch → main / (root) select karo, Save karo — kuch minute me site live ho jati hai. Koi backend server nahi, isliye site fast aur sasti rehti hai.

## Phase 1 scope
Search (koi bhi line/word), tabs (Naat / Hamd / Salaam / Noha), language toggle (Roman / Hindi), copy button, mobile-first professional design. Monetization Phase 2 me.
