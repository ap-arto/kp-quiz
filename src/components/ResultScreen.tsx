import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category, Session } from '../quiz'
import { MistakeCard } from './MistakeCard'

type ResultScreenProps = {
  session: Session
  category?: Category
  contentLanguage: string
  headingRef: RefObject<HTMLHeadingElement | null>
  onHome: () => void
}

export function ResultScreen({
  session,
  category,
  contentLanguage,
  headingRef,
  onHome,
}: ResultScreenProps) {
  const { t } = useTranslation()
  const mistakes = session.questions.filter(
    (question) => session.answers[question.id] !== question.correctAnswerId,
  )
  const correct = session.questions.length - mistakes.length

  return (
    <>
      <section className="result-summary" aria-labelledby="result-title">
        <p className="eyebrow">
          ✓ {t('completed')} · {category ? t(`categoryNames.${category.id}`) : null}
        </p>
        <h1 id="result-title" ref={headingRef} tabIndex={-1}>
          {t('result')}
        </h1>
        <p>{t('resultCopy')}</p>
        <div className="score">
          <strong>
            {Math.round((correct / session.questions.length) * 100)}
            <span>%</span>
          </strong>
          <p>
            {t('score')}: <b>{t('scoreCount', { correct, total: session.questions.length })}</b>
          </p>
        </div>
        <button className="primary" onClick={onHome}>
          {t('back')}
          <span aria-hidden="true">→</span>
        </button>
      </section>
      {mistakes.length ? (
        <section className="mistakes" aria-labelledby="mistakes-title">
          <h2 id="mistakes-title">
            {t('mistakes')} <span>({mistakes.length})</span>
          </h2>
          {mistakes.map((question) => (
            <MistakeCard
              key={question.id}
              question={question}
              selectedAnswerId={session.answers[question.id]}
              contentLanguage={contentLanguage}
            />
          ))}
        </section>
      ) : (
        <div className="perfect">
          <span aria-hidden="true">✦</span>
          <h2>{t('perfect')}</h2>
          <p>{t('perfectCopy')}</p>
        </div>
      )}
    </>
  )
}
