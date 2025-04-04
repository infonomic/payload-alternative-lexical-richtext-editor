'use client'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'

import cx from 'classnames'

import './placeholder.scss'

import { useEditorConfig } from '../config'

export function Placeholder({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  const { config } = useEditorConfig()
  // const classes = cx('Placeholder__root', className, {
  //   Placeholder__with_draggable_blocks: config.options.draggableBlocks,
  // })
  const classes = cx('Placeholder__root', className)

  return <div className={classes}>{children}</div>
}
