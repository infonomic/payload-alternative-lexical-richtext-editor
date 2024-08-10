import type { FormState, OptionObject } from 'payload'
import { MappedField } from 'payload'
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
      cellComponentProps: { name: 'version', schemaPath: 'version' },
      fieldComponentProps: { name: 'version', type: 'text' },
      fieldIsPresentational: false,
      isFieldAffectingData: true,
      localized: false,
      isHidden: true,
      type: 'text',
    },
    {
      name: 'title',
      cellComponentProps: { name: 'title', schemaPath: 'title' },
      fieldComponentProps: {
        type: 'text',
        name: 'title',
        label: 'Title',
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
      cellComponentProps: { name: 'admonitionType', schemaPath: 'admonitionType' },
      fieldComponentProps: {
        name: 'admonitionType',
        type: 'radio',
        label: 'Admonition Type',
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
