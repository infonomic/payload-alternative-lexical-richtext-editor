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

import './content-editable.scss'

// TODO: implement an inline version of content editable for
// image captions that will not allow inserted paragraphs.
// NOTE: we disable all config checks and draggable blocks
// as in content-editable.tsx - because this version will
// appear inside caption areas for images.
export default function LexicalContentEditableInline({
  className,
}: {
  className?: string
}): JSX.Element {
  const classes = cx('ContentEditable__root', className)
  return <ContentEditable className={classes} />
}
