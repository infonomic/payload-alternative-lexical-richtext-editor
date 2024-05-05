import type { SerializedEditorState } from 'lexical'
import type { Validate } from 'payload/types'

import defaultValue from '../field/config/editor-default-value'
import { deepEqual } from '../field/utils/deepEqual'

export const richTextValidate: Validate<
  SerializedEditorState,
  SerializedEditorState,
  unknown,
  any
> = async (value, options) => {
  const { t, required } = options

  if (required) {
    if (
      value == null ||
      value?.root?.children == null ||
      value?.root?.children?.length == 0 ||
      deepEqual(value, defaultValue) == true
    ) {
      return t('validation:required')
    }
  }

  return true
}
