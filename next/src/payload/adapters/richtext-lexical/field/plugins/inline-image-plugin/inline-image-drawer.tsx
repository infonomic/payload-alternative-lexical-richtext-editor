'use client'
/**
 * Copyright (c) 2024 Infonomic Co., Ltd. info@infonomic.io
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useState, useRef, useMemo, useEffect } from 'react'
import { Button } from '@payloadcms/ui/elements'
import { useConfig } from '@payloadcms/ui/providers/Config'
import { UploadInput } from '@payloadcms/ui/fields/Upload'
import { Drawer } from '@payloadcms/ui/elements'
import { Form } from '@payloadcms/ui/forms/Form'
import { RenderFields } from '@payloadcms/ui/forms/RenderFields'
import { FormSubmit } from '@payloadcms/ui/forms/Submit'
import { useTranslation } from '@payloadcms/ui/providers/Translation'

import { useEditorConfig } from '../../config'
import { getMappedFields, getInitialState, validateFields } from './fields'

import { v4 as uuid } from 'uuid'

import type { FormState } from 'payload/types'
import type { InlineImageData, InlineImageDrawerProps } from './types'
import type { Position } from '../../nodes/inline-image-node'

import './inline-image-drawer.css'

const baseClass = 'inline-image-plugin--modal'

export const InlineImageDrawer: React.FC<InlineImageDrawerProps> = ({
  isOpen,
  drawerSlug,
  onSubmit,
  onClose,
  data: dataFromProps,
}) => {
  const { config } = useEditorConfig()
  const { t } = useTranslation()
  const {
    collections,
    routes: { api },
    serverURL,
  } = useConfig()

  const [synchronizedFormState, setSynchronizedFormState] = useState<FormState | undefined>(
    undefined,
  )
  const version = useRef<string>(uuid())
  const [imageValue, setImageValue] = useState<string | undefined>(dataFromProps?.id)
  const [removeImage, setRemoveImage] = useState<boolean>(false)

  function getImageValue() {
    if (removeImage === true) {
      return undefined
    } else if (imageValue != null) {
      return imageValue
    } else {
      return dataFromProps?.id
    }
  }

  const handleOnCancel = (): void => {
    setSynchronizedFormState(undefined)
    onClose()
  }

  const collection = useMemo(
    () => collections.find((coll) => coll.slug === config.inlineImageUploadCollection),
    [config.inlineImageUploadCollection, collections],
  )

  const handleOnImageChange = (value: { id: string }) => {
    if (value == null) {
      setImageValue(undefined)
      setRemoveImage(true)
    } else {
      setImageValue(value.id)
      setRemoveImage(false)
    }
  }

  async function handleFormOnChange({ formState }: { formState: FormState }): Promise<FormState> {
    return new Promise((resolve, reject) => {
      if (version.current !== formState.version.value) {
        const { fields } = validateFields(formState)
        formState.version.value = version.current = uuid()
        setSynchronizedFormState(fields)
      } else {
        version.current = uuid()
      }
      resolve(formState)
    })
  }

  const handleFormOnSubmit = (fields: FormState, data: Record<string, unknown>): void => {
    const { valid, fields: formState } = validateFields(fields)
    if (valid === false) {
      setSynchronizedFormState(formState)
    } else {
      if (onSubmit != null) {
        const submitData: InlineImageData = {
          id: getImageValue(),
          altText: data.altText as string,
          position: data.position as Position,
          showCaption: data.showCaption as boolean,
        }
        onSubmit(submitData)
      }
      setSynchronizedFormState(undefined)
      onClose()
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (synchronizedFormState == null && isOpen === true) {
      const formState = getInitialState(dataFromProps)
      setSynchronizedFormState(formState)
    }
  })

  return (
    <Drawer slug={drawerSlug} className={baseClass} title="Inline Image">
      <Form
        initialState={synchronizedFormState}
        onSubmit={handleFormOnSubmit}
        onChange={[handleFormOnChange]}
      >
        <div className="inline-image-plugin--modal-image">
          <UploadInput
            api={api}
            collection={collection}
            relationTo={config.inlineImageUploadCollection}
            serverURL={serverURL}
            required={true}
            value={getImageValue()}
            onChange={handleOnImageChange}
            labelProps={{ label: 'Image', required: true }}
          />
        </div>
        <RenderFields
          fieldMap={getMappedFields(config.inlineImageUploadCollection, synchronizedFormState)}
          forceRender
          path=""
          readOnly={false}
          schemaPath="inline-image-drawer-schema-map"
        />
        <div
          className="inline-image-plugin--modal-actions"
          data-test-id="inline-image-model-actions"
        >
          <FormSubmit>{t('general:save')}</FormSubmit>
          <Button buttonStyle="secondary" onClick={handleOnCancel}>
            {t('general:cancel')}
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}
