import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'eu', name: 'Euskara', flag: '🟢' },
  { code: 'br', name: 'Brezhoneg', flag: '🏴' }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className="language-selector">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          onClick={() => handleChange(lang.code)}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
