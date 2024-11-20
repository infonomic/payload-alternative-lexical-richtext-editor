'use client'
/**
 * Copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * NOTE: Directly from https://github.com/payloadcms/payload/blob/main/packages/richtext-lexical/src/cell/index.tsx
 * Needed if the RichText field appears as a column in a list view for
 * a collection - which can happen if the collection field definition has a
 * richtext field as a top-level field.
 */

import React, { useEffect } from 'react'

import { createHeadlessEditor } from '@lexical/headless'
import { $getRoot } from 'lexical'

import { Nodes } from '../field/nodes'

// @ts-expect-error: ignore
import type { EditorConfig as LexicalEditorConfig } from 'lexical/LexicalEditor'
import type { LexicalRichTextCellProps } from '../types'

export const RichTextCell: React.FC<
  {
    editorConfig: LexicalEditorConfig
  } & LexicalRichTextCellProps
> = (props) => {
  const { editorConfig } = props

  const [preview, setPreview] = React.useState('Loading...')
  const { cellData } = props

  useEffect(() => {
    let dataToUse = cellData
    if (dataToUse == null) {
      setPreview('')
      return
    }

    if (dataToUse == null || typeof dataToUse !== 'object') {
      setPreview('')
      return
    }

    // If data is from Slate and not Lexical
    if (Array.isArray(dataToUse) && !('root' in dataToUse)) {
      setPreview('')
      return
    }

    // If data is from payload-plugin-lexical
    if ('jsonContent' in dataToUse) {
      setPreview('')
      return
    }

    // initialize headless editor
    const headlessEditor = createHeadlessEditor({
      namespace: editorConfig.lexical.namespace,
      nodes: Nodes,
      theme: editorConfig.lexical.theme
    })

    headlessEditor.setEditorState(headlessEditor.parseEditorState(dataToUse))

    const textContent =
      headlessEditor.getEditorState().read(() => {
        return $getRoot().getTextContent()
      }) ?? ''

    // Limiting the number of characters shown is done in a CSS rule
    setPreview(textContent)
  }, [cellData, editorConfig])

  return <span>{preview}</span>
}
