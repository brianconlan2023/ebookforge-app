# EbookForge

Standalone AI ebook creator + book studio.
https://github.com/brianconlan2023/ebookforge-app

## Studio
Route: `/studio/[id]`
- Front + back cover designer (drag title, subtitle, author)
- Rewrite cover copy and back-cover blurb
- Borders: none / thin / gold / ornate / double frame
- 104 themes (Kindle Modern, Classic, Cosmos, Amour + 20 genres × 5 treatments)
- Interior preview: phone, tablet, Paperwhite
- Drop cap + justified body
- PDF print + Word export

## Kindle Create vs this studio
Kindle Create: 4 locked themes, no cover tool, desktop only, cannot edit tables/lists/footnotes.
EbookForge: 100+ themes, covers in-browser, live type placement, device preview.

## Run
```bash
git clone https://github.com/brianconlan2023/ebookforge-app
cd ebookforge-app
npm install
cp .env.example .env.local
# OPENAI_API_KEY and AUTH_SECRET
npm run dev
```
