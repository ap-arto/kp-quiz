import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { categoryStats } from '../quiz'
import type { Content, Stats } from '../quiz'
import { CategoryCard } from './CategoryCard'

type HomeScreenProps = {
  content: Content
  stats: Stats
  headingRef: RefObject<HTMLHeadingElement | null>
  onStart: (categoryId: string, mode: 'quick' | 'full') => void
}

export function HomeScreen({ content, stats, headingRef, onStart }: HomeScreenProps) {
  const { t } = useTranslation()
  const overall = categoryStats(content.questions, stats)

  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true">✦</span> {t('eyebrow')}
          </p>
          <h1 id="page-title" ref={headingRef} tabIndex={-1}>
            {t('title')}
          </h1>
          <p className="intro">{t('intro')}</p>
          <p className="content-language">
            <span aria-hidden="true">◉</span> {t('contentLanguage')}
          </p>
        </div>
        <div className="hero-seal" aria-hidden="true">
          <span>{t('sealCountry')}</span>
          <span className="seal-star">✦</span>
          <i>{t('sealMotto')}</i>
          <span>966 · 1918</span>
        </div>
      </section>
      <dl className="overview">
        <div>
          <dt>{t('questions')}</dt>
          <dd>{content.questions.length}</dd>
        </div>
        <div>
          <dt>{t('categories')}</dt>
          <dd>{content.categories.length}</dd>
        </div>
        <div>
          <dt>{t('studied')}</dt>
          <dd>
            {overall.studied}
            <span> / {overall.total}</span>
          </dd>
        </div>
      </dl>
      <div className="section-heading">
        <h2>{t('topics')}</h2>
        <p>{t('guide')}</p>
      </div>
      <div className="category-grid">
        {content.categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            questions={content.questions.filter((question) => question.categoryId === category.id)}
            stats={stats}
            onStart={onStart}
          />
        ))}
      </div>
    </>
  )
}
