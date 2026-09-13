import assert from 'node:assert/strict'
import { test } from 'node:test'
import data from '../src/data/index.ts'
import { categoryStats, quizReducer, readPreferences, selectQuestions, shuffle, validateContent } from '../src/quiz.ts'
const history = data.questions.filter(q => q.categoryId === 'history')
const blank = { stats: {}, session: null }

test('the real content has stable unique IDs, four distinct answers and source references', () => {
  validateContent(data)
  assert.equal(data.questions.length, 68)
  assert.equal(data.categories.length, 6)
  assert.equal(new Set(data.questions.map(q => q.question.trim().toLocaleLowerCase('pl'))).size, data.questions.length)
  const people = data.questions.filter(q => q.categoryId === 'people')
  const otherQuestions = data.questions.filter(q => q.categoryId !== 'people')
  assert.equal(people.length, 30)
  for (const q of people) assert.match(q.source, /^Treść przekazana przez użytkownika §\d+$/)
  for (const q of otherQuestions) assert.match(q.source, /^kp-data\/data\/questions\/.+ §\d+$/)
  assert.deepEqual(people.map(q => Number(q.source.split('§')[1])), Array.from({ length: 30 }, (_, i) => i + 1))
  const invalid = structuredClone(data)
  invalid.questions[0].correctAnswerId = 'missing'
  assert.throws(() => validateContent(invalid), /Invalid question/)
})
test('new questions precede weak ones, which precede strong ones', () => {
  const questions = history.slice(0, 4)
  const stats = { [questions[0].id]: {attempts: 10, successes: 8}, [questions[1].id]: {attempts: 2, successes: 0}, [questions[2].id]: {attempts: 4, successes: 2} }
  assert.deepEqual(selectQuestions(questions, stats, 'full', () => .5).map(q => q.id), [questions[3].id, questions[1].id, questions[2].id, questions[0].id])
})
test('quick caps at ten unique questions; full covers category; short categories use all questions', () => {
  assert.equal(selectQuestions(history, {}, 'quick').length, 10)
  assert.equal(new Set(selectQuestions(history, {}, 'quick').map(q => q.id)).size, 10)
  assert.deepEqual(new Set(selectQuestions(history, {}, 'full').map(q => q.id)), new Set(history.map(q => q.id)))
  assert.equal(selectQuestions(history.slice(0, 3), {}, 'quick').length, 3)
})
test('ties and answers are shuffled without mutating input or changing correct IDs', () => {
  assert.notDeepEqual(selectQuestions(history, {}, 'full', () => 0).map(q => q.id), selectQuestions(history, {}, 'full', () => .99).map(q => q.id))
  const original = structuredClone(history)
  const selected = selectQuestions(history, {}, 'full', () => 0)
  assert.deepEqual(history, original)
  for (const q of selected) {
    const source = history.find(s => s.id === q.id)
    assert.equal(q.correctAnswerId, source.correctAnswerId)
    assert.deepEqual(new Set(q.answers.map(a => a.id)), new Set(source.answers.map(a => a.id)))
    assert.notDeepEqual(q.answers, source.answers)
  }
  assert.deepEqual(shuffle([], () => 0), [])
})
test('answers count once, cannot be changed, and navigation requires an answer', () => {
  const q = history[0]
  let state = quizReducer(blank, {type:'start', categoryId: 'history', questions: history.slice(0, 2)})
  assert.equal(quizReducer(state, {type:'next'}), state)
  assert.equal(quizReducer(state, {type:'answer', questionId:q.id, answerId:'invalid'}), state)
  state = quizReducer(state, {type:'answer', questionId:q.id, answerId:q.correctAnswerId})
  assert.deepEqual(state.stats[q.id], {attempts:1, successes:1})
  assert.equal(quizReducer(state, {type:'answer', questionId:q.id, answerId:'b'}), state)
  state = quizReducer(state, {type:'next'})
  assert.equal(state.session.index, 1)
  assert.equal(quizReducer(state, {type:'answer', questionId:q.id, answerId:'b'}), state)
  state = quizReducer(state, {type:'answer', questionId:history[1].id, answerId:'b'})
  state = quizReducer(state, {type:'next'})
  assert.equal(state.session.complete, true)
  assert.deepEqual(state.stats[history[1].id], {attempts:1, successes:0})
  assert.equal(quizReducer(state, {type:'next'}), state)
  assert.equal(quizReducer(state, {type:'answer', questionId:history[1].id, answerId:'a'}), state)
  assert.equal(quizReducer(state, {type:'home'}).session, null)
})
test('category accuracy weights all attempts; studied counts unique questions', () => {
  const stats = { [history[0].id]: {attempts:9, successes:9}, [history[1].id]: {attempts:1, successes:0}, unrelated: {attempts:99, successes:0} }
  assert.deepEqual(categoryStats(history, stats), {studied:2, total:12, accuracy:90})
  assert.deepEqual(categoryStats(history, {}), {studied:0, total:12, accuracy:null})
})
test('preferences survive serialization and discard corrupted statistics', () => {
  const value = {language:'pl', stats:{q:{attempts:2, successes:1}}}
  assert.deepEqual(readPreferences(JSON.stringify(value)), value)
  for (const raw of [null, '', '{bad', 'null', 'false']) assert.deepEqual(readPreferences(raw), {language:'uk', stats:{}})
  assert.deepEqual(readPreferences(JSON.stringify({language:'de', stats:{bad:{attempts:-1,successes:0}, wrong:{attempts:1,successes:2}, float:{attempts:1.5,successes:1}, valid:{attempts:3,successes:2}}})), {language:'uk', stats:{valid:{attempts:3,successes:2}}})
})
