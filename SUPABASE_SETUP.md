# Supabase Setup Guide

## 1. Vytvoř Supabase projekt

1. Jdi na [supabase.com](https://supabase.com)
2. Přihlás se nebo vytvoř účet
3. Klikni "New Project"
4. Vyplň:
   - **Project Name**: `taskmaster`
   - **Database Password**: Vymysli silné heslo
   - **Region**: EU (Frankfurt) - nejblíž k Česku

## 2. Kopíruj credentials

1. Jdi do **Settings → API** (vlevo v menu)
2. Zkopíruj:
   - **Project URL** → do `.env.local` jako `VITE_SUPABASE_URL`
   - **Anon public key** → do `.env.local` jako `VITE_SUPABASE_ANON_KEY`

Tvůj `.env.local` by měl vypadat takto:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 3. Vytvoř Storage Bucket

1. V Supabase panelu jdi na **Storage** (vlevo)
2. Klikni **Create new bucket**
3. Jméno: `task-attachments`
4. Vyber **Public** (aby šly soubory stahovat veřejně)
5. Klikni **Create bucket**

## 4. Nastav RLS (Row Level Security) pravidla

V Supabase panelu → **Storage** → `task-attachments` → **Policies**

Přidej tato pravidla:
```
- Název: Allow public read
  Operation: SELECT
  Target role: public
  Using: true

- Název: Allow authenticated upload
  Operation: INSERT
  Target role: authenticated
  Using: auth.role() = 'authenticated'
```

## 5. Použij v aplikaci

### Nahrání souboru:
```javascript
import { uploadFile } from '@/lib/storageUtils';

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  const { url, error } = await uploadFile(file, 'task-attachments', 'task-1');
  if (url) {
    console.log('Soubor nahrán:', url);
  }
};
```

### Vymazání souboru:
```javascript
import { deleteFile } from '@/lib/storageUtils';

const handleDelete = async () => {
  const { success } = await deleteFile('task-attachments', 'task-1/file.pdf');
  if (success) console.log('Vymazáno');
};
```

### Výpis souborů v adresáři:
```javascript
import { listFiles } from '@/lib/storageUtils';

const handleList = async () => {
  const { files } = await listFiles('task-attachments', 'task-1');
  console.log('Soubory:', files);
};
```

## 6. Restart dev serveru

```bash
npm run dev
```

Hotovo! 🎉 Aplikace je připravená na Supabase Storage.
