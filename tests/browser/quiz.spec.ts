import { test, expect } from '@playwright/test'
import data from '../../src/data/index'
const key = 'kp-quiz:v1'

test('complete mixed quiz, persist each answer, show only mistakes, switch language', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('./')
  await expect(page.locator('.category-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'Швидкий квіз: Історія', exact: true }).click()
  await expect(page.locator('.quiz-meta')).toContainText('1 з 10')
  const seen = new Set<string>()
  for (let i = 0; i < 10; i++) {
    const question = await page.locator('#question-title').innerText()
    expect(seen.has(question)).toBe(false)
    seen.add(question)
    const q = data.questions.find(q => q.question === question)!
    const answer = q.answers.find(a => i === 0 ? a.id !== q.correctAnswerId : a.id === q.correctAnswerId)!
    const button = page.getByRole('button', {name:answer.text, exact:true})
    await button.click()
    await expect(page.locator('.answer:disabled')).toHaveCount(4)
    await expect(page.locator('.feedback')).toContainText(q.fact)
    const stats = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).stats, key)
    expect(stats[q.id]).toEqual({attempts:1, successes:i === 0 ? 0 : 1})
    await expect(page.locator('.next-button')).toBeFocused()
    await page.locator('.next-button').press('Enter')
  }
  await expect(page.locator('.score')).toContainText('90%')
  await expect(page.locator('.mistake-card')).toHaveCount(1)
  await page.getByRole('button', {name:'Polski', exact:true}).click()
  await expect(page.locator('html')).toHaveAttribute('lang','pl')
  await expect(page.locator('.score')).toContainText('Poprawne odpowiedzi: 9 z 10')
  await page.getByRole('button', {name:'Do tematów',exact:true}).click()
  const card = page.getByRole('article', {name:'Historia',exact:true})
  await expect(card).toContainText('10 / 12')
  await expect(card).toContainText('90%')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang','pl')
  await expect(card).toContainText('10 / 12')
  await expect(card).toContainText('90%')
  expect(errors).toEqual([])
})

test('unfinished session resets on reload, full mode contains all category questions, language preserves content', async ({page}) => {
  await page.goto('./')
  await page.getByRole('button', {name:'Повний квіз: Історія',exact:true}).click()
  await expect(page.locator('.quiz-meta')).toContainText('1 з 12')
  const text = await page.locator('#question-title').innerText()
  await page.getByRole('button', {name:'Polski',exact:true}).click()
  await expect(page.locator('#question-title')).toHaveText(text)
  await expect(page.locator('#question-title')).toHaveAttribute('lang','pl')
  await page.locator('.answer').first().click()
  await page.reload()
  await expect(page.locator('.category-card')).toHaveCount(6)
  await expect(page.getByRole('article', {name:'Historia',exact:true})).toContainText('1 / 12')
  await page.getByRole('button', {name:'Pełny quiz: Symbole Polski',exact:true}).click()
  for (let i = 0; i < 5; i++) {
    const text = await page.locator('#question-title').innerText()
    const q = data.questions.find(q => q.question === text)!
    await page.getByRole('button', {name:q.answers.find(a=>a.id===q.correctAnswerId)!.text,exact:true}).click()
    await page.locator('.next-button').click()
  }
  await expect(page.locator('.score')).toContainText('100%')
  await expect(page.locator('.perfect')).toContainText('Wszystkie odpowiedzi poprawne')
  await expect(page.locator('.mistake-card')).toHaveCount(0)
})

test('storage failure stays usable and displays warning', async ({page}) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('blocked') } })
  await page.goto('./')
  await page.getByRole('button', {name:'Швидкий квіз: Символи Польщі',exact:true}).click()
  await page.locator('.answer').first().click()
  await expect(page.getByRole('status')).toContainText('Браузер не дозволив зберегти прогрес')
  await expect(page.locator('.next-button')).toBeEnabled()
})

test('320px layout and keyboard navigation remain usable', async ({page}) => {
  await page.setViewportSize({width:320,height:740})
  await page.goto('./')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const start = page.getByRole('button', {name:'Швидкий квіз: Географія',exact:true})
  await start.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#question-title')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('.answer').first()).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.locator('.next-button')).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
