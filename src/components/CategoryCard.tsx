import { useTranslation } from 'react-i18next'
import { categoryStats } from '../quiz'
import type { Category, Question, Stats } from '../quiz'
import { TopicIcon } from './TopicIcon'

type CategoryCardProps = {
  category: Category
  index: number
  questions: Question[]
  stats: Stats
  onStart: (categoryId: string, mode: 'quick' | 'full') => void
}

export function CategoryCard({ category, index, questions, stats, onStart }: CategoryCardProps) {
  const { t } = useTranslation()
  const summary = categoryStats(questions, stats)
  const categoryName = t(`categoryNames.${category.id}`)

  return (
    <article className="category-card" aria-labelledby={`category-${category.id}`}>
      <div className="card-top">
        <span className="topic-icon">
          <TopicIcon id={category.id} />
        </span>
        <span className="category-number" aria-hidden="true">
          0{index + 1}
        </span>
      </div>
      <h3 id={`category-${category.id}`}>{categoryName}</h3>
      <dl className="category-stats">
        <div>
          <dt>{t('studied')}</dt>
          <dd>
            {summary.studied} <span>/ {summary.total}</span>
          </dd>
        </div>
        <div>
          <dt>{t('accuracy')}</dt>
          <dd>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}</dd>
        </div>
      </dl>
      <div className="track" aria-hidden="true">
        <span style={{ width: `${(summary.studied / summary.total) * 100}%` }} />
      </div>
      <button
        className="primary"
        onClick={() => onStart(category.id, 'quick')}
        aria-label={t('quickLabel', { category: categoryName })}
      >
        <span>
          {t('quick')}
          <small>{t('questionCount', { count: Math.min(10, summary.total) })}</small>
        </span>
        <span aria-hidden="true">↗</span>
      </button>
      <button
        className="full-button"
        onClick={() => onStart(category.id, 'full')}
        aria-label={t('fullLabel', { category: categoryName })}
      >
        {t('full')} <span>· {t('questionCount', { count: summary.total })}</span>
        <span aria-hidden="true">→</span>
      </button>
    </article>
  )
}
