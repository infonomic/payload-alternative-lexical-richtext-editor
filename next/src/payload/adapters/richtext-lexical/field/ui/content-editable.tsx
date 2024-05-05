'use client'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'

import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import cx from 'classnames'

import { useEditorConfig } from '../config'

import './content-editable.scss'

export default function LexicalContentEditable({ className }: { className?: string }): JSX.Element {
  const { config } = useEditorConfig()
  // const classes = cx('ContentEditable__root', className, {
  //   ContentEditable__with_draggable_blocks: config.options.draggableBlocks
  // })
  const classes = cx('ContentEditable__root', className)

  return <ContentEditable className={classes} />
}
