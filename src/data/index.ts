import category1 from './category-1.json' with { type: 'json' }
import category2 from './category-2.json' with { type: 'json' }
import category3 from './category-3.json' with { type: 'json' }
import category4 from './category-4.json' with { type: 'json' }
import category5 from './category-5.json' with { type: 'json' }
import category6 from './category-6.json' with { type: 'json' }
import type { Content } from '../quiz.ts'

const categoryFiles = [category1, category2, category3, category4, category5, category6]

const data: Content = {
  language: 'pl',
  categories: categoryFiles.map((file) => file.category),
  questions: categoryFiles.flatMap((file) => file.questions),
}

export default data
