import type { FieldPermissions } from 'payload'
import type { FieldTypes } from 'payload'
import type { RichTextFieldProps } from 'payload'
import type { AdapterProps } from '../types'
import type { EditorSettings } from './config'
import type { SerializedEditorState, EditorState, LexicalEditor } from 'lexical'

export interface OnChangeProps {
  onChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void
  initialJSON: any
  config: EditorSettings
  value: any
  setValue: (value: any) => void
}
