import { useTranslation } from 'react-i18next'
import type { Language } from '../quiz'

type AppHeaderProps = {
  language: Language
  onHome: () => void
  onLanguageChange: (language: Language) => void
}

const languages: Language[] = ['uk', 'pl', 'en']

export function AppHeader({ language, onHome, onLanguageChange }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="site-header">
      <a
        className="brand"
        href={import.meta.env.BASE_URL}
        onClick={(event) => {
          event.preventDefault()
          onHome()
        }}
        aria-label={t('homeLabel')}
      >
        <span className="brand-mark" aria-hidden="true">
          kp<span>✦</span>
        </span>
        <span>
          {t('appName')}
          <small>{t('tagline')}</small>
        </span>
      </a>
      <div className="language-switch" role="group" aria-label={t('language')}>
        {languages.map((option) => (
          <button
            key={option}
            type="button"
            lang={option}
            aria-label={t(`languages.${option}.name`)}
            aria-pressed={language === option}
            onClick={() => onLanguageChange(option)}
          >
            {t(`languages.${option}.short`)}
          </button>
        ))}
      </div>
    </header>
  )
}
