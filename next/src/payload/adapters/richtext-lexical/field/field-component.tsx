'use client'
import * as React from 'react'
import { Suspense, lazy } from 'react'

import { ShimmerEffect } from '@payloadcms/ui'

import type { SerializedEditorState } from 'lexical'
import type { AdapterProps } from '../types'
import type { RichTextFieldProps } from 'payload'
import type { EditorConfig } from './config'

const RichText = lazy(async () => await import('./field'))

export function RichTextField(
  props: {
    readonly editorConfig: EditorConfig
  } & RichTextFieldProps<SerializedEditorState, AdapterProps, any>
): React.JSX.Element {
  return (
    <Suspense fallback={<ShimmerEffect height="35vh" />}>
      <RichText {...props} />
    </Suspense>
  )
}
