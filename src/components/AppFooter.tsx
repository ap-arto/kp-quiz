import { useTranslation } from 'react-i18next'

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer>
      <p>
        <span aria-hidden="true">◇</span> {t('local')}
      </p>
      <p>{t('source')}</p>
    </footer>
  )
}
