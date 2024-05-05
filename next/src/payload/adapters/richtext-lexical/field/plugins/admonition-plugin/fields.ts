/**
 * Copyright (c) 2024 Infonomic Co., Ltd. info@infonomic.io
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { FormState, OptionObject } from 'payload/types'
import { MappedField } from '@payloadcms/ui/utilities/buildComponentMap'
import { AdmonitionType } from '../../nodes/admonition-node'

export const admonitionTypeOptions: OptionObject[] = [
  {
    label: 'Note',
    value: 'note',
  },
  {
    label: 'Tip',
    value: 'tip',
  },
  {
    label: 'Warning',
    value: 'warning',
  },
  {
    label: 'Danger',
    value: 'danger',
  },
]

export const getMappedFields = (formState: FormState | undefined): MappedField[] => {
  return [
    {
      name: 'version',
      cellComponentProps: { name: 'version' },
      fieldComponentProps: { name: 'version' },
      fieldIsPresentational: false,
      isFieldAffectingData: true,
      localized: false,
      isHidden: true,
      type: 'text',
    },
    {
      name: 'title',
      cellComponentProps: { name: 'title' },
      fieldComponentProps: {
        name: 'title',
        labelProps: { label: 'Title' },
        errorProps: {
          showError: formState?.title?.valid === false,
          message: 'Please enter title for this admonition.',
        },
        required: true,
      },
      fieldIsPresentational: false,
      isFieldAffectingData: true,
      localized: false,
      type: 'text',
    },
    {
      name: 'admonitionType',
      cellComponentProps: { name: 'admonitionType' },
      fieldComponentProps: {
        name: 'admonitionType',
        labelProps: { label: 'Admonition Type' },
        options: admonitionTypeOptions,
      },
      fieldIsPresentational: false,
      isFieldAffectingData: true,
      localized: false,
      type: 'radio',
    },
  ]
}

export function getInitialState(data: {
  admonitionType?: AdmonitionType
  title?: string
}): FormState {
  return {
    version: {
      value: '',
      initialValue: '',
      valid: true,
    },
    title: {
      value: data?.title,
      initialValue: data?.title,
      valid: true,
    },
    admonitionType: {
      value: data?.admonitionType ?? 'note',
      initialValue: data?.admonitionType ?? 'note',
      valid: true,
    },
  }
}

export function isTitleValid(value: string | undefined): boolean {
  return value != null && value.length > 0
}

export function validateFields(fields: FormState): { valid: boolean; fields: FormState } {
  let valid = true
  // Field validators
  if (isTitleValid(fields.title.value as string | undefined) === false) {
    fields.title.valid = false
    valid = false
  } else {
    fields.title.valid = true
  }
  // Return
  return {
    valid,
    fields,
  }
}
