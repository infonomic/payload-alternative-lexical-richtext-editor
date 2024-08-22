// @ts-ignore
import type { EditorConfig as LexicalEditorConfig } from 'lexical/LexicalEditor'

import { theme } from '../themes/lexical-editor-theme'

export const defaultEditorLexicalConfig: LexicalEditorConfig = {
  namespace: 'LexicalRichText',
  theme
}
