'use client'
import * as React from 'react'
import { Suspense, lazy } from 'react'

import { ShimmerEffect } from '@payloadcms/ui'

import type { LexicalRichTextFieldProps } from '../types'

const RichTextEditor = lazy(() =>
  import('./field-component').then((module) => ({ default: module.RichText }))
)

export function RichTextField(props: LexicalRichTextFieldProps): React.JSX.Element {
  return (
    <Suspense fallback={<ShimmerEffect height="35vh" />}>
      <RichTextEditor {...props} />
    </Suspense>
  )
}
