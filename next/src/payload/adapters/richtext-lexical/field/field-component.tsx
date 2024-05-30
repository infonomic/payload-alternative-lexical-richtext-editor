'use client'
import * as React from 'react'
import { Suspense, lazy } from 'react'

import { ShimmerEffect } from '@payloadcms/ui/elements'

import type { SerializedEditorState } from 'lexical'
import type { AdapterProps } from '../types'
import type { RichTextFieldProps } from 'payload/types'

const RichText = lazy(async () => await import('./field'))

export function RichTextField(
  props: RichTextFieldProps<SerializedEditorState, AdapterProps, any>
): JSX.Element {
  return (
    <Suspense fallback={<ShimmerEffect height="35vh" />}>
      <RichText {...props} />
    </Suspense>
  )
}
