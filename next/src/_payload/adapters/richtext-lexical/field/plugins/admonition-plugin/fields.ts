import type { FormState, OptionObject } from 'payload'
import { ClientField } from 'payload'
import { AdmonitionType } from '../../nodes/admonition-node'

export const admonitionTypeOptions: OptionObject[] = [
  {
    label: 'Note',
    value: 'note'
  },
  {
    label: 'Tip',
    value: 'tip'
  },
  {
    label: 'Warning',
    value: 'warning'
  },
  {
    label: 'Danger',
    value: 'danger'
  }
]

export const getFields = (formState: FormState | undefined): ClientField[] => {
  return [
    // @ts-expect-error: type error
    {
      name: 'version',
      localized: false,
      type: 'text',
      admin: {
        hidden: true
      }
    },
    {
      name: 'title',
      localized: false,
      label: 'Title',
      required: true,
      type: 'text'
    },
    {
      name: 'admonitionType',
      localized: false,
      type: 'radio',
      label: 'Type',
      options: admonitionTypeOptions
    }
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
      valid: true
    },
    title: {
      value: data?.title,
      initialValue: data?.title,
      valid: true
    },
    admonitionType: {
      value: data?.admonitionType ?? 'note',
      initialValue: data?.admonitionType ?? 'note',
      valid: true
    }
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
    fields
  }
}
