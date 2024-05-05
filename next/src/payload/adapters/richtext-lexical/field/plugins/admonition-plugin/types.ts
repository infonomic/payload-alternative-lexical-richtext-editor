/**
 * Copyright (c) 2024 Infonomic Co., Ltd. info@infonomic.io
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { type AdmonitionType } from '../../nodes/admonition-node/types'

export interface AdmonitionData {
  admonitionType: AdmonitionType
  title: string
}

export interface AdmonitionDrawerProps {
  isOpen: boolean
  drawerSlug: string
  onSubmit: (data: AdmonitionData) => void
  data: {
    admonitionType?: AdmonitionType
    title?: string
  }
}
