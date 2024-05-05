/**
 * Copyright (c) 2024 Infonomic Co., Ltd. info@infonomic.io
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { Field, FormState } from 'payload/types'

import type { Position } from '../../nodes/inline-image-node/types'

export interface InlineImageData {
  id?: string
  altText?: string
  position?: Position
  showCaption?: boolean
}

export interface InlineImageDrawerProps {
  isOpen: boolean
  drawerSlug: string
  onClose: () => void
  onSubmit: (data: InlineImageData) => void
  data?: InlineImageData
}
