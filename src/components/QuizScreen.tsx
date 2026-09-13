import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category, Question, Session } from '../quiz'

type QuizScreenProps = {
  session: Session
  category: Category
  question: Question
  selectedAnswerId?: string
  contentLanguage: string
  headingRef: RefObject<HTMLHeadingElement | null>
  nextButtonRef: RefObject<HTMLButtonElement | null>
  onHome: () => void
  onAnswer: (questionId: string, answerId: string) => void
  onNext: () => void
}

export function QuizScreen({
  session,
  category,
  question,
  selectedAnswerId,
  contentLanguage,
  headingRef,
  nextButtonRef,
  onHome,
  onAnswer,
  onNext,
}: QuizScreenProps) {
  const { t } = useTranslation()
  const progressLabel = t('questionProgress', {
    current: session.index + 1,
    total: session.questions.length,
  })

  return (
    <>
      <button className="back-button" onClick={onHome}>
        <span aria-hidden="true">←</span> {t('back')}
      </button>
      <div className="quiz-meta">
        <span>{t(`categoryNames.${category.id}`)}</span>
        <span>{progressLabel}</span>
      </div>
      <progress
        max={session.questions.length}
        value={session.index + Number(Boolean(selectedAnswerId))}
        aria-label={progressLabel}
      />
      <section className="question-card" aria-labelledby="question-title">
        <p className="eyebrow">{t('choose')}</p>
        <h1 ref={headingRef} tabIndex={-1} id="question-title" lang={contentLanguage}>
          {question.question}
        </h1>
        <div className="answers" role="group" aria-labelledby="question-title">
          {question.answers.map((answer, index) => {
            const isCorrect = answer.id === question.correctAnswerId
            const isSelected = answer.id === selectedAnswerId
            const revealedClass =
              selectedAnswerId && isCorrect ? ' correct' : isSelected ? ' incorrect' : ''

            return (
              <button
                key={answer.id}
                className={`answer${revealedClass}`}
                disabled={Boolean(selectedAnswerId)}
                onClick={() => onAnswer(question.id, answer.id)}
              >
                <span className="answer-letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="answer-copy">
                  <span lang={contentLanguage}>{answer.text}</span>
                  {selectedAnswerId && (isCorrect || isSelected) ? (
                    <small>
                      {isCorrect ? `✓ ${t('correctAnswer')}` : `✕ ${t('incorrectAnswer')}`}
                    </small>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
        <div aria-live="polite" aria-atomic="true">
          {selectedAnswerId ? (
            <aside
              className={`feedback ${
                selectedAnswerId === question.correctAnswerId
                  ? 'feedback-correct'
                  : 'feedback-incorrect'
              }`}
            >
              <strong>
                {selectedAnswerId === question.correctAnswerId
                  ? `✓ ${t('correct')}`
                  : `✕ ${t('incorrect')}`}
              </strong>
              <h2>{t('fact')}</h2>
              <p lang={contentLanguage}>{question.fact}</p>
            </aside>
          ) : null}
        </div>
        {selectedAnswerId ? (
          <button ref={nextButtonRef} className="primary next-button" onClick={onNext}>
            {session.index === session.questions.length - 1 ? t('finish') : t('next')}
            <span aria-hidden="true">→</span>
          </button>
        ) : null}
      </section>
    </>
  )
}
