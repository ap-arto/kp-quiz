import { useTranslation } from 'react-i18next'
import type { Question } from '../quiz'

type MistakeCardProps = {
  question: Question
  selectedAnswerId?: string
  contentLanguage: string
}

export function MistakeCard({ question, selectedAnswerId, contentLanguage }: MistakeCardProps) {
  const { t } = useTranslation()

  return (
    <article className="mistake-card">
      <h3 lang={contentLanguage}>{question.question}</h3>
      <p className="missed-answer">
        ✕ {t('yourAnswer')}:{' '}
        <span lang={contentLanguage}>
          {question.answers.find((answer) => answer.id === selectedAnswerId)?.text}
        </span>
      </p>
      <p className="right-answer">
        ✓ {t('correctAnswer')}:{' '}
        <strong lang={contentLanguage}>
          {question.answers.find((answer) => answer.id === question.correctAnswerId)?.text}
        </strong>
      </p>
      <p className="mistake-fact" lang={contentLanguage}>
        {question.fact}
      </p>
    </article>
  )
}
