import { useEffect, useRef, useState } from 'react'
import data from './data/index'
import { messages } from './i18n'
import { categoryStats, quizReducer, readPreferences, selectQuestions, STORAGE_KEY, validateContent } from './quiz'
import type { Action, Language, State } from './quiz'

validateContent(data)
const icons: Record<string, string> = {
  symbols: 'M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0',
  geography: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15',
  history: 'M4 21V9h16v12M2 9l10-6 10 6M8 12v6m4-6v6m4-6v6M2 21h20',
  traditions: 'M5 10h14v11H5ZM3 6h18v4H3Zm9 0v15M12 6C4 6 5 0 9 3l3 3Zm0 0c8 0 7-6 3-3l-3 3Z',
  people: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3',
  general: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
}
function TopicIcon({ id }: { id: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[id]} /></svg>
}
function load() {
  try { return { ...readPreferences(localStorage.getItem(STORAGE_KEY)), storageError: false } }
  catch { return { ...readPreferences(null), storageError: true } }
}
function App() {
  const [initial] = useState(load)
  const [language, setLanguage] = useState<Language>(initial.language)
  const [storageError, setStorageError] = useState(initial.storageError)
  const [state, setState] = useState<State>({ stats: initial.stats, session: null })
  const stateRef = useRef(state)
  const heading = useRef<HTMLHeadingElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const t = messages[language]
  const session = state.session
  const category = data.categories.find((c) => c.id === session?.categoryId)
  const current = session?.questions[session.index]
  const selected = current && session?.answers[current.id]
  const screen = !session ? 'home' : session.complete ? 'result' : 'quiz'
  const overall = categoryStats(data.questions, state.stats)
  useEffect(() => {
    document.documentElement.lang = language
    document.title = `KP Quiz · ${t.tagline}`
  }, [language, t.tagline])
  function persist(next: State, nextLanguage: Language) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ language: nextLanguage, stats: next.stats }))
      setStorageError(false)
    } catch { setStorageError(true) }
  }
  function dispatch(action: Action) {
    const previous = stateRef.current
    const next = quizReducer(previous, action)
    stateRef.current = next
    setState(next)
    if (next.stats !== previous.stats) persist(next, language)
  }
  function changeLanguage(next: Language) {
    setLanguage(next)
    persist(stateRef.current, next)
  }
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0) }, [screen, current?.id])
  useEffect(() => { if (selected && screen === 'quiz') nextButton.current?.focus() }, [selected, screen])
  function start(categoryId: string, mode: 'quick' | 'full') {
    dispatch({ type: 'start', categoryId, questions: selectQuestions(data.questions.filter((q) => q.categoryId === categoryId), state.stats, mode) })
  }
  const mistakes = session?.questions.filter((q) => session.answers[q.id] !== q.correctAnswerId) ?? []
  const correct = session ? session.questions.length - mistakes.length : 0
  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="site-header">
      <a className="brand" href={import.meta.env.BASE_URL} onClick={(event) => { event.preventDefault(); dispatch({ type: 'home' }) }} aria-label={`KP Quiz · ${t.back}`}>
        <span className="brand-mark" aria-hidden="true">kp<span>✦</span></span>
        <span>KP Quiz<small>{t.tagline}</small></span>
      </a>
      <div className="language-switch" role="group" aria-label={t.language}>
        <button type="button" lang="uk" aria-label="Українська" aria-pressed={language === 'uk'} onClick={() => changeLanguage('uk')}>УКР</button>
        <button type="button" lang="pl" aria-label="Polski" aria-pressed={language === 'pl'} onClick={() => changeLanguage('pl')}>PL</button>
      </div>
    </header>
    <main id="main" className={screen === 'home' ? 'home' : 'session'}>
      {storageError ? <p className="storage-warning" role="status">{t.storageError}</p> : null}
      {screen === 'home' ? <>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow"><span aria-hidden="true">✦</span> {t.eyebrow}</p>
            <h1 id="page-title" ref={heading} tabIndex={-1}>{t.title}</h1>
            <p className="intro">{t.intro}</p>
            <p className="content-language"><span aria-hidden="true">◉</span> {t.contentLanguage}</p>
          </div>
          <div className="hero-seal" aria-hidden="true"><span>POLSKA</span><span className="seal-star">✦</span><i>krok po kroku</i><span>966 · 1918</span></div>
        </section>
        <dl className="overview">
          <div><dt>{t.questions}</dt><dd>{data.questions.length}</dd></div>
          <div><dt>{t.categories}</dt><dd>{data.categories.length}</dd></div>
          <div><dt>{t.studied}</dt><dd>{overall.studied}<span> / {overall.total}</span></dd></div>
        </dl>
        <div className="section-heading"><h2>{t.topics}</h2><p>{t.guide}</p></div>
        <div className="category-grid">
          {data.categories.map((c, index) => {
            const questions = data.questions.filter((q) => q.categoryId === c.id)
            const summary = categoryStats(questions, state.stats)
            return <article className="category-card" key={c.id} aria-labelledby={`category-${c.id}`}>
              <div className="card-top"><span className="topic-icon"><TopicIcon id={c.id} /></span><span className="category-number" aria-hidden="true">0{index + 1}</span></div>
              <h3 id={`category-${c.id}`}>{c.name[language]}</h3>
              <dl className="category-stats"><div><dt>{t.studied}</dt><dd>{summary.studied} <span>/ {summary.total}</span></dd></div><div><dt>{t.accuracy}</dt><dd>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}</dd></div></dl>
              <div className="track" aria-hidden="true"><span style={{ width: `${summary.studied / summary.total * 100}%` }} /></div>
              <button className="primary" onClick={() => start(c.id, 'quick')} aria-label={`${t.quick}: ${c.name[language]}`}><span>{t.quick}<small>{Math.min(10, summary.total)} {t.questionCount}</small></span><span aria-hidden="true">↗</span></button>
              <button className="full-button" onClick={() => start(c.id, 'full')} aria-label={`${t.full}: ${c.name[language]}`}>{t.full} <span>· {summary.total} {t.questionCount}</span><span aria-hidden="true">→</span></button>
            </article>
          })}
        </div>
      </> : null}
      {screen === 'quiz' && session && current && category ? <>
        <button className="back-button" onClick={() => dispatch({ type: 'home' })}><span aria-hidden="true">←</span> {t.back}</button>
        <div className="quiz-meta"><span>{category.name[language]}</span><span>{t.question} {session.index + 1} {t.of} {session.questions.length}</span></div>
        <progress max={session.questions.length} value={session.index + Number(Boolean(selected))} aria-label={`${t.question} ${session.index + 1} ${t.of} ${session.questions.length}`} />
        <section className="question-card" aria-labelledby="question-title">
          <p className="eyebrow">{t.choose}</p>
          <h1 ref={heading} tabIndex={-1} id="question-title" lang={data.language}>{current.question}</h1>
          <div className="answers" role="group" aria-labelledby="question-title">
            {current.answers.map((answer, index) => {
              const isCorrect = answer.id === current.correctAnswerId
              const isSelected = answer.id === selected
              const revealedClass = selected && isCorrect ? ' correct' : isSelected ? ' incorrect' : ''
              return <button key={answer.id} className={`answer${revealedClass}`} disabled={Boolean(selected)} onClick={() => dispatch({ type: 'answer', questionId: current.id, answerId: answer.id })}>
                <span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                <span className="answer-copy"><span lang={data.language}>{answer.text}</span>{selected && (isCorrect || isSelected) ? <small>{isCorrect ? `✓ ${t.correctAnswer}` : `✕ ${t.yourAnswer} · ${t.incorrect}`}</small> : null}</span>
              </button>
            })}
          </div>
          <div aria-live="polite" aria-atomic="true">
            {selected ? <aside className={`feedback ${selected === current.correctAnswerId ? 'feedback-correct' : 'feedback-incorrect'}`}>
              <strong>{selected === current.correctAnswerId ? `✓ ${t.correct}` : `✕ ${t.incorrect}`}</strong>
              <h2>{t.fact}</h2><p lang={data.language}>{current.fact}</p>
            </aside> : null}
          </div>
          {selected ? <button ref={nextButton} className="primary next-button" onClick={() => dispatch({ type: 'next' })}>{session.index === session.questions.length - 1 ? t.finish : t.next}<span aria-hidden="true">→</span></button> : null}
        </section>
      </> : null}
      {screen === 'result' && session ? <>
        <section className="result-summary" aria-labelledby="result-title">
          <p className="eyebrow">✓ {t.completed} · {category?.name[language]}</p>
          <h1 id="result-title" ref={heading} tabIndex={-1}>{t.result}</h1>
          <p>{t.resultCopy}</p>
          <div className="score"><strong>{Math.round(correct / session.questions.length * 100)}<span>%</span></strong><p>{t.score}: <b>{correct} {t.of} {session.questions.length}</b></p></div>
          <button className="primary" onClick={() => dispatch({ type: 'home' })}>{t.back}<span aria-hidden="true">→</span></button>
        </section>
        {mistakes.length ? <section className="mistakes" aria-labelledby="mistakes-title"><h2 id="mistakes-title">{t.mistakes} <span>({mistakes.length})</span></h2>{mistakes.map((q) => <article key={q.id} className="mistake-card">
          <h3 lang={data.language}>{q.question}</h3>
          <p className="missed-answer">✕ {t.yourAnswer}: <span lang={data.language}>{q.answers.find((a) => a.id === session.answers[q.id])?.text}</span></p>
          <p className="right-answer">✓ {t.correctAnswer}: <strong lang={data.language}>{q.answers.find((a) => a.id === q.correctAnswerId)?.text}</strong></p>
          <p className="mistake-fact" lang={data.language}>{q.fact}</p>
        </article>)}</section> : <div className="perfect"><span aria-hidden="true">✦</span><h2>{t.perfect}</h2><p>{t.perfectCopy}</p></div>}
      </> : null}
    </main>
    <footer><p><span aria-hidden="true">◇</span> {t.local}</p><p>{t.source}</p></footer>
  </>
}
export default App
