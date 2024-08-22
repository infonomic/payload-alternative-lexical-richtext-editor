import type { RichTextAdapter } from 'payload'

import type { EditorConfig, EditorSettings } from './field/config/types'
import type { SerializedEditorState } from 'lexical'
// @ts-expect-error: ignore
import type { EditorConfig as LexicalEditorConfig } from 'lexical/LexicalEditor'

export interface LexicalEditorProps {
  settings?: (config: EditorSettings) => EditorSettings
  lexical?: LexicalEditorConfig
}

export interface AdapterProps {
  editorConfig: EditorConfig
}

export type LexicalRichTextAdapter = RichTextAdapter<
  SerializedEditorState,
  AdapterProps,
  object
> & {
  editorConfig: EditorConfig
}
