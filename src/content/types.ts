export interface ProseBlock {
  type: 'prose'
  markdown: string
}

export interface CodeBlock {
  type: 'code'
  language: string
  code: string
  filename?: string
  highlightLines?: number[]
}

export interface OutputBlock {
  type: 'output'
  content: string
  prompt?: string
}

export interface NoteBlock {
  type: 'note'
  variant: 'tip' | 'warning' | 'info' | 'danger'
  title?: string
  markdown: string
}

export interface DiagramBlock {
  type: 'diagram'
  component: string
  props?: Record<string, unknown>
  caption?: string
}

export interface QuizBlock {
  type: 'quiz'
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ExerciseBlock {
  type: 'exercise'
  title: string
  description: string
  hints: string[]
  solution: string
  solutionLanguage?: string
}

export interface CodeDiffBlock {
  type: 'codeDiff'
  before: string
  after: string
  language?: string
  description?: string
}

export type ContentBlock =
  | ProseBlock
  | CodeBlock
  | OutputBlock
  | NoteBlock
  | DiagramBlock
  | QuizBlock
  | ExerciseBlock
  | CodeDiffBlock

export interface Chapter {
  id: string
  title: string
  description: string
  blocks: ContentBlock[]
}

export interface ChapterMeta {
  id: string
  title: string
  description: string
}

export interface Section {
  id: string
  title: string
  description: string
  icon: string
  chapters: ChapterMeta[]
}

export interface TableOfContents {
  sections: Section[]
}
