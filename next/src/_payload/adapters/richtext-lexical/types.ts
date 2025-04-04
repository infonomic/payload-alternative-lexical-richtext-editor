import type {
  DefaultCellComponentProps,
  DefaultServerCellComponentProps,
  RichTextAdapter,
  RichTextFieldClient,
  RichTextFieldClientProps
} from 'payload'
import type { EditorConfig, EditorSettings } from './field/config/types'
import type { SerializedEditorState } from 'lexical'
import type { EditorConfig as LexicalEditorConfig } from 'lexical'

export interface LexicalEditorProps {
  settings?: (config: EditorSettings) => EditorSettings
  lexical?: LexicalEditorConfig
}

export interface AdapterProps {
  editorConfig: EditorConfig
}

// export type LexicalRichTextAdapter = RichTextAdapter<
//   SerializedEditorState,
//   AdapterProps,
//   object
// > & {
//   editorConfig: EditorConfig
// }

export type LexicalRichTextAdapter = {
  editorConfig: EditorConfig
} & RichTextAdapter<SerializedEditorState, AdapterProps>

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

// export type LexicalRichTextCellProps = DefaultCellComponentProps<
//   RichTextFieldClient<SerializedEditorState, AdapterProps, object>,
//   SerializedEditorState
// >

export type LexicalRichTextCellProps = DefaultServerCellComponentProps<
  RichTextFieldClient<SerializedEditorState, AdapterProps, object>,
  SerializedEditorState
>
