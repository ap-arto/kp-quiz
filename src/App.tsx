import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppFooter } from './components/AppFooter'
import { AppHeader } from './components/AppHeader'
import { HomeScreen } from './components/HomeScreen'
import { QuizScreen } from './components/QuizScreen'
import { ResultScreen } from './components/ResultScreen'
import data from './data/index'
import { quizReducer, readPreferences, selectQuestions, STORAGE_KEY, validateContent } from './quiz'
import type { Action, Language, State } from './quiz'

validateContent(data)

function loadPreferences() {
  try {
    return { ...readPreferences(localStorage.getItem(STORAGE_KEY)), storageError: false }
  } catch {
    return { ...readPreferences(null), storageError: true }
  }
}

function App() {
  const [initial] = useState(loadPreferences)
  const { t, i18n } = useTranslation()
  const language: Language =
    i18n.resolvedLanguage === 'pl' || i18n.resolvedLanguage === 'en' ? i18n.resolvedLanguage : 'uk'
  const [storageError, setStorageError] = useState(initial.storageError)
  const [state, setState] = useState<State>({ stats: initial.stats, session: null })
  const stateRef = useRef(state)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const session = state.session
  const category = data.categories.find((item) => item.id === session?.categoryId)
  const currentQuestion = session?.questions[session.index]
  const selectedAnswerId = currentQuestion && session?.answers[currentQuestion.id]
  const screen = !session ? 'home' : session.complete ? 'result' : 'quiz'

  useEffect(() => {
    document.documentElement.lang = language
    document.title = t('pageTitle')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'))
  }, [language, t])

  useEffect(() => {
    headingRef.current?.focus()
    window.scrollTo(0, 0)
  }, [screen, currentQuestion?.id])

  useEffect(() => {
    if (selectedAnswerId && screen === 'quiz') nextButtonRef.current?.focus()
  }, [selectedAnswerId, screen])

  function persist(nextState: State, nextLanguage: Language) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ language: nextLanguage, stats: nextState.stats }),
      )
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }

  function dispatch(action: Action) {
    const previous = stateRef.current
    const next = quizReducer(previous, action)
    stateRef.current = next
    setState(next)
    if (next.stats !== previous.stats) persist(next, language)
  }

  function changeLanguage(next: Language) {
    void i18n.changeLanguage(next)
    persist(stateRef.current, next)
  }

  function startQuiz(categoryId: string, mode: 'quick' | 'full') {
    dispatch({
      type: 'start',
      categoryId,
      questions: selectQuestions(
        data.questions.filter((question) => question.categoryId === categoryId),
        state.stats,
        mode,
      ),
    })
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>
      <AppHeader
        language={language}
        onHome={() => dispatch({ type: 'home' })}
        onLanguageChange={changeLanguage}
      />
      <main id="main" className={screen === 'home' ? 'home' : 'session'}>
        {storageError ? (
          <p className="storage-warning" role="status">
            {t('storageError')}
          </p>
        ) : null}
        {screen === 'home' ? (
          <HomeScreen
            content={data}
            stats={state.stats}
            headingRef={headingRef}
            onStart={startQuiz}
          />
        ) : null}
        {screen === 'quiz' && session && currentQuestion && category ? (
          <QuizScreen
            session={session}
            category={category}
            question={currentQuestion}
            selectedAnswerId={selectedAnswerId}
            contentLanguage={data.language}
            headingRef={headingRef}
            nextButtonRef={nextButtonRef}
            onHome={() => dispatch({ type: 'home' })}
            onAnswer={(questionId, answerId) => dispatch({ type: 'answer', questionId, answerId })}
            onNext={() => dispatch({ type: 'next' })}
          />
        ) : null}
        {screen === 'result' && session ? (
          <ResultScreen
            session={session}
            category={category}
            contentLanguage={data.language}
            headingRef={headingRef}
            onHome={() => dispatch({ type: 'home' })}
          />
        ) : null}
      </main>
      <AppFooter />
    </>
  )
}

export default App
