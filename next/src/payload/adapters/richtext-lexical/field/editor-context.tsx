'use client'
import * as React from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'

import { EditorConfigContext } from './config'
import { SharedHistoryContext } from './context/shared-history-context'
import { SharedOnChangeContext } from './context/shared-on-change-context'
import { Editor } from './editor'
import { Nodes } from './nodes'

import type { EditorConfig } from './config'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import type { LexicalEditor, EditorState, SerializedEditorState } from 'lexical'
import { RichTextFieldClientProps } from 'payload'
import { AdapterProps } from '../types'

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error, editor: LexicalEditor): void {
  // eslint-disable-next-line no-console
  console.error(error)
}

export function EditorContext(props: {
  editorConfig: EditorConfig
  fieldProps: RichTextFieldClientProps<SerializedEditorState, AdapterProps, any>
  onChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void
  path: string
  readOnly: boolean
  value: SerializedEditorState
}): React.JSX.Element {
  const { editorConfig, onChange, path, readOnly } = props
  const { value } = props

  const [initialConfig, setInitialConfig] = React.useState<InitialConfigType | null>(null)

  React.useEffect(() => {
    const newInitialConfig: InitialConfigType = {
      namespace: editorConfig.lexical.namespace,
      editable: !readOnly,
      editorState: value != null ? JSON.stringify(value) : undefined,
      theme: editorConfig.lexical.theme,
      nodes: [...Nodes],
      onError
    }
    setInitialConfig(newInitialConfig)
  }, [editorConfig, readOnly, value])

  if (initialConfig == null) {
    return <p>Loading...</p>
  }

  return (
    <LexicalComposer initialConfig={initialConfig} key={path}>
      <EditorConfigContext config={editorConfig.settings}>
        <SharedOnChangeContext onChange={onChange}>
          <SharedHistoryContext>
            <div className="editor-shell">
              <Editor />
            </div>
          </SharedHistoryContext>
        </SharedOnChangeContext>
      </EditorConfigContext>
    </LexicalComposer>
  )
}
