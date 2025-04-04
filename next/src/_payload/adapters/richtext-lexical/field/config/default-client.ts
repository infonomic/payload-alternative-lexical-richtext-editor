import type { EditorConfig as LexicalEditorConfig } from 'lexical'

import { theme } from '../themes/lexical-editor-theme'

export const defaultEditorLexicalConfig: LexicalEditorConfig = {
  namespace: 'LexicalRichText',
  theme
}
