import { ClientField } from 'payload'
import type { FormState, OptionObject } from 'payload'
import { InlineImageData } from './types'

export const positionOptions: OptionObject[] = [
  {
    label: 'Left',
    value: 'left'
  },
  {
    label: 'Right',
    value: 'right'
  },
  {
    label: 'Full',
    value: 'full'
  },
  {
    label: 'Wide',
    value: 'wide'
  }
]

export const getFields = (collection: string, formState: FormState | undefined): ClientField[] => [
  // TODO: Investigate - would love to have used formState and RenderFields / MappedFields
  // for the Image upload field, but for some reason I could not get a return value
  // for the selected image via handleFormOnChange or handleFormOnSubmit :-(
  // {
  //   name: 'image',
  //   cellComponentProps: { name: 'image' },
  //   fieldComponentProps: {
  //     name: 'image',
  //     relationTo: collection,
  //     path: 'inline-image',
  //     required: true,
  //   },
  //   fieldIsPresentational: false,
  //   isFieldAffectingData: false,
  //   localized: false,
  //   type: 'upload',
  // },
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
    name: 'altText',
    required: true,
    label: 'Alt Text',
    localized: false,
    type: 'text'
  },
  {
    name: 'position',
    localized: false,
    label: 'Position',
    options: positionOptions,
    type: 'select'
  },
  {
    name: 'showCaption',
    label: 'Show Caption',
    localized: false,
    type: 'checkbox'
  }
]

export function getInitialState(data: InlineImageData | undefined): FormState {
  return {
    // TODO: Investigate - would love to have used formState and RenderFields / MappedFields
    // for the Image upload field, but for some reason I could not get a return value
    // for the selected image via handleFormOnChange or handleFormOnSubmit :-(
    // image: {
    //   value: '',
    //   initialValue: null,
    //   valid: true,
    // },
    version: {
      value: '',
      initialValue: '',
      valid: true
    },
    altText: {
      value: data?.altText,
      initialValue: data?.altText,
      valid: true
    },
    position: {
      value: data?.position ?? 'full',
      initialValue: data?.position ?? 'full',
      valid: true
    },
    showCaption: {
      value: data?.showCaption ?? false,
      initialValue: data?.showCaption ?? false,
      valid: true
    }
  }
}

export function isAltTextValid(value: string | undefined): boolean {
  return value != null && value.length > 0
}

export function validateFields(fields: FormState): { valid: boolean; fields: FormState } {
  let valid = true
  // Field validators
  if (isAltTextValid(fields.altText.value as string | undefined) === false) {
    fields.altText.valid = false
    valid = false
  } else {
    fields.altText.valid = true
  }
  // Return
  return {
    valid,
    fields
  }
}
