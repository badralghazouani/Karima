# Internationalization (i18n) Guide

## Overview

The Karima Course Platform supports multiple languages, currently English (🇬🇧 EN) and French (🇫🇷 FR), with the ability to easily add more languages in the future.

## Features

- **Language Switcher**: Toggle between languages from the header
- **Persistent Selection**: Language preference saved in browser localStorage
- **Comprehensive Translations**: All UI elements, forms, and content translated
- **Easy to Extend**: Simple JSON-based translation files

## How to Use

### For Users

1. **Switch Language**: Click the language buttons in the header (top-right)
   - 🇬🇧 EN - Switch to English
   - 🇫🇷 FR - Switch to French (Passer au français)

2. **Language Persistence**: Your selection is saved automatically
   - Works across sessions
   - Saved in browser localStorage
   - Applies to all pages

### For Developers

#### Adding Translations to Components

Use the `useTranslation` hook in client components:

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('courses.title')}</h1>
      <button>{t('common.save')}</button>
      <p>{t('auth.signIn')}</p>
    </div>
  );
}
```

#### Translation Key Structure

Translations are organized in nested objects:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "courses": {
    "title": "Courses",
    "createCourse": "Create New Course"
  }
}
```

Access them using dot notation: `t('common.save')` → "Save"

## Translation Files

### Location

- English: `/messages/en.json`
- French: `/messages/fr.json`

### Structure

All translation files follow the same structure:

```json
{
  "common": { /* Common UI elements */ },
  "nav": { /* Navigation items */ },
  "auth": { /* Authentication pages */ },
  "courses": { /* Course management */ },
  "lessons": { /* Lesson management */ },
  "exercises": { /* Exercises and quizzes */ },
  "reviews": { /* Review system */ },
  "admin": { /* Admin panel */ },
  "instructor": { /* Instructor dashboard */ },
  "profile": { /* User profile */ }
}
```

## Available Translation Keys

### Common (common.*)

| Key | English | French |
|-----|---------|--------|
| `common.appName` | Karima Course Platform | Plateforme de Cours Karima |
| `common.welcome` | Welcome | Bienvenue |
| `common.login` | Log In | Se connecter |
| `common.signup` | Sign Up | S'inscrire |
| `common.logout` | Sign Out | Se déconnecter |
| `common.save` | Save | Enregistrer |
| `common.cancel` | Cancel | Annuler |
| `common.delete` | Delete | Supprimer |
| `common.edit` | Edit | Modifier |
| `common.view` | View | Voir |
| `common.search` | Search | Rechercher |

### Navigation (nav.*)

| Key | English | French |
|-----|---------|--------|
| `nav.home` | Home | Accueil |
| `nav.courses` | Courses | Cours |
| `nav.myLearning` | My Learning | Mon Apprentissage |
| `nav.teach` | Teach | Enseigner |
| `nav.adminPanel` | Admin Panel | Panneau Admin |
| `nav.profile` | Profile | Profil |

### Authentication (auth.*)

| Key | English | French |
|-----|---------|--------|
| `auth.signIn` | Sign in to your account | Connectez-vous à votre compte |
| `auth.signUp` | Create a new account | Créer un nouveau compte |
| `auth.emailAddress` | Email address | Adresse email |
| `auth.yourPassword` | Your password | Votre mot de passe |
| `auth.student` | Student | Étudiant |
| `auth.instructor` | Instructor | Instructeur |

### Courses (courses.*)

| Key | English | French |
|-----|---------|--------|
| `courses.title` | Courses | Cours |
| `courses.allCourses` | All Courses | Tous les cours |
| `courses.createCourse` | Create New Course | Créer un nouveau cours |
| `courses.courseTitle` | Course Title | Titre du cours |
| `courses.price` | Price | Prix |
| `courses.level` | Level | Niveau |
| `courses.beginner` | Beginner | Débutant |
| `courses.intermediate` | Intermediate | Intermédiaire |
| `courses.advanced` | Advanced | Avancé |
| `courses.free` | Free | Gratuit |
| `courses.enroll` | Enroll | S'inscrire |
| `courses.buyNow` | Buy Now | Acheter maintenant |

### Exercises (exercises.*)

| Key | English | French |
|-----|---------|--------|
| `exercises.title` | Exercises & Quizzes | Exercices & Quiz |
| `exercises.addExercise` | Add Exercise | Ajouter un exercice |
| `exercises.question` | Question | Question |
| `exercises.multipleChoice` | Multiple Choice | Choix multiples |
| `exercises.textAnswer` | Text Answer | Réponse textuelle |
| `exercises.submitAnswer` | Submit Answer | Soumettre la réponse |
| `exercises.correct` | Correct | Correct |
| `exercises.incorrect` | Incorrect | Incorrect |
| `exercises.score` | Score | Score |

### Reviews (reviews.*)

| Key | English | French |
|-----|---------|--------|
| `reviews.title` | Student Reviews | Avis des étudiants |
| `reviews.writeReview` | Write a Review | Écrire un avis |
| `reviews.yourRating` | Your Rating | Votre note |
| `reviews.submitReview` | Submit Review | Soumettre l'avis |
| `reviews.averageRating` | Average Rating | Note moyenne |

### Admin (admin.*)

| Key | English | French |
|-----|---------|--------|
| `admin.dashboard` | Admin Dashboard | Tableau de bord Admin |
| `admin.users` | Users | Utilisateurs |
| `admin.categories` | Categories | Catégories |
| `admin.payments` | Payments | Paiements |
| `admin.userManagement` | User Management | Gestion des utilisateurs |
| `admin.categoryManagement` | Category Management | Gestion des catégories |

*See `/messages/en.json` and `/messages/fr.json` for complete lists*

## Adding a New Language

### Step 1: Create Translation File

Create a new file in `/messages/` directory:

```bash
# Example: Adding Spanish
touch messages/es.json
```

### Step 2: Copy and Translate

Copy the structure from `en.json` and translate all values:

```json
{
  "common": {
    "appName": "Plataforma de Cursos Karima",
    "welcome": "Bienvenido",
    "login": "Iniciar Sesión",
    ...
  },
  ...
}
```

### Step 3: Update Locale Configuration

Update `/lib/i18n.ts`:

```typescript
// Before
export const locales: Locale[] = ['en', 'fr'];

// After
export const locales: Locale[] = ['en', 'fr', 'es'];

// Add to messages object
const messages = {
  en: enMessages,
  fr: frMessages,
  es: esMessages, // Import from messages/es.json
};
```

### Step 4: Update Language Switcher

Update `/components/language-switcher.tsx` to add the new button:

```tsx
<button
  onClick={() => handleLanguageChange('es')}
  className={...}
>
  🇪🇸 ES
</button>
```

### Step 5: Test

1. Start the development server
2. Click the new language button
3. Verify all translations appear correctly
4. Check all pages and components

## Implementation Details

### How It Works

1. **Language Selection**:
   - User clicks language button in header
   - `setLocale()` saves preference to localStorage
   - Page reloads to apply new language

2. **Translation Loading**:
   - `getLocale()` reads saved preference from localStorage
   - `getMessages()` loads appropriate JSON file
   - `useTranslation()` hook provides `t()` function

3. **Translation Rendering**:
   - Components call `t('key.path')`
   - Hook looks up value in messages object
   - Returns translated string or key if not found

### File Structure

```
/messages/
  ├── en.json          # English translations
  └── fr.json          # French translations

/lib/
  └── i18n.ts          # i18n utilities

/hooks/
  └── useTranslation.ts # Translation hook

/components/
  └── language-switcher.tsx # Language toggle UI
```

### LocalStorage Key

Language preference is stored as:
- **Key**: `locale`
- **Values**: `en`, `fr`, etc.
- **Scope**: Per browser/device

## Best Practices

### 1. Use Semantic Keys

✅ Good:
```tsx
t('courses.createCourse')
t('exercises.submitAnswer')
t('admin.userManagement')
```

❌ Bad:
```tsx
t('button1')
t('text123')
t('page.title')
```

### 2. Keep Keys Consistent

Both language files should have identical keys:

```json
// en.json
{
  "courses": {
    "title": "Courses"
  }
}

// fr.json
{
  "courses": {
    "title": "Cours"
  }
}
```

### 3. Provide Context

Use descriptive namespaces:

```json
{
  "auth.login": "Log In",        // Auth page login button
  "nav.login": "Sign In",        // Header navigation link
  "common.login": "Login"        // Generic login term
}
```

### 4. Handle Pluralization

For dynamic counts, include singular/plural forms:

```json
{
  "courses.studentCount": "{count} student",
  "courses.studentCountPlural": "{count} students"
}
```

Then in code:
```tsx
const count = 5;
const key = count === 1 ? 'courses.studentCount' : 'courses.studentCountPlural';
t(key).replace('{count}', count.toString());
```

### 5. Test All Languages

Always test that:
- All keys exist in all language files
- Translations make sense in context
- UI doesn't break with longer translations (e.g., German)
- Special characters display correctly

## Troubleshooting

### Translation Not Appearing

**Problem**: Shows key instead of translated text (e.g., "courses.title")

**Solutions**:
1. Check if key exists in JSON file
2. Verify correct dot notation
3. Check for typos in key name
4. Ensure JSON file is valid (no trailing commas)

### Language Not Switching

**Problem**: Clicking language button doesn't change language

**Solutions**:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Clear browser cache and localStorage
4. Check that page reloads after clicking

### Missing Translations

**Problem**: Some text remains in English when French is selected

**Solutions**:
1. Check if key exists in `fr.json`
2. Ensure component uses `t()` function
3. Verify component is client component ('use client')
4. Check import of `useTranslation` hook

## Examples

### Example 1: Simple Button

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

export function SaveButton() {
  const { t } = useTranslation();

  return (
    <Button>
      {t('common.save')}
    </Button>
  );
}
```

### Example 2: Form Labels

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function LoginForm() {
  const { t } = useTranslation();

  return (
    <form>
      <label>{t('auth.emailAddress')}</label>
      <input type="email" placeholder={t('auth.emailAddress')} />

      <label>{t('auth.yourPassword')}</label>
      <input type="password" placeholder={t('auth.yourPassword')} />

      <button type="submit">{t('auth.signIn')}</button>
    </form>
  );
}
```

### Example 3: Dynamic Content

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function CourseStats({ courseCount }: { courseCount: number }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('courses.allCourses')}</h2>
      <p>{courseCount} {t('courses.title').toLowerCase()}</p>
    </div>
  );
}
```

## Future Enhancements

### Potential Improvements

1. **Right-to-Left (RTL) Support**:
   - Add Arabic, Hebrew, etc.
   - Implement RTL CSS

2. **Interpolation**:
   - Support variables in translations
   - Example: `"Hello {name}"`

3. **Pluralization**:
   - Automatic plural handling
   - Language-specific rules

4. **Date/Number Formatting**:
   - Locale-specific formatting
   - Currency conversion

5. **Server-Side Rendering**:
   - Load translations on server
   - Better SEO for multilingual content

6. **Translation Management**:
   - Admin UI to edit translations
   - Import/export translation files
   - Translation versioning

## Resources

- [Translation Files](/messages/)
- [i18n Utilities](/lib/i18n.ts)
- [Translation Hook](/hooks/useTranslation.ts)
- [Language Switcher](/components/language-switcher.tsx)

---

**Supported Languages**: English 🇬🇧, French 🇫🇷
**Default Language**: English
**Version**: 1.0.0
**Last Updated**: November 2024
