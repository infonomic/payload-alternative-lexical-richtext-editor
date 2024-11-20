import type {
  DefaultCellComponentProps,
  RichTextAdapter,
  RichTextFieldClient,
  RichTextFieldClientProps
} from 'payload'
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

export type LexicalFieldAdminProps = {
  /**
   * Controls if the gutter (padding to the left & gray vertical line) should be hidden. @default false
   */
  hideGutter?: boolean
}

export type LexicalRichTextFieldProps = {
  admin: LexicalFieldAdminProps
  path?: string
  readonly editorConfig: EditorConfig
} & RichTextFieldClientProps<SerializedEditorState, AdapterProps, object>

export type LexicalRichTextCellProps = DefaultCellComponentProps<
  RichTextFieldClient<SerializedEditorState, AdapterProps, object>,
  SerializedEditorState
>
