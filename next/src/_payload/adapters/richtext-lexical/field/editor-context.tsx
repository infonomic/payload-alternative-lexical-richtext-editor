'use client'
import * as React from 'react'
import { useMemo } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useEditDepth } from '@payloadcms/ui'

import { EditorConfigContext } from './config'
import { SharedHistoryContext } from './context/shared-history-context'
import { SharedOnChangeContext } from './context/shared-on-change-context'
import { Editor } from './editor'
import { Nodes } from './nodes'

import type { ClientEditorConfig } from './config'
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
  composerKey: string
  editorConfig: ClientEditorConfig
  fieldProps: RichTextFieldClientProps<SerializedEditorState, AdapterProps, any>
  onChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void
  readOnly: boolean
  value: SerializedEditorState
}): React.JSX.Element {
  const { composerKey, editorConfig, onChange, fieldProps, readOnly, value } = props

  // useMemo for the initialConfig that depends on readOnly and value
  const initialConfig = useMemo<InitialConfigType>(() => {
    return {
      editable: readOnly !== true,
      editorState: value != null ? JSON.stringify(value) : undefined,
      namespace: editorConfig.lexical.namespace,
      nodes: [...Nodes],
      onError: (error: Error) => {
        throw error
      },
      theme: editorConfig.lexical.theme,
    }
    // Important: do not add readOnly and value to the dependencies array. This will cause the entire lexical editor to re-render if the document is saved, which will
    // cause the editor to lose focus.
  }, [editorConfig])
  
  
  if (initialConfig == null) {
    return <p>Loading...</p>
  }

  return (
    <LexicalComposer initialConfig={initialConfig} key={composerKey + initialConfig.editable} >
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
