# Localization and Internationalization Guide

## Table of Contents

1. [Overview](#overview)
2. [Supported Languages](#supported-languages)
3. [Technical Implementation](#technical-implementation)
4. [Content Translation](#content-translation)
5. [Cultural Adaptation](#cultural-adaptation)
6. [Regional Compliance](#regional-compliance)
7. [Quality Assurance](#quality-assurance)
8. [Maintenance and Updates](#maintenance-and-updates)

## Overview

This guide outlines the localization and internationalization strategy for the Sebenza Construction Management Platform, ensuring the application can effectively serve diverse markets and user bases across different languages, cultures, and regions.

### Key Objectives

- Support multiple languages and regions
- Adapt to local business practices
- Comply with regional regulations
- Maintain consistent user experience
- Enable scalable content management

## Supported Languages

### Primary Languages

**English (en-US)**
- Primary development language
- Default fallback language
- Complete feature coverage
- US business practices

**Afrikaans (af-ZA)**
- South African market
- Construction industry terminology
- Local regulatory compliance
- Cultural adaptations

**Zulu (zu-ZA)**
- South African indigenous language
- Field worker communication
- Safety instructions
- Basic functionality

### Secondary Languages

**French (fr-FR)**
- International expansion
- West African markets
- Construction terminology
- EU compliance

**Portuguese (pt-BR)**
- Brazilian market
- Construction industry focus
- Local business practices
- Regional compliance

**Spanish (es-ES)**
- European market
- Construction terminology
- EU regulations
- Cultural adaptations

### Language Support Matrix

| Feature | English | Afrikaans | Zulu | French | Portuguese | Spanish |
|---------|---------|-----------|------|--------|------------|---------|
| UI Interface | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Documentation | ✓ | ✓ | ⚬ | ✓ | ⚬ | ⚬ |
| Support | ✓ | ✓ | ⚬ | ✓ | ⚬ | ⚬ |
| Legal Terms | ✓ | ✓ | ⚬ | ✓ | ⚬ | ⚬ |
| Training | ✓ | ✓ | ⚬ | ⚬ | ⚬ | ⚬ |

Legend: ✓ = Full Support, ⚬ = Partial Support

## Technical Implementation

### Framework and Libraries

#### i18next Configuration

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

#### Language Detection

```typescript
interface LanguagePreference {
  userSelected: string | null;
  browserLanguage: string;
  geoLocation: string;
  defaultLanguage: string;
}

function detectLanguage(): string {
  const preferences: LanguagePreference = {
    userSelected: localStorage.getItem('selectedLanguage'),
    browserLanguage: navigator.language,
    geoLocation: getLocationBasedLanguage(),
    defaultLanguage: 'en-US'
  };
  
  return preferences.userSelected || 
         getSupportedLanguage(preferences.browserLanguage) ||
         preferences.geoLocation ||
         preferences.defaultLanguage;
}
```

### File Structure

```
locales/
├── en-US/
│   ├── common.json
│   ├── navigation.json
│   ├── projects.json
│   ├── tasks.json
│   ├── invoices.json
│   └── errors.json
├── af-ZA/
│   ├── common.json
│   ├── navigation.json
│   └── ...
└── zu-ZA/
    ├── common.json
    ├── navigation.json
    └── ...
```

### Translation Keys Structure

```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit"
    },
    "labels": {
      "name": "Name",
      "description": "Description",
      "date": "Date",
      "status": "Status"
    }
  },
  "projects": {
    "title": "Projects",
    "create": "Create Project",
    "status": {
      "planning": "Planning",
      "active": "Active",
      "completed": "Completed",
      "onHold": "On Hold"
    }
  }
}
```

### React Component Usage

```tsx
import { useTranslation } from 'react-i18next';

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useTranslation('projects');
  
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p>{t('status.' + project.status)}</p>
      <button>{t('common:buttons.edit')}</button>
    </div>
  );
}
```

## Content Translation

### Translation Workflow

#### 1. Content Extraction

```bash
# Extract translatable strings
npm run i18n:extract

# Generate translation files
npm run i18n:generate
```

#### 2. Professional Translation

**Translation Services**
- Professional translation agencies
- Native speaker linguists
- Industry-specific terminology
- Quality assurance reviews

**Translation Memory**
- Consistent terminology
- Previous translations
- Cost optimization
- Faster turnaround

#### 3. Quality Control

**Linguistic Review**
- Grammar and syntax
- Cultural appropriateness
- Technical accuracy
- Consistency checks

**Functional Testing**
- UI layout validation
- Text truncation issues
- Character encoding
- Formatting problems

### Construction Industry Terminology

#### English to Afrikaans Translations

| English | Afrikaans | Context |
|---------|-----------|---------|
| Construction | Konstruksie | General |
| Project Manager | Projekbestuurder | Role |
| Blueprint | Bloudruk | Document |
| Foundation | Fondament | Building |
| Contractor | Kontrakteur | Business |
| Estimate | Beraming | Financial |
| Invoice | Faktuur | Financial |
| Safety | Veiligheid | Compliance |

#### English to Zulu Translations

| English | Zulu | Context |
|---------|------|---------|
| Construction | Ukwakha | General |
| Project | Iphrojekthi | General |
| Safety | Ukuphepha | Compliance |
| Worker | Umsebenzi | Personnel |
| Materials | Izinto | Resources |
| Site | Indawo | Location |

### Pluralization Rules

```javascript
// Plural forms configuration
const pluralRules = {
  'en': (n) => n === 1 ? 0 : 1,
  'af': (n) => n === 1 ? 0 : 1,
  'zu': (n) => n === 1 ? 0 : 1,
  'fr': (n) => n <= 1 ? 0 : 1,
  'pt': (n) => n <= 1 ? 0 : 1,
  'es': (n) => n === 1 ? 0 : 1,
};

// Usage in translation files
{
  "item": "{{count}} item",
  "item_plural": "{{count}} items"
}
```

## Cultural Adaptation

### Date and Time Formats

#### Regional Formats

```typescript
const dateFormats = {
  'en-US': 'MM/DD/YYYY',
  'en-GB': 'DD/MM/YYYY',
  'af-ZA': 'YYYY/MM/DD',
  'zu-ZA': 'DD/MM/YYYY',
  'fr-FR': 'DD/MM/YYYY',
  'pt-BR': 'DD/MM/YYYY',
  'es-ES': 'DD/MM/YYYY'
};

const timeFormats = {
  'en-US': '12-hour',
  'en-GB': '24-hour',
  'af-ZA': '24-hour',
  'zu-ZA': '24-hour',
  'fr-FR': '24-hour',
  'pt-BR': '24-hour',
  'es-ES': '24-hour'
};
```

#### Implementation

```typescript
function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function formatCurrency(amount: number, locale: string): string {
  const currencies = {
    'en-US': 'USD',
    'af-ZA': 'ZAR',
    'zu-ZA': 'ZAR',
    'fr-FR': 'EUR',
    'pt-BR': 'BRL',
    'es-ES': 'EUR'
  };
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencies[locale] || 'USD'
  }).format(amount);
}
```

### Business Practices

#### Working Hours

```typescript
const workingHours = {
  'en-US': { start: '08:00', end: '17:00', lunch: '12:00-13:00' },
  'af-ZA': { start: '07:00', end: '16:00', lunch: '12:00-13:00' },
  'zu-ZA': { start: '07:00', end: '16:00', lunch: '12:00-13:00' },
  'fr-FR': { start: '08:00', end: '17:00', lunch: '12:00-14:00' },
  'pt-BR': { start: '08:00', end: '17:00', lunch: '12:00-13:00' },
  'es-ES': { start: '09:00', end: '18:00', lunch: '14:00-15:00' }
};
```

#### Holiday Calendars

```typescript
const holidays = {
  'af-ZA': [
    'New Year\'s Day',
    'Human Rights Day',
    'Freedom Day',
    'Workers\' Day',
    'Youth Day',
    'National Women\'s Day',
    'Heritage Day',
    'Day of Reconciliation',
    'Christmas Day',
    'Day of Goodwill'
  ],
  'en-US': [
    'New Year\'s Day',
    'Martin Luther King Jr. Day',
    'Presidents\' Day',
    'Memorial Day',
    'Independence Day',
    'Labor Day',
    'Columbus Day',
    'Veterans Day',
    'Thanksgiving',
    'Christmas Day'
  ]
};
```

### Color and Design Considerations

#### Cultural Color Meanings

```typescript
const culturalColors = {
  'western': {
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    danger: '#EF4444',  // Red
    info: '#3B82F6'     // Blue
  },
  'south-african': {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    cultural: '#FFB000' // Gold (heritage)
  }
};
```

## Regional Compliance

### Data Protection Laws

#### South Africa (POPIA)

```typescript
interface PopiaCompliance {
  dataMinimization: boolean;
  consentRequired: boolean;
  crossBorderTransfer: 'restricted' | 'allowed';
  dataRetention: number; // days
  dataSubjectRights: string[];
}

const popiaConfig: PopiaCompliance = {
  dataMinimization: true,
  consentRequired: true,
  crossBorderTransfer: 'restricted',
  dataRetention: 365,
  dataSubjectRights: [
    'access',
    'correction',
    'deletion',
    'objection'
  ]
};
```

#### European Union (GDPR)

```typescript
interface GdprCompliance {
  lawfulBasis: string[];
  cookieConsent: boolean;
  dataPortability: boolean;
  rightToForgotten: boolean;
}
```

### Tax and Financial Regulations

#### VAT Configuration

```typescript
const vatRates = {
  'ZA': { rate: 0.15, name: 'VAT' },
  'US': { rate: 0.00, name: 'Sales Tax' }, // varies by state
  'FR': { rate: 0.20, name: 'TVA' },
  'BR': { rate: 0.17, name: 'ICMS' },
  'ES': { rate: 0.21, name: 'IVA' }
};
```

#### Invoice Requirements

```typescript
const invoiceRequirements = {
  'ZA': [
    'VAT registration number',
    'Tax invoice declaration',
    'Supplier details',
    'Customer details',
    'VAT breakdown'
  ],
  'FR': [
    'SIRET number',
    'TVA number',
    'Mention TVA',
    'Invoice sequence number'
  ]
};
```

## Quality Assurance

### Testing Strategy

#### Pseudo-localization

```javascript
// Pseudo-translation for testing
function pseudoTranslate(text) {
  const pseudoChars = {
    'a': 'à', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
    'A': 'À', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú'
  };
  
  return '[' + text.replace(/[aeiouAEIOU]/g, 
    char => pseudoChars[char] || char) + ']';
}
```

#### Automated Testing

```typescript
// Translation key validation
function validateTranslationKeys() {
  const baseLanguage = loadTranslations('en-US');
  const targetLanguages = ['af-ZA', 'zu-ZA', 'fr-FR'];
  
  targetLanguages.forEach(lang => {
    const translations = loadTranslations(lang);
    const missingKeys = findMissingKeys(baseLanguage, translations);
    
    if (missingKeys.length > 0) {
      console.warn(`Missing keys in ${lang}:`, missingKeys);
    }
  });
}
```

### Visual Testing

#### Layout Validation

```css
/* Test for text expansion */
.test-expansion {
  border: 1px solid red;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* RTL layout testing */
[dir="rtl"] .container {
  direction: rtl;
  text-align: right;
}
```

#### Responsive Design

```typescript
const textExpansionFactors = {
  'en': 1.0,   // baseline
  'af': 1.2,   // 20% longer
  'zu': 1.1,   // 10% longer
  'fr': 1.25,  // 25% longer
  'pt': 1.15,  // 15% longer
  'es': 1.2    // 20% longer
};
```

## Maintenance and Updates

### Translation Management

#### Content Management System

```typescript
interface TranslationEntry {
  key: string;
  namespace: string;
  sourceText: string;
  translations: Record<string, string>;
  status: 'pending' | 'translated' | 'reviewed' | 'approved';
  lastModified: Date;
  translator: string;
  reviewer?: string;
}
```

#### Version Control

```bash
# Translation workflow
git checkout -b translations/update-af-ZA
# Update translation files
git add locales/af-ZA/
git commit -m "Update Afrikaans translations for v2.1"
git push origin translations/update-af-ZA
```

### Continuous Localization

#### Automation Pipeline

```yaml
# .github/workflows/translations.yml
name: Translation Updates
on:
  push:
    paths:
      - 'locales/**'
jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate translation files
        run: npm run i18n:validate
      - name: Check for missing keys
        run: npm run i18n:check-missing
```

#### Translation Service Integration

```typescript
// Integration with translation services
async function submitForTranslation(
  content: string, 
  sourceLang: string, 
  targetLang: string
): Promise<string> {
  const response = await translationService.translate({
    text: content,
    from: sourceLang,
    to: targetLang,
    domain: 'construction'
  });
  
  return response.translatedText;
}
```

### Performance Optimization

#### Lazy Loading

```typescript
// Dynamic import of translations
const loadTranslations = async (language: string) => {
  const translations = await import(`../locales/${language}/index.js`);
  return translations.default;
};
```

#### Caching Strategy

```typescript
const translationCache = new Map<string, any>();

async function getTranslations(language: string) {
  if (!translationCache.has(language)) {
    const translations = await loadTranslations(language);
    translationCache.set(language, translations);
  }
  
  return translationCache.get(language);
}
```

## Implementation Checklist

### Development Phase

- [ ] Set up i18next framework
- [ ] Create translation file structure
- [ ] Implement language detection
- [ ] Add language switcher UI
- [ ] Extract translatable strings

### Translation Phase

- [ ] Professional translation services
- [ ] Technical terminology review
- [ ] Cultural adaptation review
- [ ] Legal compliance review
- [ ] Quality assurance testing

### Testing Phase

- [ ] Pseudo-localization testing
- [ ] Layout validation
- [ ] Functional testing per language
- [ ] Performance testing
- [ ] User acceptance testing

### Deployment Phase

- [ ] Production environment setup
- [ ] CDN configuration for assets
- [ ] Monitoring and analytics
- [ ] User feedback collection
- [ ] Continuous improvement process

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Next Review**: 2024-04-15  
**Owner**: Localization Team  
**Approved By**: Chief Technology Officer
