export type Language = 'uk' | 'pl' | 'en'
export type Category = { id: string }
export type Answer = { id: string; text: string }
export type Question = {
  id: string
  categoryId: string
  question: string
  answers: Answer[]
  correctAnswerId: string
  fact: string
  source: string
}
export type Content = { language: string; categories: Category[]; questions: Question[] }
export type Stats = Record<string, { attempts: number; successes: number }>
export type Session = {
  categoryId: string
  questions: Question[]
  index: number
  answers: Record<string, string>
  complete: boolean
}
export type State = { stats: Stats; session: Session | null }
export type Action =
  | { type: 'start'; categoryId: string; questions: Question[] }
  | { type: 'answer'; questionId: string; answerId: string }
  | { type: 'next' }
  | { type: 'home' }

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function selectQuestions(
  questions: Question[],
  stats: Stats,
  mode: 'quick' | 'full',
  random = Math.random,
) {
  const priority = (q: Question) =>
    stats[q.id]?.attempts ? stats[q.id].successes / stats[q.id].attempts : -1
  return shuffle(questions, random)
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, mode === 'quick' ? 10 : questions.length)
    .map((q) => ({ ...q, answers: shuffle(q.answers, random) }))
}

export function categoryStats(questions: Question[], stats: Stats) {
  let attempts = 0,
    successes = 0,
    studied = 0
  for (const q of questions) {
    const stat = stats[q.id]
    if (stat?.attempts) {
      studied++
      attempts += stat.attempts
      successes += stat.successes
    }
  }
  return {
    studied,
    total: questions.length,
    accuracy: attempts ? Math.round((successes / attempts) * 100) : null,
  }
}

export function quizReducer(state: State, action: Action): State {
  if (action.type === 'home') return { ...state, session: null }
  if (action.type === 'start')
    return action.questions.length
      ? {
          ...state,
          session: {
            categoryId: action.categoryId,
            questions: action.questions,
            index: 0,
            answers: {},
            complete: false,
          },
        }
      : state
  const session = state.session
  if (!session || session.complete) return state
  const q = session.questions[session.index]
  if (action.type === 'next') {
    if (!session.answers[q.id]) return state
    return {
      ...state,
      session: {
        ...session,
        index: Math.min(session.index + 1, session.questions.length - 1),
        complete: session.index === session.questions.length - 1,
      },
    }
  }
  if (
    action.questionId !== q.id ||
    session.answers[q.id] ||
    !q.answers.some((a) => a.id === action.answerId)
  )
    return state
  const previous = state.stats[q.id] ?? { attempts: 0, successes: 0 }
  return {
    stats: {
      ...state.stats,
      [q.id]: {
        attempts: previous.attempts + 1,
        successes: previous.successes + Number(action.answerId === q.correctAnswerId),
      },
    },
    session: { ...session, answers: { ...session.answers, [q.id]: action.answerId } },
  }
}

export const STORAGE_KEY = 'kp-quiz:v1'
export function readPreferences(raw: string | null): { stats: Stats; language: Language } {
  const empty = { stats: {}, language: 'uk' as Language }
  try {
    const value = JSON.parse(raw ?? 'null')
    if (!value || typeof value !== 'object') return empty
    const stats: Stats = {}
    if (value.stats && typeof value.stats === 'object') {
      for (const [id, stat] of Object.entries(value.stats)) {
        if (id === '__proto__' || id === 'constructor' || id === 'prototype') continue
        const s = stat as Stats[string] | null
        if (
          s &&
          Number.isSafeInteger(s.attempts) &&
          Number.isSafeInteger(s.successes) &&
          s.attempts >= 0 &&
          s.successes >= 0 &&
          s.successes <= s.attempts
        )
          stats[id] = s
      }
    }
    return {
      stats,
      language: value.language === 'pl' || value.language === 'en' ? value.language : 'uk',
    }
  } catch {
    return empty
  }
}

export function validateContent(content: Content) {
  const categories = new Set(content.categories.map((c) => c.id))
  const ids = new Set<string>()
  if (categories.size !== content.categories.length) throw new Error('Duplicate category ID')
  for (const q of content.questions) {
    if (
      !q.id ||
      ids.has(q.id) ||
      !categories.has(q.categoryId) ||
      !q.question.trim() ||
      !q.fact.trim() ||
      !q.source.trim() ||
      q.answers.length !== 4 ||
      new Set(q.answers.map((a) => a.id)).size !== 4 ||
      new Set(q.answers.map((a) => a.text)).size !== 4 ||
      q.answers.some((a) => !a.id || !a.text.trim()) ||
      !q.answers.some((a) => a.id === q.correctAnswerId)
    )
      throw new Error(`Invalid question: ${q.id}`)
    ids.add(q.id)
  }
  for (const c of content.categories) {
    if (!c.id || !content.questions.some((q) => q.categoryId === c.id))
      throw new Error(`Invalid category: ${c.id}`)
  }
}
