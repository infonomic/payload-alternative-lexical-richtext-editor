import type { Field, FormState } from 'payload'

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
